// routes/batchJobRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getBatchJobs, 
  getBatchJobById, 
  createBatchJob, 
  updateBatchJobStatus, 
  deleteBatchJob, 
  getBatchJobItems,
  getBatchJobLogs
} = require('../controllers/batchJobController');
const { protect, admin } = require('../middleware/authMiddleware');

// 배치 작업 목록 조회 및 생성
router.route('/')
  .get(protect, getBatchJobs)
  .post(protect, createBatchJob);

// 배치 작업 상세 조회
router.route('/:id')
  .get(protect, getBatchJobById);

// 배치 작업 상태 업데이트
router.route('/:id/status')
  .put(protect, updateBatchJobStatus);

// 배치 작업 항목 조회
router.route('/:id/items')
  .get(protect, getBatchJobItems);

// 배치 작업 로그 조회
router.route('/:id/logs')
  .get(protect, getBatchJobLogs);

// 배치 작업 삭제 (관리자만 가능)
router.route('/:id')
  .delete(protect, admin, deleteBatchJob);

module.exports = router;