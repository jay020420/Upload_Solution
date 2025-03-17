// utils/jwtUtils.js
const jwt = require('jsonwebtoken');

/**
 * JWT 토큰 생성
 * @param {Object} payload - 토큰에 포함할 데이터
 * @param {string} expiresIn - 토큰 만료 시간 (기본값: '30d')
 * @returns {string} 생성된 JWT 토큰
 */
const generateToken = (payload, expiresIn = '30d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn
  });
};

/**
 * JWT 토큰 검증
 * @param {string} token - 검증할 JWT 토큰
 * @returns {Object} 디코딩된 토큰 데이터
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};