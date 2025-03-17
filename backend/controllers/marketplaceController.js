// controllers/marketplaceController.js
const asyncHandler = require('express-async-handler');
const Marketplace = require('../models/marketplaceModel');
const Category = require('../models/categoryModel');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Utils');

// @desc    모든 마켓플레이스 조회
// @route   GET /api/marketplaces
// @access  Private
const getMarketplaces = asyncHandler(async (req, res) => {
  // 쿼리 파라미터
  const { active } = req.query;
  
  // 필터 조건
  const filter = {};
  if (active !== undefined) {
    filter.isActive = active === 'true';
  }
  
  // 마켓플레이스 목록 조회
  const marketplaces = await Marketplace.find(filter)
    .select('-syncLogs')
    .sort({ name: 1 });
  
  res.json(marketplaces);
});

// @desc    마켓플레이스 ID로 조회
// @route   GET /api/marketplaces/:id
// @access  Private
const getMarketplaceById = asyncHandler(async (req, res) => {
  const marketplace = await Marketplace.findById(req.params.id)
    .select('-syncLogs');
  
  if (marketplace) {
    res.json(marketplace);
  } else {
    res.status(404);
    throw new Error('마켓플레이스를 찾을 수 없습니다');
  }
});

// @desc    새 마켓플레이스 생성
// @route   POST /api/marketplaces
// @access  Private/Admin
const createMarketplace = asyncHandler(async (req, res) => {
  // 필수 필드 확인
  const { name, code } = req.body;
  
  if (!name || !code) {
    res.status(400);
    throw new Error('마켓플레이스 이름과 코드는 필수 항목입니다');
  }
  
  // 마켓플레이스 코드 중복 확인
  const existingMarketplace = await Marketplace.findOne({ code });
  if (existingMarketplace) {
    res.status(400);
    throw new Error(`'${code}' 코드를 가진 마켓플레이스가 이미 존재합니다`);
  }
  
  // 로고 이미지 처리
  let logoUrl = '';
  if (req.files && req.files.logo) {
    const uploadResult = await uploadToS3(req.files.logo, 'marketplaces');
    logoUrl = uploadResult.Location;
  }
  
  // 마켓플레이스 생성
  const marketplace = new Marketplace({
    name,
    code,
    description: req.body.description || '',
    logo: logoUrl,
    website: req.body.website || '',
    isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    apiBaseUrl: req.body.apiBaseUrl || '',
    apiVersion: req.body.apiVersion || '',
    authType: req.body.authType || 'apikey',
    features: req.body.features || {
      productSync: true,
      orderSync: true,
      inventorySync: true,
      categorySync: true,
      autoFulfillment: false
    },
    createdBy: req.user._id,
    updatedBy: req.user._id
  });
  
  const createdMarketplace = await marketplace.save();
  res.status(201).json(createdMarketplace);
});

// @desc    마켓플레이스 정보 업데이트
// @route   PUT /api/marketplaces/:id
// @access  Private/Admin
const updateMarketplace = asyncHandler(async (req, res) => {
  const marketplace = await Marketplace.findById(req.params.id);
  
  if (!marketplace) {
    res.status(404);
    throw new Error('마켓플레이스를 찾을 수 없습니다');
  }
  
  // 로고 이미지 처리
  let logoUrl = marketplace.logo;
  if (req.files && req.files.logo) {
    // 기존 로고 삭제
    if (logoUrl) {
      await deleteFromS3(logoUrl);
    }
    
    // 새 로고 업로드
    const uploadResult = await uploadToS3(req.files.logo, 'marketplaces');
    logoUrl = uploadResult.Location;
  }
  
  // 마켓플레이스 업데이트
  marketplace.name = req.body.name || marketplace.name;
  marketplace.description = req.body.description || marketplace.description;
  marketplace.logo = logoUrl;
  marketplace.website = req.body.website || marketplace.website;
  marketplace.isActive = req.body.isActive !== undefined ? req.body.isActive : marketplace.isActive;
  marketplace.apiBaseUrl = req.body.apiBaseUrl || marketplace.apiBaseUrl;
  marketplace.apiVersion = req.body.apiVersion || marketplace.apiVersion;
  marketplace.authType = req.body.authType || marketplace.authType;
  
  // 기능 업데이트 (제공된 경우)
  if (req.body.features) {
    marketplace.features = {
      ...marketplace.features,
      ...req.body.features
    };
  }
  
  marketplace.updatedBy = req.user._id;
  
  const updatedMarketplace = await marketplace.save();
  res.json(updatedMarketplace);
});

