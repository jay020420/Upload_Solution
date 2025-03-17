// controllers/productController.js
const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Marketplace = require('../models/marketplaceModel');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Utils');
const { processExcelFile } = require('../utils/excelUtils');
const { validateProduct } = require('../utils/validationUtils');

// @desc    모든 상품 조회 (필터링, 정렬, 페이징 지원)
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;
  
  // 필터링 조건 구성
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } }
        ]
      }
    : {};
    
  // 카테고리 필터
  if (req.query.category) {
    keyword.categories = req.query.category;
  }
  
  // 상태 필터
  if (req.query.status) {
    keyword.status = req.query.status;
  }
  
  // 마켓플레이스 필터
  if (req.query.marketplace) {
    keyword['marketplaces.marketplaceId'] = req.query.marketplace;
  }
  
  // 가격 범위 필터
  if (req.query.minPrice && req.query.maxPrice) {
    keyword.regularPrice = { 
      $gte: Number(req.query.minPrice), 
      $lte: Number(req.query.maxPrice) 
    };
  }
  
  // 정렬 옵션
  const sortOption = {};
  if (req.query.sortField) {
    sortOption[req.query.sortField] = req.query.sortOrder === 'desc' ? -1 : 1;
  } else {
    sortOption.createdAt = -1; // 기본 정렬: 최신순
  }

  const count = await Product.countDocuments(keyword);
  const products = await Product.find(keyword)
    .populate('categories', 'name')
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    상품 ID로 상품 조회
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('categories', 'name')
    .populate('marketplaces.marketplaceId', 'name logo');

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('상품을 찾을 수 없습니다');
  }
});

// @desc    새 상품 생성
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
  // 상품 데이터 유효성 검사
  const validationErrors = validateProduct(req.body);
  if (validationErrors.length > 0) {
    res.status(400);
    throw new Error(`유효성 검사 오류: ${validationErrors.join(', ')}`);
  }

  // 이미지 처리
  const imagePromises = [];
  if (req.files && req.files.images) {
    const images = Array.isArray(req.files.images) 
      ? req.files.images 
      : [req.files.images];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const uploadPromise = uploadToS3(image, 'products');
      imagePromises.push(uploadPromise);
    }
  }

  const uploadedImages = await Promise.all(imagePromises);
  
  // 이미지 URL 구성
  const productImages = uploadedImages.map((img, index) => ({
    url: img.Location,
    order: index,
    isMain: index === 0 // 첫 번째 이미지를 대표 이미지로 설정
  }));

  // 상품 생성
  const product = new Product({
    ...req.body,
    images: productImages,
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    상품 정보 업데이트
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('상품을 찾을 수 없습니다');
  }

  // 상품 데이터 유효성 검사
  const validationErrors = validateProduct(req.body);
  if (validationErrors.length > 0) {
    res.status(400);
    throw new Error(`유효성 검사 오류: ${validationErrors.join(', ')}`);
  }

  // 새 이미지 업로드 처리
  const imagePromises = [];
  if (req.files && req.files.images) {
    const images = Array.isArray(req.files.images) 
      ? req.files.images 
      : [req.files.images];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const uploadPromise = uploadToS3(image, 'products');
      imagePromises.push(uploadPromise);
    }
  }

  const uploadedImages = await Promise.all(imagePromises);
  
  // 기존 이미지 + 새 이미지 구성
  let updatedImages = [...(product.images || [])];
  
  // 요청에 삭제할 이미지 ID 배열이 있으면 처리
  if (req.body.imagesToDelete && Array.isArray(req.body.imagesToDelete)) {
    // S3에서 이미지 삭제
    for (const imgId of req.body.imagesToDelete) {
      const imageToDelete = product.images.find(img => img._id.toString() === imgId);
      if (imageToDelete) {
        await deleteFromS3(imageToDelete.url);
      }
    }
    
    // 이미지 배열에서 제거
    updatedImages = updatedImages.filter(
      img => !req.body.imagesToDelete.includes(img._id.toString())
    );
  }
  
  // 새 이미지 추가
  const newImages = uploadedImages.map((img, index) => ({
    url: img.Location,
    order: updatedImages.length + index,
    isMain: updatedImages.length === 0 && index === 0 // 이미지가 없었다면 첫 번째 이미지를 대표로
  }));
  
  updatedImages = [...updatedImages, ...newImages];
  
  // 이미지 순서 재정렬
  if (req.body.imageOrders && typeof req.body.imageOrders === 'object') {
    for (const [imgId, order] of Object.entries(req.body.imageOrders)) {
      const imgIndex = updatedImages.findIndex(img => img._id.toString() === imgId);
      if (imgIndex !== -1) {
        updatedImages[imgIndex].order = Number(order);
      }
    }
    updatedImages.sort((a, b) => a.order - b.order);
  }
  
  // 대표 이미지 설정
  if (req.body.mainImageId) {
    updatedImages = updatedImages.map(img => ({
      ...img,
      isMain: img._id.toString() === req.body.mainImageId
    }));
  }

  // 상품 업데이트
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      images: updatedImages,
      updatedBy: req.user._id
    },
    { new: true, runValidators: true }
  );

  res.json(updatedProduct);
});

