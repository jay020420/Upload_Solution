// marketplaces/coupangModule.js
const axios = require('axios');
const crypto = require('crypto');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul');

/**
 * 쿠팡 오픈 API 연동 모듈
 * 실제 구현 시 쿠팡 API 문서를 참고하여 구현해야 합니다.
 * 이 코드는 참고용 샘플입니다.
 */
class CoupangApiClient {
  constructor(config) {
    this.vendorId = config.vendorId || '';
    this.accessKey = config.apiKey || '';
    this.secretKey = config.apiSecret || '';
    this.baseUrl = 'https://api-gateway.coupang.com';
    this.apiVersion = '1.0';
  }
  
  /**
   * 인증 헤더 생성
   * @param {string} method - HTTP 메소드
   * @param {string} path - API 경로
   * @param {string} queryString - 쿼리 파라미터 문자열
   * @returns {Object} 인증 헤더
   */
  getAuthHeaders(method, path, queryString = '') {
    const timestamp = dayjs().tz('Asia/Seoul').format('YYMMDD[T]HHmmss[Z]');
    const message = `${method} ${path}${queryString}\n${timestamp}`;
    
    // HMAC 서명 생성
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('base64');
    
    return {
      'Content-Type': 'application/json;charset=UTF-8',
      'X-EXTENDED-TIMESTAMP': timestamp,
      'X-EXTENDED-ACCESS-KEY': this.accessKey,
      'X-EXTENDED-SIGNATURE': signature,
      'X-EXTENDED-VENDOR-ID': this.vendorId
    };
  }
  