// @desc    마켓플레이스 삭제
// @route   DELETE /api/marketplaces/:id
// @access  Private/Admin
const deleteMarketplace = asyncHandler(async (req, res) => {
  const marketplace = await Marketplace.findById(req.params.id);
  
  if (!marketplace) {
    res.status(404);
    throw new Error('마켓플레이스를 찾을 수 없습니다');
  }
  
  // 로고 이미지 삭제
  if (marketplace.logo) {
    await deleteFromS3(marketplace.logo);
  }
  
  await marketplace.remove();
  res.json({ message: '마켓플레이스가 삭제되었습니다' });
});

// @desc    마켓플레이스 계정 추가
// @route   POST /api/marketplaces/:id/accounts
// @access  Private
const addMarketplaceAccount = asyncHandler(async (req, res) => {
  const marketplace = await Marketplace.findById(req.params.id);
  
  if (!marketplace) {
    res.status(404);
    throw new Error('마켓플레이스를 찾을 수 없습니다');
  }
  
  // 계정 이름 중복 확인
  const { name } = req.body;
  const existingAccount = marketplace.accounts.find(acc => acc.name === name);
  
  if (existingAccount) {
    res.status(400);
    throw new Error(`'${name}' 이름을 가진 계정이 이미 존재합니다`);
  }
  
  // additionalInfo 처리
  const additionalInfo = new Map();
  if (req.body.additionalInfo && typeof req.body.additionalInfo === 'object') {
    Object.entries(req.body.additionalInfo).forEach(([key, value]) => {
      additionalInfo.set(key, value);
    });
  }
  
  // 새 계정 추가
  marketplace.accounts.push({
    name,
    isDefault: req.body.isDefault || false,
    apiKey: req.body.apiKey || '',
    apiSecret: req.body.apiSecret || '',
    accessToken: req.body.accessToken || '',
    refreshToken: req.body.refreshToken || '',
    tokenExpiry: req.body.tokenExpiry || null,
    shopId: req.body.shopId || '',
    sellerId: req.body.sellerId || '',
    additionalInfo,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true
  });
  
  // 기본 계정 관리
  if (req.body.isDefault) {
    // 새 계정이 기본 계정인 경우 다른 계정들의 기본 상태 해제
    marketplace.accounts.forEach(acc => {
      if (acc.name !== name) {
        acc.isDefault = false;
      }
    });
  }
  
  marketplace.updatedBy = req.user._id;
  
  const updatedMarketplace = await marketplace.save();
  res.status(201).json(updatedMarketplace.accounts);
});

// @desc    마켓플레이스 계정 업데이트
// @route   PUT /api/marketplaces/:id/accounts/:accountId
// @access  Private
const updateMarketplaceAccount = asyncHandler(async (req, res) => {
  const marketplace = await Marketplace.findById(req.params.id);
  
  if (!marketplace) {
    res.status(404);
    throw new Error('마켓플레이스를 찾을 수 없습니다');
  }
  
  // 계정 찾기
  const account = marketplace.accounts.id(req.params.accountId);
  
  if (!account) {
    res.status(404);
    throw new Error('계정을 찾을 수 없습니다');
  }
  
  // 계정 이름 중복 확인 (이름이 변경되는 경우)
  if (req.body.name && req.body.name !== account.name) {
    const existingAccount = marketplace.accounts.find(acc => 
      acc._id.toString() !== req.params.accountId && acc.name === req.body.name
    );
    
    if (existingAccount) {
      res.status(400);
      throw new Error(`'${req.body.name}' 이름을 가진 계정이 이미 존재합니다`);
    }
    
    account.name = req.body.name;
  }
  
  // 계정 정보 업데이트
  account.apiKey = req.body.apiKey || account.apiKey;
  account.apiSecret = req.body.apiSecret || account.apiSecret;
  account.accessToken = req.body.accessToken || account.accessToken;
  account.refreshToken = req.body.refreshToken || account.refreshToken;
  account.tokenExpiry = req.body.tokenExpiry || account.tokenExpiry;
  account.shopId = req.body.shopId || account.shopId;
  account.sellerId = req.body.sellerId || account.sellerId;
  account.isActive = req.body.isActive !== undefined ? req.body.isActive : account.isActive;
  
  // additionalInfo 처리
  if (req.body.additionalInfo && typeof req.body.additionalInfo === 'object') {
    Object.entries(req.body.additionalInfo).forEach(([key, value]) => {
      account.additionalInfo.set(key, value);
    });
  }
  
  // 기본 계정 관리
  if (req.body.isDefault && !account.isDefault) {
    // 해당 계정이 기본 계정으로 변경되는 경우 다른 계정들의 기본 상태 해제
    marketplace.accounts.forEach(acc => {
      if (acc._id.toString() !== req.params.accountId) {
        acc.isDefault = false;
      }
    });
    account.isDefault = true;
  } else if (req.body.isDefault === false && account.isDefault) {
    // 기본 계정이 해제되는 경우, 다른 계정을 기본 계정으로 설정
    if (marketplace.accounts.length > 1) {
      const otherAccount = marketplace.accounts.find(acc => 
        acc._id.toString() !== req.params.accountId
      );
      if (otherAccount) {
        otherAccount.isDefault = true;
      }
    }
    account.isDefault = false;
  }
  
  marketplace.updatedBy = req.user._id;
  
  const updatedMarketplace = await marketplace.save();
  res.json(account);
});

