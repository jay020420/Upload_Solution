// middleware/errorMiddleware.js

/**
 * 존재하지 않는 경로에 대한 404 에러 처리 미들웨어
 */
const notFound = (req, res, next) => {
    const error = new Error(`요청한 경로를 찾을 수 없습니다: ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  /**
   * 에러 처리 미들웨어
   * Express의 기본 에러 핸들러를 대체
   */
  const errorHandler = (err, req, res, next) => {
    // 이미 상태 코드가 설정되었는지 확인, 그렇지 않으면 500으로 설정
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // 에러 응답 구성
    res.status(statusCode);
    
    // JSON 응답 반환
    res.json({
      message: err.message,
      // 개발 환경에서만 스택 트레이스 포함
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
    
    // 에러 로깅
    console.error(`${statusCode} - ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    }
  };
  
  /**
   * 몽구스 유효성 검사 오류 처리기
   * Mongoose 유효성 검사 오류를 친숙한
   * 형식으로 변환하는 미들웨어
   */
  const mongooseValidationErrorHandler = (err, req, res, next) => {
    // Mongoose 유효성 검사 오류인지 확인
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      
      res.status(400);
      return res.json({
        message: '입력 데이터 유효성 검사 오류',
        errors
      });
    }
    
    // Mongoose 중복 키 오류인지 확인
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      
      res.status(400);
      return res.json({
        message: `이미 존재하는 ${field} 입니다`
      });
    }
    
    // 다음 미들웨어로 전달
    next(err);
  };
  
  module.exports = { notFound, errorHandler, mongooseValidationErrorHandler };