// utils/batchJobUtils.js
const Product = require('../models/productModel');
const Marketplace = require('../models/marketplaceModel');
const { syncProduct: naverSyncProduct } = require('../marketplaces/naverModule');
const { syncProduct: coupangSyncProduct } = require('../marketplaces/coupangModule');
const { syncProduct: eleventhSyncProduct } = require('../marketplaces/eleventhModule');

/**
 * 상품 가격 일괄 수정 처리
 * @param {string} productId - 상품 ID
 * @param {Object} params - 작업 파라미터
 * @returns {Promise<Object>} 작업 결과
 */
const processProductPriceUpdate = async (productId, params) => {
  try {
    const { priceType, action, value, percentValue } = params;
    
    // 상품 조회
    const product = await Product.findById(productId);
    if (!product) {
      return {
        success: false,
        message: '상품을 찾을 수 없습니다'
      };
    }
    
    // 변경 대상 가격 타입 확인
    const priceField = priceType === 'salePrice' ? 'salePrice' : 'regularPrice';
    let currentPrice = product[priceField] || product.regularPrice;
    let newPrice = currentPrice;
    
    // 가격 변경 액션 처리
    switch (action) {
      case 'set': // 특정 가격으로 설정
        newPrice = Number(value);
        break;
        
      case 'increase': // 가격 증가
        if (percentValue) {
          // 퍼센트 증가
          newPrice = Math.round(currentPrice * (1 + (Number(percentValue) / 100)));
        } else {
          // 고정 금액 증가
          newPrice = currentPrice + Number(value);
        }
        break;
        
      case 'decrease': // 가격 감소
        if (percentValue) {
          // 퍼센트 감소
          newPrice = Math.round(currentPrice * (1 - (Number(percentValue) / 100)));
        } else {
          // 고정 금액 감소
          newPrice = currentPrice - Number(value);
        }
        break;
        
      default:
        return {
          success: false,
          message: '지원하지 않는 가격 변경 액션입니다'
        };
    }
    
    // 가격은 음수가 될 수 없음
    newPrice = Math.max(0, newPrice);
    
    // 상품 업데이트
    const updateData = {};
    updateData[priceField] = newPrice;
    
    // 옵션 상품인 경우 옵션 가격도 비율에 맞게 조정
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      if (action === 'set') {
        // 정가를 직접 설정하는 경우, 옵션별 가격도 동일 비율로 조정
        const ratio = newPrice / currentPrice;
        
        product.variants.forEach((variant, index) => {
          updateData[`variants.${index}.price`] = Math.round(variant.price * ratio);
        });
      } else if (percentValue) {
        // 퍼센트 변경의 경우, 모든 옵션 가격에 동일 비율 적용
        const ratio = action === 'increase' ? (1 + (Number(percentValue) / 100)) : (1 - (Number(percentValue) / 100));
        
        product.variants.forEach((variant, index) => {
          updateData[`variants.${index}.price`] = Math.max(0, Math.round(variant.price * ratio));
        });
      } else {
        // 고정 금액 변경의 경우, 모든 옵션 가격에 동일 금액 적용
        const change = action === 'increase' ? Number(value) : -Number(value);
        
        product.variants.forEach((variant, index) => {
          updateData[`variants.${index}.price`] = Math.max(0, variant.price + change);
        });
      }
    }
    
    // 상품 업데이트
    await Product.findByIdAndUpdate(productId, updateData);
    
    return {
      success: true,
      message: `상품 가격이 ${priceField === 'regularPrice' ? '정상가' : '판매가'}가 ${currentPrice.toLocaleString()}원에서 ${newPrice.toLocaleString()}원으로 변경되었습니다`,
      data: {
        oldPrice: currentPrice,
        newPrice: newPrice
      }
    };
  } catch (error) {
    console.error(`상품 가격 업데이트 오류 (ID: ${productId}):`, error);
    return {
      success: false,
      message: `상품 가격 업데이트 중 오류 발생: ${error.message}`
    };
  }
};

