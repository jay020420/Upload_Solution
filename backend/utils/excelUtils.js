// utils/excelUtils.js
const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Category = require('../models/categoryModel');

/**
 * 엑셀 또는 CSV 파일을 처리하여 상품 데이터 배열 반환
 * @param {string} filePath - 처리할 파일 경로
 * @param {string} fileType - 파일 유형 (xlsx, csv)
 * @returns {Promise<Array>} 처리된 상품 데이터 배열
 */
const processExcelFile = async (filePath, fileType) => {
  try {
    let products = [];
    
    if (fileType === 'csv') {
      // CSV 파일 처리
      products = await processCSV(filePath);
    } else {
      // XLSX 파일 처리
      products = await processXLSX(filePath);
    }
    
    // 카테고리 이름을 ID로 변환
    products = await mapCategories(products);
    
    return products;
  } catch (error) {
    console.error('엑셀 처리 오류:', error);
    throw new Error(`파일 처리 중 오류가 발생했습니다: ${error.message}`);
  }
};

/**
 * CSV 파일 처리
 * @param {string} filePath - CSV 파일 경로
 * @returns {Promise<Array>} 처리된 상품 데이터 배열
 */
const processCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // 데이터 정리
        const product = cleanProductData(data);
        results.push(product);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * XLSX 파일 처리
 * @param {string} filePath - XLSX 파일 경로
 * @returns {Promise<Array>} 처리된 상품 데이터 배열
 */
const processXLSX = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      // 엑셀 파일 로드
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // 엑셀 데이터를 JSON 형식으로 변환
      const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
      
      // 각 행 데이터 정리
      const products = data.map(row => cleanProductData(row));
      
      resolve(products);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 상품 데이터 정리 및 변환
 * @param {Object} data - 원본 상품 데이터
 * @returns {Object} 정리된 상품 데이터
 */
const cleanProductData = (data) => {
  // 숫자 필드 변환
  const numericFields = ['regularPrice', 'salePrice', 'costPrice', 'stock', 'weight'];
  
  const cleanedData = { ...data };
  
  // 필드명 정리 (공백 제거 및 소문자 변환)
  Object.keys(data).forEach(key => {
    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
    
    if (cleanKey !== key) {
      cleanedData[cleanKey] = data[key];
      delete cleanedData[key];
    }
  });
  
  // 숫자 필드 변환
  numericFields.forEach(field => {
    if (cleanedData[field] !== undefined && cleanedData[field] !== null) {
      cleanedData[field] = Number(cleanedData[field]);
      
      if (isNaN(cleanedData[field])) {
        cleanedData[field] = 0;
      }
    }
  });
  
  // 불리언 필드 변환
  if (cleanedData.has_variants !== undefined) {
    cleanedData.hasVariants = String(cleanedData.has_variants).toLowerCase() === 'true' || 
                            String(cleanedData.has_variants) === '1' || 
                            String(cleanedData.has_variants).toLowerCase() === 'yes';
    delete cleanedData.has_variants;
  }
  
  // 카테고리 필드 처리 (쉼표로 구분된 문자열인 경우)
  if (cleanedData.categories && typeof cleanedData.categories === 'string') {
    cleanedData.categories = cleanedData.categories.split(',').map(cat => cat.trim());
  }
  
  // 이미지 URL 처리 (쉼표로 구분된 문자열인 경우)
  if (cleanedData.images && typeof cleanedData.images === 'string') {
    const imageUrls = cleanedData.images.split(',').map(url => url.trim());
    
    cleanedData.images = imageUrls.map((url, index) => ({
      url,
      order: index,
      isMain: index === 0
    }));
  }
  
  return cleanedData;
};

/**
 * 카테고리 이름을 ID로 매핑
 * @param {Array} products - 처리할 상품 데이터 배열
 * @returns {Promise<Array>} 카테고리 ID가 매핑된 상품 데이터 배열
 */
const mapCategories = async (products) => {
  try {
    // 모든 고유 카테고리 이름 추출
    const categoryNames = new Set();
    
    products.forEach(product => {
      if (product.categories && Array.isArray(product.categories)) {
        product.categories.forEach(cat => {
          if (typeof cat === 'string') {
            categoryNames.add(cat);
          }
        });
      } else if (product.categories && typeof product.categories === 'string') {
        categoryNames.add(product.categories);
      }
    });
    
    // 존재하는 카테고리 이름과 ID 맵 생성
    const categoryMap = {};
    
    if (categoryNames.size > 0) {
      const categories = await Category.find({
        name: { $in: Array.from(categoryNames) }
      }).select('_id name');
      
      categories.forEach(cat => {
        categoryMap[cat.name] = cat._id;
      });
    }
    
    // 각 상품의 카테고리 매핑
    return products.map(product => {
      const processedProduct = { ...product };
      
      if (product.categories && Array.isArray(product.categories)) {
        processedProduct.categories = product.categories
          .map(cat => {
            if (typeof cat === 'string' && categoryMap[cat]) {
              return categoryMap[cat];
            }
            return null;
          })
          .filter(Boolean);
      } else if (product.categories && typeof product.categories === 'string' && categoryMap[product.categories]) {
        processedProduct.categories = [categoryMap[product.categories]];
      } else {
        processedProduct.categories = [];
      }
      
      return processedProduct;
    });
  } catch (error) {
    console.error('카테고리 매핑 오류:', error);
    throw new Error(`카테고리 매핑 중 오류가 발생했습니다: ${error.message}`);
  }
};

/**
 * 상품 데이터를 엑셀 파일로 내보내기
 * @param {Array} products - 내보낼 상품 데이터 배열
 * @param {string} filePath - 저장할 파일 경로
 * @returns {Promise<string>} 저장된 파일 경로
 */
const exportProductsToExcel = async (products, filePath) => {
  try {
    // 내보낼 데이터 준비
    const exportData = products.map(product => ({
      '상품명': product.name,
      '설명': product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : '',
      '정상가': product.regularPrice,
      '판매가': product.salePrice || '',
      '원가': product.costPrice || '',
      '재고': product.hasVariants ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0) : (product.stock || 0),
      '상태': product.status === 'active' ? '판매중' : 
             product.status === 'draft' ? '임시저장' : 
             product.status === 'inactive' ? '판매중지' : 
             product.status === 'out_of_stock' ? '품절' : '',
      '카테고리': product.categories && Array.isArray(product.categories) && product.categories.length > 0 ? 
                  (Array.isArray(product.categories[0]) ? product.categories.map(c => c.name || '').join(', ') : 
                  product.categories.map(c => c.name || '').join(', ')) : '',
      '브랜드': product.brand || '',
      '생성일': product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '',
      '수정일': product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : '',
    }));
    
    // 워크북 및 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '상품 목록');
    
    // 열 너비 조정
    const cols = [
      { wch: 30 }, // 상품명
      { wch: 40 }, // 설명
      { wch: 10 }, // 정상가
      { wch: 10 }, // 판매가
      { wch: 10 }, // 원가
      { wch: 8 },  // 재고
      { wch: 10 }, // 상태
      { wch: 20 }, // 카테고리
      { wch: 15 }, // 브랜드
      { wch: 12 }, // 생성일
      { wch: 12 }, // 수정일
    ];
    worksheet['!cols'] = cols;
    
    // 파일 저장
    XLSX.writeFile(workbook, filePath);
    
    return filePath;
  } catch (error) {
    console.error('엑셀 내보내기 오류:', error);
    throw new Error(`엑셀 내보내기 중 오류가 발생했습니다: ${error.message}`);
  }
};

module.exports = {
  processExcelFile,
  exportProductsToExcel
};