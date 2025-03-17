// utils/validationUtils.js

/**
 * 상품 데이터 유효성 검사
 * @param {Object} product - 검사할 상품 데이터
 * @returns {Array} 유효성 검사 오류 메시지 배열
 */
const validateProduct = (product) => {
    const errors = [];
    
    // 필수 필드 검사
    if (!product.name || product.name.trim() === '') {
      errors.push('상품명은 필수 항목입니다');
    }
    
    if (!product.description || product.description.trim() === '') {
      errors.push('상품 설명은 필수 항목입니다');
    }
    
    if (product.regularPrice === undefined || product.regularPrice === null || isNaN(Number(product.regularPrice))) {
      errors.push('정상가는 유효한 숫자여야 합니다');
    } else if (Number(product.regularPrice) < 0) {
      errors.push('정상가는 0 이상이어야 합니다');
    }
    
    // 판매가 검사 (입력된 경우)
    if (product.salePrice !== undefined && product.salePrice !== null) {
      if (isNaN(Number(product.salePrice))) {
        errors.push('판매가는 유효한 숫자여야 합니다');
      } else if (Number(product.salePrice) < 0) {
        errors.push('판매가는 0 이상이어야 합니다');
      }
    }
    
    // 원가 검사 (입력된 경우)
    if (product.costPrice !== undefined && product.costPrice !== null) {
      if (isNaN(Number(product.costPrice))) {
        errors.push('원가는 유효한 숫자여야 합니다');
      } else if (Number(product.costPrice) < 0) {
        errors.push('원가는 0 이상이어야 합니다');
      }
    }
    
    // 카테고리 검사
    if (!product.categories || !Array.isArray(product.categories) || product.categories.length === 0) {
      errors.push('최소 하나 이상의 카테고리를 선택해야 합니다');
    }
    
    // 재고 검사
    if (!product.hasVariants && (product.stock === undefined || isNaN(Number(product.stock)))) {
      errors.push('재고는 유효한 숫자여야 합니다');
    }
    
    // 옵션 검사 (옵션이 있는 경우)
    if (product.hasVariants) {
      if (!product.options || !Array.isArray(product.options) || product.options.length === 0) {
        errors.push('옵션을 사용하는 경우 최소 하나 이상의 옵션이 필요합니다');
      } else {
        // 각 옵션 검사
        product.options.forEach((option, index) => {
          if (!option.name || option.name.trim() === '') {
            errors.push(`옵션 ${index + 1}의 이름은 필수 항목입니다`);
          }
          
          if (!option.values || !Array.isArray(option.values) || option.values.length === 0) {
            errors.push(`옵션 ${index + 1}(${option.name || '이름 없음'})에는 최소 하나 이상의 값이 필요합니다`);
          } else {
            // 각 옵션 값 검사
            option.values.forEach((value, valueIndex) => {
              if (!value.name || value.name.trim() === '') {
                errors.push(`옵션 ${index + 1}(${option.name || '이름 없음'})의 값 ${valueIndex + 1}의 이름은 필수 항목입니다`);
              }
              
              if (value.additionalPrice !== undefined && value.additionalPrice !== null) {
                if (isNaN(Number(value.additionalPrice))) {
                  errors.push(`옵션 ${index + 1}(${option.name || '이름 없음'})의 값 ${valueIndex + 1}(${value.name || '이름 없음'})의 추가 금액은 유효한 숫자여야 합니다`);
                }
              }
            });
          }
        });
      }
      
      // 옵션 조합 검사
      if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
        errors.push('옵션을 사용하는 경우 최소 하나 이상의 옵션 조합이 필요합니다');
      } else {
        // 각 조합 검사
        product.variants.forEach((variant, index) => {
          if (!variant.optionCombination || variant.optionCombination.trim() === '') {
            errors.push(`옵션 조합 ${index + 1}의 조합명은 필수 항목입니다`);
          }
          
          if (variant.price === undefined || variant.price === null || isNaN(Number(variant.price))) {
            errors.push(`옵션 조합 ${index + 1}(${variant.optionCombination || '이름 없음'})의 가격은 유효한 숫자여야 합니다`);
          } else if (Number(variant.price) < 0) {
            errors.push(`옵션 조합 ${index + 1}(${variant.optionCombination || '이름 없음'})의 가격은 0 이상이어야 합니다`);
          }
          
          if (variant.stock === undefined || variant.stock === null || isNaN(Number(variant.stock))) {
            errors.push(`옵션 조합 ${index + 1}(${variant.optionCombination || '이름 없음'})의 재고는 유효한 숫자여야 합니다`);
          } else if (Number(variant.stock) < 0) {
            errors.push(`옵션 조합 ${index + 1}(${variant.optionCombination || '이름 없음'})의 재고는 0 이상이어야 합니다`);
          }
        });
      }
    }
    
    // 무게 및 치수 검사 (입력된 경우)
    if (product.weight !== undefined && product.weight !== null) {
      if (isNaN(Number(product.weight))) {
        errors.push('무게는 유효한 숫자여야 합니다');
      } else if (Number(product.weight) < 0) {
        errors.push('무게는 0 이상이어야 합니다');
      }
    }
    
    if (product.dimensions) {
      if (product.dimensions.length !== undefined && isNaN(Number(product.dimensions.length))) {
        errors.push('길이는 유효한 숫자여야 합니다');
      }
      
      if (product.dimensions.width !== undefined && isNaN(Number(product.dimensions.width))) {
        errors.push('너비는 유효한 숫자여야 합니다');
      }
      
      if (product.dimensions.height !== undefined && isNaN(Number(product.dimensions.height))) {
        errors.push('높이는 유효한 숫자여야 합니다');
      }
    }
    
    return errors;
  };
  
  /**
   * 상품 엑셀 데이터 유효성 검사
   * @param {Object} productData - 검사할 상품 데이터 (엑셀에서 읽은)
   * @returns {Array} 유효성 검사 오류 메시지 배열
   */
  const validateExcelProduct = (productData) => {
    const errors = [];
    
    // 필수 필드 검사
    if (!productData.name || productData.name.trim() === '') {
      errors.push('상품명은 필수 항목입니다');
    }
    
    if (!productData.regularPrice || isNaN(Number(productData.regularPrice))) {
      errors.push('정상가는 유효한 숫자여야 합니다');
    }
    
    // 판매가 검사 (입력된 경우)
    if (productData.salePrice && isNaN(Number(productData.salePrice))) {
      errors.push('판매가는 유효한 숫자여야 합니다');
    }
    
    // 원가 검사 (입력된 경우)
    if (productData.costPrice && isNaN(Number(productData.costPrice))) {
      errors.push('원가는 유효한 숫자여야 합니다');
    }
    
    // 재고 검사
    if (productData.stock && isNaN(Number(productData.stock))) {
      errors.push('재고는 유효한 숫자여야 합니다');
    }
    
    // 상태 검사
    if (productData.status && !['draft', 'active', 'inactive', 'out_of_stock'].includes(productData.status)) {
      errors.push('상태는 draft, active, inactive, out_of_stock 중 하나여야 합니다');
    }
    
    return errors;
  };
  
  module.exports = {
    validateProduct,
    validateExcelProduct
  };