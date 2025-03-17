// marketplaces/eleventhModule.js
const axios = require('axios');
const crypto = require('crypto');
const dayjs = require('dayjs');
const xml2js = require('xml2js');

/**
 * 11번가 오픈 API 연동 모듈
 * 실제 구현 시 11번가 API 문서를 참고하여 구현해야 합니다.
 * 이 코드는 참고용 샘플입니다.
 */
class EleventhApiClient {
  constructor(config) {
    this.apiKey = config.apiKey || '';
    this.secretKey = config.apiSecret || '';
    this.partnerId = config.additionalInfo?.partnerId || '';
    this.baseUrl = 'https://api.11st.co.kr/rest';
    this.apiVersion = '1.0';
  }
  
  /**
   * API 요청 메소드 (XML 응답)
   * @param {string} method - HTTP 메소드
   * @param {string} endpoint - API 엔드포인트
   * @param {Object} data - 요청 데이터
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise<Object>} 처리된 응답 데이터
   */
  async requestXml(method, endpoint, data = null, params = {}) {
    try {
      // 인증 헤더 구성
      const headers = {
        'openapikey': this.apiKey,
        'Content-Type': method === 'GET' ? 'application/xml' : 'application/xml;charset=utf-8'
      };
      
      // 쿼리 파라미터에 필수 값 추가
      const queryParams = {
        version: this.apiVersion,
        ...params
      };
      
      // URL 구성
      const url = `${this.baseUrl}/${endpoint}`;
      
      // 요청 전송
      const response = await axios({
        method,
        url,
        headers,
        params: queryParams,
        data: data,
        responseType: 'text' // XML 응답을 텍스트로 받음
      });
      
      // XML 응답을 JavaScript 객체로 변환
      const result = await this.parseXmlResponse(response.data);
      
      return result;
    } catch (error) {
      console.error('11번가 API 요청 오류:', error.response?.data || error.message);
      throw new Error(error.response?.data || '11번가 API 요청 중 오류가 발생했습니다.');
    }
  }
  