/**
 * 상품 재고 일괄 수정 처리
 * @param {string} productId - 상품 ID
 * @param {Object} params - 작업 파라미터
 * @returns {Promise<Object>} 작업 결과
 */
const processProductStockUpdate = async (productId, params) => {
  try {
    const { action, value, percentValue } = params;
    
    // 상품 조회
    const product = await Product.findById(productId);
    if (!product) {
      return {
        success: false,
        message: '상품을 찾을 수 없습니다'
      };
    }
    
    // 재고 업데이트
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      // 옵션 상품인 경우
      const updateData = {};
      let totalOldStock = 0;
      let totalNewStock = 0;
      
      product.variants.forEach((variant, index) => {
        let currentStock = variant.stock || 0;
        let newStock = currentStock;
        totalOldStock += currentStock;
        
        // 재고 변경 액션 처리
        switch (action) {
          case 'set': // 특정 재고로 설정
            newStock = Number(value);
            break;
            
          case 'increase': // 재고 증가
            if (percentValue) {
              // 퍼센트 증가
              newStock = Math.round(currentStock * (1 + (Number(percentValue) / 100)));
            } else {
              // 고정 수량 증가
              newStock = currentStock + Number(value);
            }
            break;
            
          case 'decrease': // 재고 감소
            if (percentValue) {
              // 퍼센트 감소
              newStock = Math.round(currentStock * (1 - (Number(percentValue) / 100)));
            } else {
              // 고정 수량 감소
              newStock = currentStock - Number(value);
            }
            break;
        }
        
        // 재고는 음수가 될 수 없음
        newStock = Math.max(0, newStock);
        totalNewStock += newStock;
        
        updateData[`variants.${index}.stock`] = newStock;
      });
      
      // 상품 업데이트
      await Product.findByIdAndUpdate(productId, updateData);
      
      return {
        success: true,
        message: `상품 옵션 재고가 총 ${totalOldStock}개에서 ${totalNewStock}개로 변경되었습니다`,
        data: {
          oldStock: totalOldStock,
          newStock: totalNewStock
        }
      };
    } else {
      // 단일 상품인 경우
      let currentStock = product.stock || 0;
      let newStock = currentStock;
      
      // 재고 변경 액션 처리
      switch (action) {
        case 'set': // 특정 재고로 설정
          newStock = Number(value);
          break;
          
        case 'increase': // 재고 증가
          if (percentValue) {
            // 퍼센트 증가
            newStock = Math.round(currentStock * (1 + (Number(percentValue) / 100)));
          } else {
            // 고정 수량 증가
            newStock = currentStock + Number(value);
          }
          break;
          
        case 'decrease': // 재고 감소
          if (percentValue) {
            // 퍼센트 감소
            newStock = Math.round(currentStock * (1 - (Number(percentValue) / 100)));
          } else {
            // 고정 수량 감소
            newStock = currentStock - Number(value);
          }
          break;
      }
      
      // 재고는 음수가 될 수 없음
      newStock = Math.max(0, newStock);
      
      // 상품 업데이트
      await Product.findByIdAndUpdate(productId, { stock: newStock });
      
      return {
        success: true,
        message: `상품 재고가 ${currentStock}개에서 ${newStock}개로 변경되었습니다`,
        data: {
          oldStock: currentStock,
          newStock: newStock
        }
      };
    }
  } catch (error) {
    console.error(`상품 재고 업데이트 오류 (ID: ${productId}):`, error);
    return {
      success: false,
      message: `상품 재고 업데이트 중 오류 발생: ${error.message}`
    };
  }
};

/**
 * 상품 상태 일괄 수정 처리
 * @param {string} productId - 상품 ID
 * @param {Object} params - 작업 파라미터
 * @returns {Promise<Object>} 작업 결과
 */