// @desc    마켓플레이스 계정 삭제
// @route   DELETE /api/marketplaces/:id/accounts/:accountId
// @access  Private
const deleteMarketplaceAccount = asyncHandler(async (req, res) => {
  const marketplace = await Marketplace.findById(req.params.id);
  
  if (!marketplace) {
    res.status(404);
    throw new Error('마켓플레이스를 찾을 수 없습니다');
  }
  
  // 계정 찾기
  const account = marketplace.accounts.id(req.params.accountId);
  
  if (!account) {
    res.status(404);
    throw new Error('계정을 찾을 수 없습니다');
  }
  
  // 기본 계정이 삭제되는 경우 다른 계정을 기본 계정으로 설정
  if (account.isDefault && marketplace.accounts.length > 1) {
    const otherAccount = marketplace.accounts.find(acc => 
      acc._id.toString() !== req.params.accountId
    );
    if (otherAccount) {
      otherAccount.isDefault = true;
    }
  }
  
  // 계정 삭제
  account.remove();
  
  marketplace.updatedBy = req.user._id;
  
  await marketplace.save();
  res.json({ message: '계정이 삭제되었습니다' });
});

// @desc    카테고리 매핑 추가/업데이트
// @route   POST /api/marketplaces/:id/category-mappings
// @access  Private
const updateCategoryMappings = asyncHandler(async (req, res) => {
  const marketplace = await Marketplace.findById(req.params.id);
  
  if (!marketplace) {
    res.status(404);
    throw new Error('마켓플레이스를 찾을 수 없습니다');
  }
  
  // 매핑 데이터 검증
  const { mappings } = req.body;
  
  if (!mappings || !Array.isArray(mappings)) {
    res.status(400);
    throw new Error('유효한 매핑 데이터를 제공해주세요');
  }
  
  // 시스템 카테고리 ID 유효성 검사
  const categoryIds = mappings.map(m => m.systemCategoryId);
  const validCategories = await Category.find({ _id: { $in: categoryIds } });
  const validCategoryIds = validCategories.map(c => c._id.toString());
  
  // 매핑 업데이트
  for (const mapping of mappings) {
    if (!validCategoryIds.includes(mapping.systemCategoryId)) {
      continue; // 유효하지 않은 카테고리 ID는 건너뜀
    }
    
    // 기존 매핑 찾기
    const existingMappingIndex = marketplace.categoryMappings.findIndex(
      m => m.systemCategoryId.toString() === mapping.systemCategoryId
    );
    
    if (existingMappingIndex !== -1) {
      // 기존 매핑 업데이트
      marketplace.categoryMappings[existingMappingIndex].marketCategoryId = mapping.marketCategoryId;
      marketplace.categoryMappings[existingMappingIndex].marketCategoryName = mapping.marketCategoryName;
      marketplace.categoryMappings[existingMappingIndex].marketCategoryPath = mapping.marketCategoryPath || '';
    } else {
      // 새 매핑 추가
      marketplace.categoryMappings.push({
        systemCategoryId: mapping.systemCategoryId,
        marketCategoryId: mapping.marketCategoryId,
        marketCategoryName: mapping.marketCategoryName,
        marketCategoryPath: mapping.marketCategoryPath || ''
      });
    }
  }
  
  marketplace.updatedBy = req.user._id;
  
  const updatedMarketplace = await marketplace.save();
  res.json(updatedMarketplace.categoryMappings);
});

