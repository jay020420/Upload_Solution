// utils/s3Utils.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { getS3 } = require('../config/s3');

/**
 * 파일을 S3에 업로드
 * @param {Object} file - 업로드할 파일 객체 (express-fileupload)
 * @param {string} folder - S3 내의 폴더 경로
 * @returns {Promise<Object>} S3 업로드 결과
 */
const uploadToS3 = async (file, folder = '') => {
  try {
    // S3 인스턴스 및 버킷 정보 가져오기
    const { s3, bucket } = getS3();
    
    // 파일명 생성 (UUID + 원본 확장자)
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    // S3 키 생성 (폴더/파일명)
    const s3Key = folder ? `${folder}/${fileName}` : fileName;
    
    // 업로드 파라미터 구성
    const params = {
      Bucket: bucket,
      Key: s3Key,
      Body: fs.createReadStream(file.tempFilePath),
      ContentType: file.mimetype,
      ACL: 'public-read' // 공개 액세스 허용
    };
    
    // S3에 업로드
    const result = await s3.upload(params).promise();
    
    // 임시 파일 삭제
    fs.unlinkSync(file.tempFilePath);
    
    return result;
  } catch (error) {
    console.error('S3 업로드 오류:', error);
    throw new Error(`파일 업로드 오류: ${error.message}`);
  }
};

/**
 * S3에서 파일 삭제
 * @param {string} fileUrl - 삭제할 파일의 URL 또는 키
 * @returns {Promise<Object>} S3 삭제 결과
 */
const deleteFromS3 = async (fileUrl) => {
  try {
    // S3 인스턴스 및 버킷 정보 가져오기
    const { s3, bucket } = getS3();
    
    // URL에서 키 추출
    let key;
    if (fileUrl.startsWith('http')) {
      // URL에서 경로부분만 추출
      const urlObj = new URL(fileUrl);
      key = urlObj.pathname.substring(1); // 앞의 '/' 제거
    } else {
      // 이미 키 형태인 경우
      key = fileUrl;
    }
    
    // 삭제 파라미터 구성
    const params = {
      Bucket: bucket,
      Key: key
    };
    
    // S3에서 삭제
    const result = await s3.deleteObject(params).promise();
    
    return result;
  } catch (error) {
    console.error('S3 삭제 오류:', error);
    throw new Error(`파일 삭제 오류: ${error.message}`);
  }
};

/**
 * 여러 파일을 S3에 업로드
 * @param {Array} files - 업로드할 파일 객체 배열
 * @param {string} folder - S3 내의 폴더 경로
 * @returns {Promise<Array>} S3 업로드 결과 배열
 */
const uploadMultipleToS3 = async (files, folder = '') => {
  try {
    const uploadPromises = [];
    
    // 배열이 아닌 경우 배열로 변환
    const filesArray = Array.isArray(files) ? files : [files];
    
    // 각 파일에 대해 업로드 작업 생성
    filesArray.forEach(file => {
      uploadPromises.push(uploadToS3(file, folder));
    });
    
    // 모든 업로드 작업 병렬 처리
    const results = await Promise.all(uploadPromises);
    
    return results;
  } catch (error) {
    console.error('다중 S3 업로드 오류:', error);
    throw new Error(`다중 파일 업로드 오류: ${error.message}`);
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  uploadMultipleToS3
};