// @desc    상품 삭제
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('상품을 찾을 수 없습니다');
  }

  // 상품 이미지 S3에서 삭제
  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      await deleteFromS3(image.url);
    }
  }

  await product.remove();
  res.json({ message: '상품이 삭제되었습니다' });
});

// @desc    대량 상품 업로드
// @route   POST /api/products/bulk-upload
// @access  Private
const bulkUploadProducts = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.file) {
    res.status(400);
    throw new Error('업로드할 파일이 없습니다');
  }

  const file = req.files.file;
  
  // 지원하는 파일 형식 확인
  const fileExt = file.name.split('.').pop().toLowerCase();
  if (!['xlsx', 'csv'].includes(fileExt)) {
    res.status(400);
    throw new Error('지원하지 않는 파일 형식입니다. XLSX 또는 CSV 파일을 업로드해주세요.');
  }

  try {
    // 엑셀 또는 CSV 파일 처리
    const processedData = await processExcelFile(file.tempFilePath, fileExt);
    
    // 데이터 유효성 검사
    const validationErrors = [];
    processedData.forEach((item, index) => {
      const errors = validateProduct(item);
      if (errors.length > 0) {
        validationErrors.push(`행 ${index + 1}: ${errors.join(', ')}`);
      }
    });
    
    if (validationErrors.length > 0) {
      res.status(400);
      throw new Error(`유효성 검사 오류:\n${validationErrors.join('\n')}`);
    }
    
    // 대량 추가 작업 시작 - 비동기 처리
    // 실제 구현에서는 작업 큐(Bull 등)를 사용하여 백그라운드 처리 권장
    const insertResult = await Product.insertMany(
      processedData.map(item => ({
        ...item,
        createdBy: req.user._id,
        updatedBy: req.user._id
      }))
    );
    
    res.status(201).json({
      success: true,
      message: `${insertResult.length}개의 상품이 업로드되었습니다.`,
      count: insertResult.length
    });
  } catch (error) {
    res.status(500);
    throw new Error(`파일 처리 중 오류가 발생했습니다: ${error.message}`);
  }
});

// @desc    상품을 마켓플레이스와 동기화
// @route   POST /api/products/:id/sync/:marketplaceId
// @access  Private
const syncProductToMarketplace = asyncHandler(async (req, res) => {
  const { id, marketplaceId } = req.params;
  
  // 상품과 마켓플레이스 존재 확인
  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error('상품을 찾을 수 없습니다');
  }
  
  const marketplace = await Marketplace.findById(marketplaceId);
  if (!marketplace) {
    res.status(404);
    throw new Error('마켓플레이스를 찾을 수 없습니다');
  }
  
  try {
    // 마켓플레이스별 연동 모듈 임포트 (실제 구현시 모듈화 필요)
    let marketplaceModule;
    switch (marketplace.code) {
      case 'naver':
        marketplaceModule = require('../marketplaces/naverModule');
        break;
      case 'coupang':
        marketplaceModule = require('../marketplaces/coupangModule');
        break;
      // 추가 마켓플레이스...
      default:
        throw new Error(`지원하지 않는 마켓플레이스입니다: ${marketplace.code}`);
    }
    
    // 마켓플레이스 연동 정보 준비
    const marketplaceData = {
      ...req.body, // 마켓별 추가 파라미터
      product: product
    };
    
    // 마켓플레이스 API 호출
    const syncResult = await marketplaceModule.syncProduct(marketplaceData);
    
    // 상품 마켓플레이스 연동 정보 업데이트
    const existingMarketplaceIndex = product.marketplaces.findIndex(
      m => m.marketplaceId.toString() === marketplaceId
    );
    
    if (existingMarketplaceIndex !== -1) {
      // 기존 마켓플레이스 정보 업데이트
      product.marketplaces[existingMarketplaceIndex] = {
        ...product.marketplaces[existingMarketplaceIndex],
        externalProductId: syncResult.externalProductId,
        status: syncResult.status,
        lastSyncDate: new Date(),
        errors: syncResult.errors || []
      };
    } else {
      // 새 마켓플레이스 정보 추가
      product.marketplaces.push({
        marketplaceId,
        externalProductId: syncResult.externalProductId,
        status: syncResult.status,
        lastSyncDate: new Date(),
        errors: syncResult.errors || []
      });
    }
    
    await product.save();
    
    res.json({
      success: true,
      message: `상품이 ${marketplace.name}에 성공적으로 동기화되었습니다.`,
      syncResult
    });
  } catch (error) {
    res.status(500);
    throw new Error(`마켓플레이스 동기화 중 오류가 발생했습니다: ${error.message}`);
  }
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUploadProducts,
  syncProductToMarketplace
};