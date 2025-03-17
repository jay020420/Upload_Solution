// server.js - 메인 서버 파일
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fileUpload = require('express-fileupload');

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

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB 제한
}));

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 데이터베이스 연결
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB 연결 성공'))
.catch(err => console.error('MongoDB 연결 실패:', err));

// 라우트
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/marketplaces', marketplaceRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/batch-jobs', batchJobRoutes);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '서버 오류가 발생했습니다',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});

module.exports = app;