  /**
   * XML 응답을 JavaScript 객체로 변환
   * @param {string} xmlString - XML 문자열
   * @returns {Promise<Object>} 변환된 JavaScript 객체
   */
  parseXmlResponse(xmlString) {
    return new Promise((resolve, reject) => {
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: true
      });
      
      parser.parseString(xmlString, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
  
  /**
   * 상품 등록을 위한 XML 생성
   * @param {Object} productData - 상품 데이터
   * @returns {string} 생성된 XML 문자열
   */
  buildProductXml(productData) {
    const builder = new xml2js.Builder({
      rootName: 'ProductData',
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });
    
    return builder.buildObject(productData);
  }
  
  /**
   * 상품 등록
   * @param {Object} productData - 상품 데이터
   * @returns {Promise<Object>} API 응답 데이터
   */
  async createProduct(productData) {
    // XML 형식으로 변환
    const xmlData = this.buildProductXml(productData);
    
    return await this.requestXml('POST', 'product', xmlData);
  }
  
  /**
   * 상품 수정
   * @param {string} productId - 상품 ID
   * @param {Object} productData - 상품 데이터
   * @returns {Promise<Object>} API 응답 데이터
   */
  async updateProduct(productId, productData) {
    // XML 형식으로 변환
    productData.productNo = productId;
    const xmlData = this.buildProductXml(productData);
    
    return await this.requestXml('PUT', 'product', xmlData);
  }
  
  /**
   * 상품 조회
   * @param {string} productId - 상품 ID
   * @returns {Promise<Object>} API 응답 데이터
   */
  async getProduct(productId) {
    return await this.requestXml('GET', 'product', null, { productNo: productId });
  }
  
  /**
   * 상품 목록 조회
   * @param {Object} params - 조회 파라미터
   * @returns {Promise<Object>} API 응답 데이터
   */
  async getProducts(params = {}) {
    return await this.requestXml('GET', 'products', null, params);
  }
  
  /**
   * 상품 상태 변경
   * @param {string} productId - 상품 ID
   * @param {string} status - 변경할 상태
   * @returns {Promise<Object>} API 응답 데이터
   */
  async updateProductStatus(productId, status) {
    const xmlData = this.buildProductXml({
      productNo: productId,
      sellingStatus: status
    });
    
    return await this.requestXml('PUT', 'product/status', xmlData);
  }
  
  /**
   * 재고 수정
   * @param {string} productId - 상품 ID
   * @param {number} stock - 재고 수량
   * @returns {Promise<Object>} API 응답 데이터
   */
  async updateInventory(productId, stock) {
    const xmlData = this.buildProductXml({
      productNo: productId,
      stock: stock
    });
    
    return await this.requestXml('PUT', 'product/stock', xmlData);
  }
  
  /**
   * 카테고리 목록 조회
   * @returns {Promise<Object>} API 응답 데이터
   */
  async getCategories() {
    return await this.requestXml('GET', 'categories');
  }
  
  /**
   * 주문 목록 조회
   * @param {Object} params - 조회 파라미터
   * @returns {Promise<Object>} API 응답 데이터
   */
  async getOrders(params = {}) {
    return await this.requestXml('GET', 'orders', null, params);
  }
}

/**
 * 11번가 상품 동기화 모듈
 * @param {Object} data - 동기화 데이터
 * @returns {Promise<Object>} 동기화 결과
 */
const syncProduct = async (data) => {
  try {
    const { product, accountId, ...additionalParams } = data;
    
    // 마켓플레이스 모델 가져오기
    const Marketplace = require('../models/marketplaceModel');
    const eleventhMarketplace = await Marketplace.findOne({ code: 'eleventh' });
    
    if (!eleventhMarketplace) {
      throw new Error('11번가 마켓플레이스 설정을 찾을 수 없습니다.');
    }
    
    // 계정 정보 가져오기
    const account = eleventhMarketplace.findAccount(accountId);
    if (!account) {
      throw new Error('유효한 11번가 계정 정보를 찾을 수 없습니다.');
    }
    
    // API 클라이언트 초기화
    const eleventhApi = new EleventhApiClient({
      apiKey: account.apiKey,
      apiSecret: account.apiSecret,
      additionalInfo: account.additionalInfo
    });
    
    // 상품 정보 매핑
    const mappedProductData = eleventhMarketplace.mapProductData(product);
    
    // 카테고리 매핑
    const categoryId = additionalParams.categoryId || 
                    eleventhMarketplace.categoryMappings.find(
                      mapping => mapping.systemCategoryId.toString() === (product.categories[0]?._id || product.categories[0]).toString()
                    )?.marketCategoryId;
    
    if (!categoryId) {
      throw new Error('상품에 대한 11번가 카테고리 매핑이 없습니다.');
    }
    
    // 상품 데이터 구성 (11번가 API 형식)
    const eleventhProductData = {
      Product: {
        ...mappedProductData,
        sellerProductCode: product._id.toString(),
        sellingStatus: product.status === 'active' ? 'Selling' : 'Unselling',
        categoryCode: categoryId,
        displayCategoryCode: categoryId,
        prdNm: product.name,
        brand: product.brand || '',
        prdNo: '', // 신규 상품인 경우 빈 값
        rmaterialTypeCode: 'None',
        productType: 'Stock',
        taxType: 'Default',
        minorYn: 'N',
        prdImage01: product.images.find(img => img.isMain)?.url || product.images[0]?.url || '',
        prdImage02: product.images[1]?.url || '',
        prdImage03: product.images[2]?.url || '',
        prdImage04: product.images[3]?.url || '',
        htmlDetail: product.description,
        selPrc: product.regularPrice,
        dispPrc: product.salePrice || product.regularPrice,
        stock: product.hasVariants 
          ? product.variants.reduce((total, variant) => total + (variant.stock || 0), 0)
          : (product.stock || 0),
        optionInfo: product.hasVariants && product.options.length > 0
          ? {
              useOption: 'Y',
              useOptionImg: 'N',
              useOptionInv: 'Y',
              options: product.options.map((option, index) => ({
                optionName: option.name,
                optionValues: option.values.map(value => ({
                  optValue: value.name,
                  addPrice: value.additionalPrice || 0
                }))
              })),
              combinations: product.variants.map(variant => ({
                optionCombination: variant.optionCombination,
                stockQty: variant.stock || 0,
                sellPrice: variant.price || product.regularPrice
              }))
            }
          : {
              useOption: 'N'
            }
      }
    };
    
    // 연동 정보 찾기
    const existingMarketInfo = product.marketplaces?.find(
      m => m.marketplaceId.toString() === eleventhMarketplace._id.toString()
    );
    
    let result;
    
    // 상품 생성 또는 업데이트
    if (existingMarketInfo && existingMarketInfo.externalProductId) {
      // 상품 업데이트
      eleventhProductData.Product.prdNo = existingMarketInfo.externalProductId;
      result = await eleventhApi.updateProduct(
        existingMarketInfo.externalProductId,
        eleventhProductData
      );
      
      // 상품 상태 업데이트
      await eleventhApi.updateProductStatus(
        existingMarketInfo.externalProductId, 
        product.status === 'active' ? 'Selling' : 'Unselling'
      );
      
      console.log(`11번가 상품 업데이트 성공: ${result.ProductResponse?.productNo}`);
    } else {
      // 신규 상품 등록
      result = await eleventhApi.createProduct(eleventhProductData);
      console.log(`11번가 상품 등록 성공: ${result.ProductResponse?.productNo}`);
    }
    
    // 로그 기록
    await eleventhMarketplace.addSyncLog({
      action: 'sync_product',
      status: 'success',
      details: `상품 ${result.ProductResponse?.productNo} 동기화 성공`,
      productId: product._id,
      accountId: account._id,
      requestData: eleventhProductData,
      responseData: result
    });
    
    // 결과 반환
    return {
      externalProductId: result.ProductResponse?.productNo,
      status: 'active',
      errors: []
    };
  } catch (error) {
    console.error('11번가 상품 동기화 오류:', error);
    
    // 오류 로그 기록
    if (data.product && data.product._id) {
      const Marketplace = require('../models/marketplaceModel');
      const eleventhMarketplace = await Marketplace.findOne({ code: 'eleventh' });
      
      if (eleventhMarketplace) {
        await eleventhMarketplace.addSyncLog({
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
  EleventhApiClient,
  syncProduct
};