// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  authUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile, 
  getUsers, 
  deleteUser, 
  getUserById, 
  updateUser 
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// 공개 라우트
router.post('/login', authUser);
router.post('/', registerUser);

// 보호된 라우트
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// 관리자 라우트
router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;