  /**
   * API 요청 메소드
   * @param {string} method - HTTP 메소드
   * @param {string} endpoint - API 엔드포인트
   * @param {Object} data - 요청 데이터
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise<Object>} API 응답 데이터
   */
  async request(method, endpoint, data = null, params = {}) {
    try {
      const url = `${this.baseUrl}/v${this.apiVersion}/${endpoint}`;
      
      // 쿼리 파라미터 구성
      const queryString = this.buildQueryString(params);
      const path = `/v${this.apiVersion}/${endpoint}`;
      const fullPath = path + (queryString ? `?${queryString}` : '');
      
      // 인증 헤더 생성
      const headers = this.getAuthHeaders(method, path, queryString ? `?${queryString}` : '');
      
      const response = await axios({
        method,
        url: url + (queryString ? `?${queryString}` : ''),
        headers,
        data: data ? JSON.stringify(data) : undefined
      });
      
      return response.data;
    } catch (error) {
      console.error('쿠팡 API 요청 오류:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '쿠팡 API 요청 중 오류가 발생했습니다.');
    }
  }
  
  /**
   * 쿼리 파라미터 문자열 구성
   * @param {Object} params - 쿼리 파라미터 객체
   * @returns {string} 쿼리 파라미터 문자열
   */
  buildQueryString(params) {
    return Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }
  
  /**
   * 상품 등록
   * @param {Object} productData - 상품 데이터
   * @returns {Promise<Object>} API 응답 데이터
   */
  async createProduct(productData) {
    return await this.request('POST', 'marketplace/seller-products', productData);
  }
  
  /**
   * 상품 수정
   * @param {string} productId - 상품 ID
   * @param {Object} productData - 상품 데이터
   * @returns {Promise<Object>} API 응답 데이터
   */
  async updateProduct(productId, productData) {
    return await this.request('PUT', `marketplace/seller-products/${productId}`, productData);
  }
  
  /**
   * 상품 조회
   * @param {string} productId - 상품 ID
   * @returns {Promise<Object>} API 응답 데이터
   */
  async getProduct(productId) {
    return await this.request('GET', `marketplace/seller-products/${productId}`);
  }
  
  /**
   * 상품 목록 조회
   * @param {Object} params - 조회 파라미터
   * @returns {Promise<Object>} API 응답 데이터
   */
  async getProducts(params = {}) {
    return await this.request('GET', 'marketplace/seller-products', null, params);
  }
  
  /**
   * 상품 상태 변경
   * @param {string} productId - 상품 ID
   * @param {string} status - 변경할 상태
   * @returns {Promise<Object>} API 응답 데이터
   */
  async updateProductStatus(productId, status) {
    return await this.request('PUT', `marketplace/seller-products/${productId}/status`, { status });
  }
  
  /**
   * 재고 수정
   * @param {string} productId - 상품 ID
   * @param {Object} stockData - 재고 데이터
   * @returns {Promise<Object>} API 응답 데이터
   */
  async updateInventory(productId, stockData) {
    return await this.request('PUT', `marketplace/seller-products/${productId}/inventory`, stockData);
  }
  
  /**
   * 카테고리 목록 조회
   * @returns {Promise<Object>} API 응답 데이터
   */
  async getCategories() {
    return await this.request('GET', 'marketplace/categories');
  }
  
  /**
   * 주문 목록 조회
   * @param {Object} params - 조회 파라미터
   * @returns {Promise<Object>} API 응답 데이터
   */
  async getOrders(params = {}) {
    return await this.request('GET', 'marketplace/orders', null, params);
  }
}

/**
 * 쿠팡 상품 동기화 모듈
 * @param {Object} data - 동기화 데이터
 * @returns {Promise<Object>} 동기화 결과
 */
const syncProduct = async (data) => {
  try {
    const { product, accountId, ...additionalParams } = data;
    
    // 마켓플레이스 모델 가져오기
    const Marketplace = require('../models/marketplaceModel');
    const coupangMarketplace = await Marketplace.findOne({ code: 'coupang' });
    
    if (!coupangMarketplace) {
      throw new Error('쿠팡 마켓플레이스 설정을 찾을 수 없습니다.');
    }
    
    // 계정 정보 가져오기
    const account = coupangMarketplace.findAccount(accountId);
    if (!account) {
      throw new Error('유효한 쿠팡 계정 정보를 찾을 수 없습니다.');
    }
    
    // API 클라이언트 초기화
    const coupangApi = new CoupangApiClient({
      vendorId: account.additionalInfo?.get('vendorId'),
      apiKey: account.apiKey,
      apiSecret: account.apiSecret
    });
    
    // 상품 정보 매핑
    const mappedProductData = coupangMarketplace.mapProductData(product);
    
    // 카테고리 매핑
    const categoryId = additionalParams.categoryId || 
                    coupangMarketplace.categoryMappings.find(
                      mapping => mapping.systemCategoryId.toString() === (product.categories[0]?._id || product.categories[0]).toString()
                    )?.marketCategoryId;
    
    if (!categoryId) {
      throw new Error('상품에 대한 쿠팡 카테고리 매핑이 없습니다.');
    }
    
    // 상품 데이터 구성
    const coupangProductData = {
      ...mappedProductData,
      categoryId,
      displayCategoryCode: categoryId,
      vendorId: account.additionalInfo?.get('vendorId'),
      sellerProductName: product.name,
      sellerProductId: product._id.toString(),
      images: product.images.map(img => ({
        imageOrder: img.order + 1,
        imageType: img.isMain ? 'REPRESENTATION' : 'DETAIL',
        imageUrl: img.url
      })),
      contents: product.description,
      items: product.hasVariants && product.variants.length > 0
        ? product.variants.map(variant => ({
            itemName: variant.optionCombination,
            originalPrice: variant.price,
            salePrice: variant.price,
            maximumBuyCount: 999,
            maximumBuyForPerson: 0,
            outboundShippingTimeDay: 2,
            unitCount: 1,
            adultOnly: 'EVERYONE',
            taxType: 'TAX',
            parallelImported: 'NOT_PARALLEL_IMPORTED',
            overseasPurchased: 'NOT_OVERSEAS_PURCHASED',
            pccNeeded: false,
            externalVendorSku: variant.sku || '',
            barcode: variant.barcode || '',
            emptyBarcode: !variant.barcode,
            emptyBarcodeReason: !variant.barcode ? 'NO_BARCODE' : '',
            certifications: [],
            searchTags: product.keywords || [],
            images: product.images.map(img => ({
              imageOrder: img.order + 1,
              imageType: img.isMain ? 'REPRESENTATION' : 'DETAIL',
              imageUrl: img.url
            })),
            notices: [],
            attributes: [],
            contents: product.description,
            requiredDocuments: [],
            itemWeight: product.weight || 0,
            itemSizeDimensions: {
              length: product.dimensions?.length || 0,
              width: product.dimensions?.width || 0,
              height: product.dimensions?.height || 0,
              unit: 'CM'
            },
            inheritFromItemId: null
          }))
        : [{
            itemName: product.name,
            originalPrice: product.regularPrice,
            salePrice: product.salePrice || product.regularPrice,
            maximumBuyCount: 999,
            maximumBuyForPerson: 0,
            outboundShippingTimeDay: 2,
            unitCount: 1,
            adultOnly: 'EVERYONE',
            taxType: 'TAX',
            parallelImported: 'NOT_PARALLEL_IMPORTED',
            overseasPurchased: 'NOT_OVERSEAS_PURCHASED',
            pccNeeded: false,
            externalVendorSku: product.sku || '',
            barcode: '',
            emptyBarcode: true,
            emptyBarcodeReason: 'NO_BARCODE',
            certifications: [],
            searchTags: product.keywords || [],
            images: product.images.map(img => ({
              imageOrder: img.order + 1,
              imageType: img.isMain ? 'REPRESENTATION' : 'DETAIL',
              imageUrl: img.url
            })),
            notices: [],
            attributes: [],
            contents: product.description,
            requiredDocuments: [],
            itemWeight: product.weight || 0,
            itemSizeDimensions: {
              length: product.dimensions?.length || 0,
              width: product.dimensions?.width || 0,
              height: product.dimensions?.height || 0,
              unit: 'CM'
            },
            inheritFromItemId: null
          }]
    };
    
    // 연동 정보 찾기
    const existingMarketInfo = product.marketplaces?.find(
      m => m.marketplaceId.toString() === coupangMarketplace._id.toString()
    );
    
    let result;
    
    // 상품 생성 또는 업데이트
    if (existingMarketInfo && existingMarketInfo.externalProductId) {
      // 상품 업데이트
      result = await coupangApi.updateProduct(
        existingMarketInfo.externalProductId,
        coupangProductData
      );
      
      // 상품 상태 업데이트
      await coupangApi.updateProductStatus(
        existingMarketInfo.externalProductId, 
        product.status === 'active' ? 'SALE' : 'STOP_SELLING'
      );
      
      console.log(`쿠팡 상품 업데이트 성공: ${result.productId}`);
    } else {
      // 신규 상품 등록
      result = await coupangApi.createProduct(coupangProductData);
      console.log(`쿠팡 상품 등록 성공: ${result.productId}`);
    }
    
    // 로그 기록
    await coupangMarketplace.addSyncLog({
      action: 'sync_product',
      status: 'success',
      details: `상품 ${result.productId} 동기화 성공`,
      productId: product._id,
      accountId: account._id,
      requestData: coupangProductData,
      responseData: result
    });
    
    // 결과 반환
    return {
      externalProductId: result.productId,
      status: 'active',
      errors: []
    };
  } catch (error) {
    console.error('쿠팡 상품 동기화 오류:', error);
    
    // 오류 로그 기록
    if (data.product && data.product._id) {
      const Marketplace = require('../models/marketplaceModel');
      const coupangMarketplace = await Marketplace.findOne({ code: 'coupang' });
      
      if (coupangMarketplace) {
        await coupangMarketplace.addSyncLog({
          action: 'sync_product',
          status: 'error',
          details: `상품 동기화 실패: ${error.message}`,
          productId: data.product._id,
          accountId: data.accountId
        });
      }
    }
    
    return {
      externalProductId: '',
      status: 'rejected',
      errors: [error.message]
    };
  }
};

module.exports = {
  CoupangApiClient,
  syncProduct
};