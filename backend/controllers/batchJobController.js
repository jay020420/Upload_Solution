// controllers/batchJobController.js
const asyncHandler = require('express-async-handler');
const BatchJob = require('../models/batchJobModel');
const Product = require('../models/productModel');
const { processProductPriceUpdate, processProductStockUpdate, processProductStatusUpdate, processProductMarketplaceSync, processProductCategoryUpdate, processProductDelete } = require('../utils/batchJobUtils');

// @desc    모든 배치 작업 조회 (필터링, 정렬, 페이징 지원)
// @route   GET /api/batch-jobs
// @access  Private
const getBatchJobs = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;
  
  // 필터링 조건 구성
  const filter = {};
  
  // 타입 필터
  if (req.query.type) {
    filter.type = req.query.type;
  }
  
  // 상태 필터
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  // 사용자 필터 (관리자가 아니면 자신의 작업만 볼 수 있음)
  if (!req.user.isAdmin) {
    filter.createdBy = req.user._id;
  } else if (req.query.userId) {
    filter.createdBy = req.query.userId;
  }
  
  // 날짜 범위 필터
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }
  
  // 정렬 옵션
  const sortOptions = {};
  if (req.query.sortField) {
    sortOptions[req.query.sortField] = req.query.sortOrder === 'desc' ? -1 : 1;
  } else {
    sortOptions.createdAt = -1; // 기본 정렬: 최신순
  }
  
  // 작업 수 조회
  const count = await BatchJob.countDocuments(filter);
  
  // 작업 목록 조회
  const jobs = await BatchJob.find(filter)
    .populate('createdBy', 'name email')
    .sort(sortOptions)
    .skip(pageSize * (page - 1))
    .limit(pageSize);
  
  res.json({
    jobs,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    배치 작업 ID로 조회
// @route   GET /api/batch-jobs/:id
// @access  Private
const getBatchJobById = asyncHandler(async (req, res) => {
  const job = await BatchJob.findById(req.params.id)
    .populate('createdBy', 'name email');
  
  // 본인 작업 또는 관리자만 조회 가능
  if (job && (job.createdBy._id.toString() === req.user._id.toString() || req.user.isAdmin)) {
    res.json(job);
  } else {
    res.status(404);
    throw new Error('배치 작업을 찾을 수 없습니다');
  }
});

// @desc    새 배치 작업 생성
// @route   POST /api/batch-jobs
// @access  Private
const createBatchJob = asyncHandler(async (req, res) => {
  const { name, type, description, params } = req.body;
  
  if (!name || !type) {
    res.status(400);
    throw new Error('작업 이름과 타입은 필수 항목입니다');
  }
  
  // 작업 항목(items) 구성
  let items = [];
  
  switch (type) {
    case 'product_price_update':
    case 'product_stock_update':
    case 'product_status_update':
    case 'product_marketplace_sync':
    case 'product_category_update':
    case 'product_delete':
      // 상품 ID 배열 또는 필터 검증
      if (!params.productIds && !params.filter) {
        res.status(400);
        throw new Error('상품 ID 배열 또는 필터 조건이 필요합니다');
      }
      
      // ID 배열이 제공된 경우
      if (params.productIds && Array.isArray(params.productIds)) {
        items = params.productIds.map(productId => ({
          itemId: productId,
          itemType: 'Product',
          status: 'pending'
        }));
      }
      // 필터 조건이 제공된 경우
      else if (params.filter) {
        const filter = typeof params.filter === 'string' ? JSON.parse(params.filter) : params.filter;
        const products = await Product.find(filter).select('_id');
        
        if (products.length === 0) {
          res.status(400);
          throw new Error('조건에 맞는 상품이 없습니다');
        }
        
        items = products.map(product => ({
          itemId: product._id,
          itemType: 'Product',
          status: 'pending'
        }));
      }
      break;
      
    case 'custom':
      // 사용자 정의 작업의 경우 items 직접 제공
      if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
        res.status(400);
        throw new Error('작업 항목(items)이 필요합니다');
      }
      
      items = req.body.items.map(item => ({
        ...item,
        status: 'pending'
      }));
      break;
      
    default:
      res.status(400);
      throw new Error('지원하지 않는 작업 타입입니다');
  }
  
  // 배치 작업 생성
  const batchJob = new BatchJob({
    name,
    description,
    type,
    params: params || {},
    items,
    priority: req.body.priority || 1,
    status: 'pending',
    progress: {
      total: items.length,
      processed: 0,
      succeeded: 0,
      failed: 0
    },
    createdBy: req.user._id
  });
  
  // 로그 추가
  batchJob.addLog(`배치 작업 생성 (총 ${items.length}개 항목)`, 'info');
  
  // 작업 저장
  const createdJob = await batchJob.save();
  
  // 작업 바로 시작 옵션이 있는 경우
  if (req.body.startImmediately) {
    // 실제 구현 시에는 작업 큐에 추가하는 방식으로 구현
    // 여기서는 즉시 실행 방식으로 구현 (예시)
    startBatchJob(createdJob._id);
  }
  
  res.status(201).json(createdJob);
});

// @desc    배치 작업 상태 업데이트 (시작/일시정지/재개/취소)
// @route   PUT /api/batch-jobs/:id/status
// @access  Private
const updateBatchJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status || !['processing', 'paused', 'cancelled'].includes(status)) {
    res.status(400);
    throw new Error('유효한 상태 값이 필요합니다 (processing, paused, cancelled)');
  }
  
  const job = await BatchJob.findById(req.params.id);
  
  if (!job) {
    res.status(404);
    throw new Error('배치 작업을 찾을 수 없습니다');
  }
  
  // 본인 작업 또는 관리자만 업데이트 가능
  if (job.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('다른 사용자의 작업을 수정할 권한이 없습니다');
  }
  
  // 이미 완료되거나 실패한 작업은 상태 변경 불가
  if (['completed', 'failed'].includes(job.status)) {
    res.status(400);
    throw new Error(`이미 ${job.status === 'completed' ? '완료' : '실패'}된 작업의 상태를 변경할 수 없습니다`);
  }
  
  // 상태에 따른 처리
  switch (status) {
    case 'processing':
      if (job.status === 'pending' || job.status === 'paused') {
        job.status = 'processing';
        job.addLog(`작업 ${job.status === 'pending' ? '시작' : '재개'}됨`, 'info');
        
        if (job.status === 'pending') {
          // 실제 구현 시에는 작업 큐에 추가
          setTimeout(() => {
            startBatchJob(job._id);
          }, 0);
        }
      } else {
        res.status(400);
        throw new Error('현재 상태에서 이 작업을 시작할 수 없습니다');
      }
      break;
      
    case 'paused':
      if (job.status === 'processing') {
        await job.pause();
      } else {
        res.status(400);
        throw new Error('처리 중인 작업만 일시정지할 수 있습니다');
      }
      break;
      
    case 'cancelled':
      if (['pending', 'processing', 'paused'].includes(job.status)) {
        await job.cancel();
      } else {
        res.status(400);
        throw new Error('이미 완료되거나 실패한 작업은 취소할 수 없습니다');
      }
      break;
  }
  
  const updatedJob = await job.save();
  res.json(updatedJob);
});