// @desc    카테고리 매핑 삭제
// @route   DELETE /api/marketplaces/:id/category-mappings/:mappingId
// @access  Private
const deleteCategoryMapping = asyncHandler(async (req, res) => {
  const marketplace = await Marketplace.findById(req.params.id);
  
  if (!marketplace) {
    res.status(404);
    throw new Error('마켓플레이스를 찾을 수 없습니다');
  }
  
  // 매핑 찾기
  const mappingIndex = marketplace.categoryMappings.findIndex(
    m => m._id.toString() === req.params.mappingId
  );
  
  if (mappingIndex === -1) {
    res.status(404);
    throw new Error('카테고리 매핑을 찾을 수 없습니다');
  }
  
  // 매핑 삭제
  marketplace.categoryMappings.splice(mappingIndex, 1);
  
  marketplace.updatedBy = req.user._id;
  
  await marketplace.save();
  res.json({ message: '카테고리 매핑이 삭제되었습니다' });
});

// @desc    필드 매핑 업데이트
// @route   POST /api/marketplaces/:id/field-mappings
// @access  Private
const updateFieldMappings = asyncHandler(async (req, res) => {
  const marketplace = await Marketplace.findById(req.params.id);
  
  if (!marketplace) {
    res.status(404);
    throw new Error('마켓플레이스를 찾을 수 없습니다');
  }
  
  // 매핑 데이터 검증
  const { mappings } = req.body;
  
  if (!mappings || !Array.isArray(mappings)) {
    res.status(400);
    throw new Error('유효한 매핑 데이터를 제공해주세요');
  }
  
  // 기존 매핑 모두 제거 후 새로 설정
  marketplace.fieldMappings = [];
  
  // 새 매핑 추가
  for (const mapping of mappings) {
    marketplace.fieldMappings.push({
      systemField: mapping.systemField,
      marketField: mapping.marketField,
      defaultValue: mapping.defaultValue || '',
      transformFunction: mapping.transformFunction || '',
      isRequired: mapping.isRequired || false
    });
  }
  
  marketplace.updatedBy = req.user._id;
  
  const updatedMarketplace = await marketplace.save();
  res.json(updatedMarketplace.fieldMappings);
});

// @desc    마켓플레이스 동기화 로그 조회
// @route   GET /api/marketplaces/:id/sync-logs
// @access  Private
const getSyncLogs = asyncHandler(async (req, res) => {
  // 마켓플레이스 조회 (동기화 로그만 포함)
  const marketplace = await Marketplace.findById(req.params.id)
    .select('syncLogs');
  
  if (!marketplace) {
    res.status(404);
    throw new Error('마켓플레이스를 찾을 수 없습니다');
  }
  
  // 쿼리 파라미터
  const { action, status, productId, page = 1, limit = 50 } = req.query;
  
  // 로그 필터링
  let filteredLogs = [...marketplace.syncLogs];
  
  if (action) {
    filteredLogs = filteredLogs.filter(log => log.action === action);
  }
  
  if (status) {
    filteredLogs = filteredLogs.filter(log => log.status === status);
  }
  
  if (productId) {
    filteredLogs = filteredLogs.filter(log => 
      log.productId && log.productId.toString() === productId
    );
  }
  
  // 정렬 (최신순)
  filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // 페이징 처리
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
  
  res.json({
    logs: paginatedLogs,
    page: Number(page),
    pages: Math.ceil(filteredLogs.length / limit),
    total: filteredLogs.length
  });
});

module.exports = {
  getMarketplaces,
  getMarketplaceById,
  createMarketplace,
  updateMarketplace,
  deleteMarketplace,
  addMarketplaceAccount,
  updateMarketplaceAccount,
  deleteMarketplaceAccount,
  updateCategoryMappings,
  deleteCategoryMapping,
  updateFieldMappings,
  getSyncLogs
};