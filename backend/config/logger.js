// config/logger.js
const winston = require('winston');
const fs = require('fs');
const path = require('path');

// 로그 디렉터리 생성
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 로그 파일 경로 설정
const errorLog = path.join(logDir, 'error.log');
const combinedLog = path.join(logDir, 'combined.log');
const accessLog = path.join(logDir, 'access.log');

// 로그 포맷 설정
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Winston 로거 설정
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    // 콘솔 출력 (개발 환경)
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // 오류 로그 파일
    new winston.transports.File({ 
      filename: errorLog, 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // 통합 로그 파일 
    new winston.transports.File({ 
      filename: combinedLog,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // 접근 로그 파일
    new winston.transports.File({ 
      filename: accessLog, 
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  exitOnError: false
});

// Morgan 로그 스트림 설정
logger.stream = {
  write: function(message) {
    logger.http(message.trim());
  }
};

module.exports = logger;