// @desc    배치 작업 삭제
// @route   DELETE /api/batch-jobs/:id
// @access  Private/Admin
const deleteBatchJob = asyncHandler(async (req, res) => {
  const job = await BatchJob.findById(req.params.id);
  
  if (!job) {
    res.status(404);
    throw new Error('배치 작업을 찾을 수 없습니다');
  }
  
  // 관리자만 삭제 가능
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('배치 작업을 삭제할 권한이 없습니다');
  }
  
  await job.remove();
  res.json({ message: '배치 작업이 삭제되었습니다' });
});

// @desc    배치 작업 항목 상세 조회
// @route   GET /api/batch-jobs/:id/items
// @access  Private
const getBatchJobItems = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pageSize = Number(req.query.pageSize) || 50;
  const page = Number(req.query.page) || 1;
  const status = req.query.status; // 특정 상태의 항목만 필터링 (optional)
  
  const job = await BatchJob.findById(id);
  
  if (!job) {
    res.status(404);
    throw new Error('배치 작업을 찾을 수 없습니다');
  }
  
  // 본인 작업 또는 관리자만 조회 가능
  if (job.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('다른 사용자의 작업을 조회할 권한이 없습니다');
  }
  
  // 항목 필터링 및 페이징
  let filteredItems = job.items;
  
  if (status) {
    filteredItems = filteredItems.filter(item => item.status === status);
  }
  
  const total = filteredItems.length;
  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);
  
  // 항목 ID로 실제 데이터 조회 (Product 타입만 처리)
  const productIds = paginatedItems
    .filter(item => item.itemType === 'Product')
    .map(item => item.itemId);
  
  let productsData = {};
  
  if (productIds.length > 0) {
    const products = await Product.find({
      _id: { $in: productIds }
    }).select('name sku images');
    
    productsData = products.reduce((acc, product) => {
      acc[product._id] = {
        name: product.name,
        sku: product.sku,
        image: product.images?.length > 0 ? product.images[0].url : null
      };
      return acc;
    }, {});
  }
  
  // 항목 데이터 구성
  const enrichedItems = paginatedItems.map(item => {
    let additionalData = {};
    
    if (item.itemType === 'Product' && productsData[item.itemId]) {
      additionalData = productsData[item.itemId];
    }
    
    return {
      ...item.toObject(),
      ...additionalData
    };
  });
  
  res.json({
    items: enrichedItems,
    page,
    pages: Math.ceil(total / pageSize),
    total
  });
});

