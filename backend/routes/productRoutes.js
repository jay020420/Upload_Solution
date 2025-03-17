// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  bulkUploadProducts,
  syncProductToMarketplace
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// 상품 목록 조회 및 신규 상품 생성
router.route('/')
  .get(protect, getProducts)
  .post(protect, createProduct);

// 대량 상품 업로드
router.post('/bulk-upload', protect, bulkUploadProducts);

// 마켓플레이스 동기화
router.post('/:id/sync/:marketplaceId', protect, syncProductToMarketplace);

// 특정 상품 조회, 수정, 삭제
router.route('/:id')
  .get(getProductById)
  .put(protect, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;