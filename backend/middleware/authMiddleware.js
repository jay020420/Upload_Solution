// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

/**
 * 인증 미들웨어
 * JWT 토큰을 검증하고 사용자 정보를 요청 객체에 추가
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // 헤더에서 Bearer 토큰 확인
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 토큰만 추출 ('Bearer TOKEN' 형식에서)
      token = req.headers.authorization.split(' ')[1];
      
      // 토큰 검증
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 사용자 정보 조회 (비밀번호 제외)
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error('인증 오류:', error);
      res.status(401);
      throw new Error('인증 실패: 유효하지 않은 토큰');
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('인증 실패: 토큰이 없습니다');
  }
});

/**
 * 관리자 권한 확인 미들웨어
 * protect 미들웨어 이후에 사용
 */
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('관리자 권한이 필요합니다');
  }
};

/**
 * 권한 확인 미들웨어
 * 특정 권한이 있는지 확인
 * @param {string|string[]} permissions - 필요한 권한 또는 권한 배열
 */
const hasPermission = (permissions) => {
  return (req, res, next) => {
    // 관리자는 항상 모든 권한 허용
    if (req.user && req.user.isAdmin) {
      return next();
    }
    
    if (!req.user) {
      res.status(401);
      throw new Error('인증이 필요합니다');
    }
    
    // 단일 권한 확인
    if (typeof permissions === 'string') {
      if (req.user.permissions.includes(permissions)) {
        return next();
      }
    } 
    // 여러 권한 중 하나 이상 필요한 경우
    else if (Array.isArray(permissions)) {
      if (permissions.some(perm => req.user.permissions.includes(perm))) {
        return next();
      }
    }
    
    res.status(403);
    throw new Error('접근 권한이 없습니다');
  };
};

module.exports = { protect, admin, hasPermission };