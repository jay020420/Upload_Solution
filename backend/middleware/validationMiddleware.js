// middleware/validationMiddleware.js
const { validationResult } = require('express-validator');

/**
 * 요청 데이터 유효성 검증 결과 처리 미들웨어
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '입력 데이터 유효성 검사 오류',
      errors: errors.array().map(err => err.msg)
    });
  }
  
  next();
};

module.exports = { validateRequest };