const processProductStatusUpdate = async (productId, params) => {
  try {
    const { status } = params;
    
    // 상태 값 검증
    if (!status || !['draft', 'active', 'inactive', 'out_of_stock'].includes(status)) {
      return {
        success: false,
        message: '유효하지 않은 상태 값입니다'
      };
    }
    
    // 상품 조회
    const product = await Product.findById(productId);
    if (!product) {
      return {
        success: false,
        message: '상품을 찾을 수 없습니다'
      };
    }
    
    // 이전 상태 저장
    const oldStatus = product.status;
    
    // 이미 같은 상태인 경우
    if (oldStatus === status) {
      return {
        success: true,
        message: `상품이 이미 ${getStatusText(status)} 상태입니다`,
        data: {
          oldStatus,
          newStatus: status
        }
      };
    }
    
    // 상품 상태 업데이트
    await Product.findByIdAndUpdate(productId, { status });
    
    return {
      success: true,
      message: `상품 상태가 ${getStatusText(oldStatus)}에서 ${getStatusText(status)}(으)로 변경되었습니다`,
      data: {
        oldStatus,
        newStatus: status
      }
    };
  } catch (error) {
    console.error(`상품 상태 업데이트 오류 (ID: ${productId}):`, error);
    return {
      success: false,
      message: `상품 상태 업데이트 중 오류 발생: ${error.message}`
    };
  }
};

/**
 * 상품 마켓플레이스 일괄 연동 처리
 * @param {string} productId - 상품 ID
 * @param {Object} params - 작업 파라미터
 * @returns {Promise<Object>} 작업 결과
 */
const processProductMarketplaceSync = async (productId, params) => {
  try {
    const { marketplaceId, accountId } = params;
    
    // 필수 파라미터 검증
    if (!marketplaceId) {
      return {
        success: false,
        message: '마켓플레이스 ID가 필요합니다'
      };
    }
    
    // 상품 조회
    const product = await Product.findById(productId);
    if (!product) {
      return {
        success: false,
        message: '상품을 찾을 수 없습니다'
      };
    }
    
    // 마켓플레이스 조회
    const marketplace = await Marketplace.findById(marketplaceId);
    if (!marketplace) {
      return {
        success: false,
        message: '마켓플레이스를 찾을 수 없습니다'
      };
    }
    
    // 마켓플레이스 코드에 따른 연동 모듈 선택
    let syncFn;
    switch (marketplace.code) {
      case 'naver':
        syncFn = naverSyncProduct;
        break;
        
      case 'coupang':
        syncFn = coupangSyncProduct;
        break;
        
      case 'eleventh':
        syncFn = eleventhSyncProduct;
        break;
        
      default:
        return {
          success: false,
          message: `지원하지 않는 마켓플레이스입니다: ${marketplace.code}`
        };
    }
    
    // 마켓플레이스 연동 처리
    const syncData = {
      product,
      accountId: accountId || params.accountId
    };
    
    // 연동 API 호출
    const syncResult = await syncFn(syncData);
    
    // 기존 연동 정보 확인
    const existingMarketplaceIndex = product.marketplaces.findIndex(
      m => m.marketplaceId.toString() === marketplaceId
    );
    
    // 상품 마켓플레이스 연동 정보 업데이트
    if (existingMarketplaceIndex !== -1) {
      // 기존 마켓플레이스 정보 업데이트
      product.marketplaces[existingMarketplaceIndex] = {
        ...product.marketplaces[existingMarketplaceIndex],
        externalProductId: syncResult.externalProductId,
        status: syncResult.status,
        lastSyncDate: new Date(),
        errors: syncResult.errors || []
      };
    } else {
      // 새 마켓플레이스 정보 추가
      product.marketplaces.push({
        marketplaceId,
        externalProductId: syncResult.externalProductId,
        status: syncResult.status,
        lastSyncDate: new Date(),
        errors: syncResult.errors || []
      });
    }
    
    // 상품 업데이트
    await product.save();
    
    return {
      success: syncResult.status === 'active',
      message: syncResult.status === 'active' 
        ? `상품이 ${marketplace.name}에 성공적으로 연동되었습니다` 
        : `상품 연동 실패: ${syncResult.errors?.join(', ') || '알 수 없는 오류'}`,
      data: {
        marketplaceName: marketplace.name,
        status: syncResult.status,
        externalProductId: syncResult.externalProductId,
        errors: syncResult.errors
      }
    };
  } catch (error) {
    console.error(`상품 마켓플레이스 연동 오류 (ID: ${productId}):`, error);
    return {
      success: false,
      message: `상품 마켓플레이스 연동 중 오류 발생: ${error.message}`
    };
  }
};

