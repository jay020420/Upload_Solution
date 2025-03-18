// server.js - 메인 서버 파일
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fileUpload = require('express-fileupload');
const connectDB = require('./config/db');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// 미들웨어 임포트
const { notFound, errorHandler, mongooseValidationErrorHandler } = require('./middleware/errorMiddleware');

// 라우트 임포트
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const batchJobRoutes = require('./routes/batchJobRoutes');

// 환경변수 설정
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 보안 미들웨어
if (process.env.NODE_ENV === 'production') {
  app.use(helmet()); // 보안 헤더 설정
  app.use(xss()); // XSS 방지
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10분
    max: 100, // 최대 100 요청
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  });
  app.use('/api/', limiter);
  
  // HTTP Parameter Pollution 방지
  app.use(hpp());
}

// 기본 미들웨어
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB 제한
}));

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 데이터베이스 연결
connectDB();

// 라우트
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/marketplaces', marketplaceRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/batch-jobs', batchJobRoutes);

// 기본 경로
app.get('/', (req, res) => {
  res.json({ message: '상품 업로드 솔루션 API' });
});

// 에러 핸들링 미들웨어
app.use(notFound);
app.use(mongooseValidationErrorHandler);
app.use(errorHandler);

// 서버 시작
const server = app.listen(PORT, () => {
  console.log(`서버가 ${process.env.NODE_ENV} 모드로 포트 ${PORT}에서 실행 중입니다`);
});

// 처리되지 않은 예외 처리
process.on('unhandledRejection', (err, promise) => {
  console.error(`오류: ${err.message}`);
  // 서버를 정상적으로 종료
  server.close(() => process.exit(1));
});

module.exports = app;