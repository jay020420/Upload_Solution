// routes/marketplaceRoutes.js
const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/marketplaceController');
const { protect, admin } = require('../middleware/authMiddleware');

// 마켓플레이스 라우트
router.route('/')
  .get(protect, getMarketplaces)
  .post(protect, admin, createMarketplace);

router.route('/:id')
  .get(protect, getMarketplaceById)
  .put(protect, admin, updateMarketplace)
  .delete(protect, admin, deleteMarketplace);

// 마켓플레이스 계정 라우트
router.route('/:id/accounts')
  .post(protect, addMarketplaceAccount);

router.route('/:id/accounts/:accountId')
  .put(protect, updateMarketplaceAccount)
  .delete(protect, deleteMarketplaceAccount);

// 카테고리 매핑 라우트
router.route('/:id/category-mappings')
  .post(protect, updateCategoryMappings);

router.route('/:id/category-mappings/:mappingId')
  .delete(protect, deleteCategoryMapping);

// 필드 매핑 라우트
router.route('/:id/field-mappings')
  .post(protect, updateFieldMappings);

// 동기화 로그 라우트
router.route('/:id/sync-logs')
  .get(protect, getSyncLogs);

module.exports = router;