/**
 * 상품 카테고리 일괄 수정 처리
 * @param {string} productId - 상품 ID
 * @param {Object} params - 작업 파라미터
 * @returns {Promise<Object>} 작업 결과
 */
const processProductCategoryUpdate = async (productId, params) => {
  try {
    const { categoryIds, action } = params;
    
    // 필수 파라미터 검증
    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return {
        success: false,
        message: '유효한 카테고리 ID 배열이 필요합니다'
      };
    }
    
    // 상품 조회
    const product = await Product.findById(productId);
    if (!product) {
      return {
        success: false,
        message: '상품을 찾을 수 없습니다'
      };
    }
    
    // 기존 카테고리 저장
    const oldCategories = product.categories.map(cat => 
      cat.toString ? cat.toString() : cat
    );
    
    // 액션에 따른 처리
    let newCategories;
    
    switch (action) {
      case 'replace': // 카테고리 대체
        newCategories = [...categoryIds];
        break;
        
      case 'add': // 카테고리 추가 (중복 제거)
        newCategories = [...new Set([...oldCategories, ...categoryIds])];
        break;
        
      case 'remove': // 카테고리 제거
        newCategories = oldCategories.filter(catId => 
          !categoryIds.includes(catId)
        );
        break;
        
      default: // 기본값: 대체
        newCategories = [...categoryIds];
    }
    
    // 상품 업데이트
    await Product.findByIdAndUpdate(productId, { categories: newCategories });
    
    return {
      success: true,
      message: `상품 카테고리가 수정되었습니다 (${action === 'replace' ? '대체' : action === 'add' ? '추가' : '제거'})`,
      data: {
        oldCategories,
        newCategories
      }
    };
  } catch (error) {
    console.error(`상품 카테고리 업데이트 오류 (ID: ${productId}):`, error);
    return {
      success: false,
      message: `상품 카테고리 업데이트 중 오류 발생: ${error.message}`
    };
  }
};

/**
 * 상품 일괄 삭제 처리
 * @param {string} productId - 상품 ID
 * @param {Object} params - 작업 파라미터
 * @returns {Promise<Object>} 작업 결과
 */
const processProductDelete = async (productId, params) => {
  try {
    // 상품 조회
    const product = await Product.findById(productId);
    if (!product) {
      return {
        success: false,
        message: '상품을 찾을 수 없습니다'
      };
    }
    
    // 상품 정보 저장 (로그용)
    const productInfo = {
      name: product.name,
      sku: product.sku
    };
    
    // 이미지 삭제 (S3 등에서 - 실제로는 s3Utils 이용)
    // 예: 이미지 URL 배열 구성 후 삭제 함수 호출
    /*
    if (product.images && product.images.length > 0) {
      const imageUrls = product.images.map(img => img.url);
      await Promise.all(imageUrls.map(url => deleteFromS3(url)));
    }
    */
    
    // 상품 삭제
    await product.remove();
    
    return {
      success: true,
      message: `상품이 삭제되었습니다: ${product.name}`,
      data: productInfo
    };
  } catch (error) {
    console.error(`상품 삭제 오류 (ID: ${productId}):`, error);
    return {
      success: false,
      message: `상품 삭제 중 오류 발생: ${error.message}`
    };
  }
};

// 헬퍼 함수: 상태 코드를 텍스트로 변환
const getStatusText = (status) => {
  switch (status) {
    case 'draft': return '임시 저장';
    case 'active': return '판매 중';
    case 'inactive': return '판매 중지';
    case 'out_of_stock': return '품절';
    default: return status;
  }
};

module.exports = {
  processProductPriceUpdate,
  processProductStockUpdate,
  processProductStatusUpdate,
  processProductMarketplaceSync,
  processProductCategoryUpdate,
  processProductDelete
};