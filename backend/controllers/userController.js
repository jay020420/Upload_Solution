// controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { generateToken } = require('../utils/jwtUtils');

// @desc    사용자 인증 및 토큰 발급
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // 이메일, 비밀번호 입력 확인
  if (!email || !password) {
    res.status(400);
    throw new Error('이메일과 비밀번호를 모두 입력해주세요');
  }
  
  // 이메일로 사용자 조회 (비밀번호 포함)
  const user = await User.findOne({ email }).select('+password');
  
  // 사용자 존재 여부 및 비밀번호 일치 확인
  if (user && (await user.matchPassword(password))) {
    // 마지막 로그인 시간 업데이트
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    
    // 토큰 발급 및 사용자 정보 반환
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      permissions: user.permissions,
      token: user.getSignedJwtToken()
    });
  } else {
    res.status(401);
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
  }
});

// @desc    신규 사용자 등록
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
  // 이메일 중복 확인
  const userExists = await User.findOne({ email });
  
  if (userExists) {
    res.status(400);
    throw new Error('이미 가입된 이메일입니다');
  }
  
  // 새 사용자 생성
  const user = await User.create({
    name,
    email,
    password
  });
  
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      permissions: user.permissions,
      token: user.getSignedJwtToken()
    });
  } else {
    res.status(400);
    throw new Error('잘못된 사용자 정보입니다');
  }
});

// @desc    사용자 프로필 조회
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user는 authMiddleware에서 설정됨
  const user = await User.findById(req.user._id);
  
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      permissions: user.permissions,
      department: user.department,
      position: user.position,
      phone: user.phone,
      profileImage: user.profileImage,
      createdAt: user.createdAt
    });
  } else {
    res.status(404);
    throw new Error('사용자를 찾을 수 없습니다');
  }
});

// @desc    사용자 프로필 업데이트
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    // 기본 정보 업데이트
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.department = req.body.department || user.department;
    user.position = req.body.position || user.position;
    user.phone = req.body.phone || user.phone;
    
    // 프로필 이미지 업데이트 (있는 경우)
    if (req.body.profileImage) {
      user.profileImage = req.body.profileImage;
    }
    
    // 비밀번호 업데이트 (제공된 경우)
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      role: updatedUser.role,
      permissions: updatedUser.permissions,
      token: updatedUser.getSignedJwtToken()
    });
  } else {
    res.status(404);
    throw new Error('사용자를 찾을 수 없습니다');
  }
});

// @desc    모든 사용자 조회
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  // 페이징 처리
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;
  
  // 필터링 조건
  const keyword = req.query.keyword 
    ? { name: { $regex: req.query.keyword, $options: 'i' } } 
    : {};
    
  // 역할 필터
  if (req.query.role) {
    keyword.role = req.query.role;
  }
  
  // 상태 필터
  if (req.query.isActive !== undefined) {
    keyword.isActive = req.query.isActive === 'true';
  }
  
  // 총 사용자 수 조회
  const count = await User.countDocuments(keyword);
  
  // 사용자 목록 조회
  const users = await User.find(keyword)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  
  res.json({
    users,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    사용자 삭제
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (user) {
    // 자신을 삭제하려는 경우 방지
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('자신의 계정은 삭제할 수 없습니다');
    }
    
    await user.remove();
    res.json({ message: '사용자가 삭제되었습니다' });
  } else {
    res.status(404);
    throw new Error('사용자를 찾을 수 없습니다');
  }
});

// @desc    특정 사용자 조회
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('사용자를 찾을 수 없습니다');
  }
});

// @desc    관리자가 사용자 정보 업데이트
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (user) {
    // 기본 정보 업데이트
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
    user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;
    user.department = req.body.department || user.department;
    user.position = req.body.position || user.position;
    user.phone = req.body.phone || user.phone;
    
    // 권한 업데이트 (제공된 경우)
    if (req.body.permissions) {
      user.permissions = req.body.permissions;
    }
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      role: updatedUser.role,
      permissions: updatedUser.permissions,
      isActive: updatedUser.isActive
    });
  } else {
    res.status(404);
    throw new Error('사용자를 찾을 수 없습니다');
  }
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser
};