// @desc    배치 작업 로그 조회
// @route   GET /api/batch-jobs/:id/logs
// @access  Private
const getBatchJobLogs = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const job = await BatchJob.findById(id).select('logs createdBy');
  
  if (!job) {
    res.status(404);
    throw new Error('배치 작업을 찾을 수 없습니다');
  }
  
  // 본인 작업 또는 관리자만 조회 가능
  if (job.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('다른 사용자의 작업 로그를 조회할 권한이 없습니다');
  }
  
  res.json(job.logs);
});

// 배치 작업 실행 함수 (실제로는 작업 큐에서 처리)
const startBatchJob = async (jobId) => {
  try {
    const job = await BatchJob.findById(jobId);
    
    if (!job || job.status !== 'pending' && job.status !== 'processing') {
      return;
    }
    
    // 작업 상태 업데이트
    job.status = 'processing';
    job.startedAt = new Date();
    job.addLog('배치 작업 처리 시작', 'info');
    await job.save();
    
    // 작업 타입에 따른 처리 함수 선택
    let processFn;
    
    switch (job.type) {
      case 'product_price_update':
        processFn = processProductPriceUpdate;
        break;
      case 'product_stock_update':
        processFn = processProductStockUpdate;
        break;
      case 'product_status_update':
        processFn = processProductStatusUpdate;
        break;
      case 'product_marketplace_sync':
        processFn = processProductMarketplaceSync;
        break;
      case 'product_category_update':
        processFn = processProductCategoryUpdate;
        break;
      case 'product_delete':
        processFn = processProductDelete;
        break;
      default:
        job.status = 'failed';
        job.addLog(`지원하지 않는 작업 타입: ${job.type}`, 'error');
        await job.save();
        return;
    }
    
    // 항목 처리 (병렬 처리시 주의)
    // 실제 구현에서는 throttling 등을 통해 부하 조절 필요
    const concurrencyLimit = 5; // 동시 처리 개수
    let activePromises = 0;
    let itemIndex = 0;
    
    const processNextBatch = async () => {
      const batch = [];
      
      // 처리할 항목 수집 (대기 중인 항목)
      while (batch.length < concurrencyLimit && itemIndex < job.items.length) {
        const item = job.items[itemIndex];
        if (item.status === 'pending') {
          batch.push(item);
          
          // 상태 업데이트
          job.items[itemIndex].status = 'processing';
        }
        itemIndex++;
      }
      
      // 작업 상태 업데이트
      await job.save();
      
      if (batch.length === 0) {
        // 모든 항목 처리 완료
        if (activePromises === 0) {
          await job.updateProgress();
          console.log(`배치 작업 ${job._id} 완료: ${job.progress.succeeded}/${job.progress.total} 성공`);
        }
        return;
      }
      
      // 배치 처리
      activePromises += batch.length;
      
      const itemPromises = batch.map(async (item) => {
        try {
          // 작업 처리
          const startTime = Date.now();
          const result = await processFn(item.itemId, job.params);
          const processingTime = Date.now() - startTime;
          
          // 작업 결과 업데이트
          await BatchJob.findOneAndUpdate(
            { _id: job._id, 'items._id': item._id },
            {
              $set: {
                'items.$.status': 'completed',
                'items.$.result.success': result.success,
                'items.$.result.message': result.message,
                'items.$.result.data': result.data,
                'items.$.processingTime': processingTime,
                'items.$.lastProcessedAt': new Date()
              }
            }
          );
        } catch (error) {
          console.error(`배치 작업 항목 처리 오류 (${job._id}, 항목: ${item._id}):`, error);
          
          // 오류 업데이트
          await BatchJob.findOneAndUpdate(
            { _id: job._id, 'items._id': item._id },
            {
              $set: {
                'items.$.status': 'failed',
                'items.$.result.success': false,
                'items.$.result.message': error.message,
                'items.$.errors': [error.message],
                'items.$.lastProcessedAt': new Date()
              }
            }
          );
        } finally {
          activePromises--;
          
          // 최신 상태로 작업 진행률 업데이트
          const updatedJob = await BatchJob.findById(job._id);
          if (updatedJob) {
            await updatedJob.updateProgress();
          }
        }
      });
      
      // 배치 처리 완료 대기
      await Promise.all(itemPromises);
      
      // 다음 배치 처리 (작업이 취소되지 않은 경우)
      const currentJob = await BatchJob.findById(job._id);
      if (currentJob && ['processing', 'paused'].includes(currentJob.status)) {
        if (currentJob.status === 'processing') {
          await processNextBatch();
        }
      }
    };
    
    // 배치 처리 시작
    await processNextBatch();
    
  } catch (error) {
    console.error(`배치 작업 실행 오류 (${jobId}):`, error);
    
    // 작업 상태 업데이트
    const job = await BatchJob.findById(jobId);
    if (job) {
      job.status = 'failed';
      job.addLog(`작업 실행 오류: ${error.message}`, 'error');
      await job.save();
    }
  }
};

module.exports = {
  getBatchJobs,
  getBatchJobById,
  createBatchJob,
  updateBatchJobStatus,
  deleteBatchJob,
  getBatchJobItems,
  getBatchJobLogs
};