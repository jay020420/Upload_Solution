// config/s3.js
const AWS = require('aws-sdk');

// AWS S3 설정
const s3Config = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3BucketName: process.env.AWS_S3_BUCKET_NAME
};

// S3 인스턴스 생성
const s3 = new AWS.S3({
  region: s3Config.region,
  accessKeyId: s3Config.accessKeyId,
  secretAccessKey: s3Config.secretAccessKey
});

/**
 * S3 버킷 정보와 인스턴스 반환
 */
const getS3 = () => {
  return {
    s3,
    bucket: s3Config.s3BucketName
  };
};

module.exports = {
  s3Config,
  getS3
};