// config/db.js
const mongoose = require('mongoose');

/**
 * MongoDB 연결 설정
 * @returns {Promise} MongoDB 연결 객체
 */
const connectDB = async () => {
  try {
    // MongoDB 7 버전부터는 useNewUrlParser, useUnifiedTopology가 기본값이므로 제거
    // useCreateIndex, useFindAndModify는 더 이상 지원되지 않음
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB 연결 성공: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB 연결 오류: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;