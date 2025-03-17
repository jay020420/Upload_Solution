// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadToS3 } = require('../utils/s3Utils');
const path = require('path');

/**
 * @desc    상품 이미지 업로드
 * @route   POST /api/uploads/product-image
 * @access  Private
 */
router.post('/product-image', protect, async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: '업로드할 이미지가 없습니다' });
    }
    
    const file = req.files.image;
    
    // 이미지 파일 타입 검증
    const fileTypes = /jpeg|jpg|png|gif|webp/;
    const extname = fileTypes.test(path.extname(file.name).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    
    if (!extname || !mimetype) {
      return res.status(400).json({ message: '지원되지 않는 이미지 형식입니다. JPEG, PNG, GIF, WEBP 파일만 업로드 가능합니다.' });
    }
    
    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ message: '파일 크기는 최대 10MB까지 가능합니다.' });
    }
    
    // S3 업로드
    const result = await uploadToS3(file, 'products');
    
    res.json({
      url: result.Location,
      key: result.Key
    });
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    res.status(500).json({ message: `이미지 업로드 중 오류가 발생했습니다: ${error.message}` });
  }
});

/**
 * @desc    마켓플레이스 로고 업로드
 * @route   POST /api/uploads/marketplace-logo
 * @access  Private/Admin
 */
router.post('/marketplace-logo', protect, async (req, res) => {
  try {
    if (!req.files || !req.files.logo) {
      return res.status(400).json({ message: '업로드할 로고 이미지가 없습니다' });
    }
    
    const file = req.files.logo;
    
    // 이미지 파일 타입 검증
    const fileTypes = /jpeg|jpg|png|gif|svg/;
    const extname = fileTypes.test(path.extname(file.name).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    
    if (!extname || !mimetype) {
      return res.status(400).json({ message: '지원되지 않는 이미지 형식입니다. JPEG, PNG, GIF, SVG 파일만 업로드 가능합니다.' });
    }
    
    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: '파일 크기는 최대 5MB까지 가능합니다.' });
    }
    
    // S3 업로드
    const result = await uploadToS3(file, 'marketplaces');
    
    res.json({
      url: result.Location,
      key: result.Key
    });
  } catch (error) {
    console.error('로고 업로드 오류:', error);
    res.status(500).json({ message: `로고 업로드 중 오류가 발생했습니다: ${error.message}` });
  }
});

/**
 * @desc    사용자 프로필 이미지 업로드
 * @route   POST /api/uploads/profile-image
 * @access  Private
 */
router.post('/profile-image', protect, async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: '업로드할 이미지가 없습니다' });
    }
    
    const file = req.files.image;
    
    // 이미지 파일 타입 검증
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.name).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    
    if (!extname || !mimetype) {
      return res.status(400).json({ message: '지원되지 않는 이미지 형식입니다. JPEG, PNG, GIF 파일만 업로드 가능합니다.' });
    }
    
    // 파일 크기 제한 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return res.status(400).json({ message: '파일 크기는 최대 2MB까지 가능합니다.' });
    }
    
    // S3 업로드
    const result = await uploadToS3(file, 'profiles');
    
    res.json({
      url: result.Location,
      key: result.Key
    });
  } catch (error) {
    console.error('프로필 이미지 업로드 오류:', error);
    res.status(500).json({ message: `프로필 이미지 업로드 중 오류가 발생했습니다: ${error.message}` });
  }
});

module.exports = router;