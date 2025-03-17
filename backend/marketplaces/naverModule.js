// marketplaces/naverModule.js
const axios = require('axios');
const crypto = require('crypto');
const dayjs = require('dayjs');

/**
 * 네이버 스마트스토어 연동 모듈
 * 실제 구현 시 네이버 API 문서를 참고하여 구현해야 합니다.
 * 이 코드는 참고용 샘플입니다.
 */
class NaverSmartStoreAPI {
  constructor(config) {
    this.clientId = config.apiKey;
    this.clientSecret = config.apiSecret;
    this.accessToken = config.accessToken;
    this.shopId = config.shopId;
    this.baseUrl = 'https://api.commerce.naver.com/external';
    this.apiVersion = 'v1';
  }
  
  /**
   * 인증 헤더 생성
   */
  getAuthHeaders() {
    const timestamp = Date.now().toString();
    
    // HMAC 서명 생성
    const signature = crypto
      .createHmac('sha256', this.clientSecret)
      .update(timestamp)
      .digest('base64');
    
    return {
      'Content-Type': 'application/json',
      'X-Timestamp': timestamp,
      'X-Client-Id': this.clientId,
      'X-Client-Signature': signature,
      'X-Shop-Id': this.shopId,
      'Authorization': `Bearer ${this.accessToken}`
    };
  }
  
  /**
   * API 요청 메소드
   */
  async request(method, endpoint, data = null) {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${endpoint}`;
      const headers = this.getAuthHeaders();
      
      const response = await axios({
        method,
        url,
        headers,
        data: data ? JSON.stringify(data) : undefined
      });
      
      return response.data;
    } catch (error) {
      console.error('네이버 API 요청 오류:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '네이버 API 요청 중 오류가 발생했습니다.');
    }
  }
  
  /**
   * 액세스 토큰 갱신
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post('https://api.commerce.naver.com/external/token', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      });
      
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenExpiry: dayjs().add(response.data.expires_in, 'second').toDate()
      };
    } catch (error) {
      console.error('토큰 갱신 오류:', error.response?.data || error.message);
      throw new Error('네이버 액세스 토큰 갱신 중 오류가 발생했습니다.');
    }
  }
  
  /**
   * 상품 등록
   */
  async createProduct(productData) {
    return await this.request('POST', 'products', productData);
  }
  
  /**
   * 상품 수정
   */
  async updateProduct(productId, productData) {
    return await this.request('PUT', `products/${productId}`, productData);
  }
  
  /**
   * 상품 상태 변경
   */
  async updateProductStatus(productId, status) {
    return await this.request('PUT', `products/${productId}/status`, { status });
  }
  
  /**
   * 상품 삭제
   */
  async deleteProduct(productId) {
    return await this.request('DELETE', `products/${productId}`);
  }
  
  /**
   * 상품 조회
   */
  async getProduct(productId) {
    return await this.request('GET', `products/${productId}`);
  }
  
  /**
   * 상품 목록 조회
   */
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      queryParams.append(key, value);
    }
    
    return await this.request('GET', `products?${queryParams.toString()}`);
  }
  
  /**
   * 재고 수정
   */
  async updateInventory(productId, stockData) {
    return await this.request('PUT', `products/${productId}/inventory`, stockData);
  }
  
  /**
   * 카테고리 목록 조회
   */
  async getCategories() {
    return await this.request('GET', 'categories');
  }
  
  /**
   * 주문 목록 조회
   */
  async getOrders(params = {}) {
    const queryParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      queryParams.append(key, value);
    }
    
    return await this.request('GET', `orders?${queryParams.toString()}`);
  }
}

/**
 * 네이버 스마트스토어 상품 동기화 모듈
 */
const syncProduct = async (data) => {
  try {
    const { product, accountId, ...additionalParams } = data;
    
    // 마켓플레이스 모델 가져오기
    const Marketplace = require('../models/marketplaceModel');
    const naverMarketplace = await Marketplace.findOne({ code: 'naver' });
    
    if (!naverMarketplace) {
      throw new Error('네이버 마켓플레이스 설정을 찾을 수 없습니다.');
    }
    
    // 계정 정보 가져오기
    const account = naverMarketplace.findAccount(accountId);
    if (!account) {
      throw new Error('유효한 네이버 계정 정보를 찾을 수 없습니다.');
    }
    
    // API 클라이언트 초기화
    const naverApi = new NaverSmartStoreAPI({
      apiKey: account.apiKey,
      apiSecret: account.apiSecret,
      accessToken: account.accessToken,
      shopId: account.shopId
    });
    
    // 액세스 토큰 만료 확인 및 갱신
    if (account.tokenExpiry && new Date(account.tokenExpiry) < new Date()) {
      console.log('네이버 액세스 토큰 갱신 중...');
      const tokenData = await naverApi.refreshAccessToken(account.refreshToken);
      
      // 토큰 정보 업데이트
      account.accessToken = tokenData.accessToken;
      account.refreshToken = tokenData.refreshToken;
      account.tokenExpiry = tokenData.tokenExpiry;
      await naverMarketplace.save();
      
      // API 클라이언트 토큰 업데이트
      naverApi.accessToken = tokenData.accessToken;
    }
    
    // 상품 정보 매핑
    const mappedProductData = naverMarketplace.mapProductData(product);
    
    // 카테고리 매핑
    const categoryId = additionalParams.categoryId || 
                    naverMarketplace.categoryMappings.find(
                      mapping => mapping.systemCategoryId.toString() === (product.categories[0]?._id || product.categories[0]).toString()
                    )?.marketCategoryId;
    
    if (!categoryId) {
      throw new Error('상품에 대한 네이버 카테고리 매핑이 없습니다.');
    }
    
    // 상품 데이터 구성
    const naverProductData = {
      ...mappedProductData,
      categoryId,
      detailContent: product.description,
      images: product.images.map(img => ({
        url: img.url,
        order: img.order,
        representativeImage: img.isMain
      })),
      saleStatus: product.status === 'active' ? 'ON_SALE' : 'STOP_SALE',
      // 옵션 구성
      options: product.hasVariants && product.options.length > 0
        ? {
            optionUsable: true,
            optionItems: product.options.map(opt => ({
              groupName: opt.name,
              options: opt.values.map(val => ({
                name: val.name,
                additionalPrice: val.additionalPrice
              }))
            })),
            combinations: product.variants.map(variant => ({
              optionNames: variant.optionCombination.split(' / '),
              price: variant.price,
              stockQuantity: variant.stock,
              sellerProductCode: variant.sku
            }))
          }
        : {
            optionUsable: false,
            stockQuantity: product.stock,
            sellerProductCode: product.sku || ''
          }
    };
    
    // 연동 정보 찾기
    const existingMarketInfo = product.marketplaces?.find(
      m => m.marketplaceId.toString() === naverMarketplace._id.toString()
    );
    
    let result;
    
    // 상품 생성 또는 업데이트
    if (existingMarketInfo && existingMarketInfo.externalProductId) {
      // 상품 업데이트
      result = await naverApi.updateProduct(
        existingMarketInfo.externalProductId,
        naverProductData
      );
      
      // 상품 상태 업데이트
      await naverApi.updateProductStatus(
        existingMarketInfo.externalProductId, 
        product.status === 'active' ? 'ON_SALE' : 'STOP_SALE'
      );
      
      console.log(`네이버 상품 업데이트 성공: ${result.productId}`);
    } else {
      // 신규 상품 등록
      result = await naverApi.createProduct(naverProductData);
      console.log(`네이버 상품 등록 성공: ${result.productId}`);
    }
    
    // 로그 기록
    await naverMarketplace.addSyncLog({
      action: 'sync_product',
      status: 'success',
      details: `상품 ${result.productId} 동기화 성공`,
      productId: product._id,
      accountId: account._id,
      requestData: naverProductData,
      responseData: result
    });
    
    // 결과 반환
    return {
      externalProductId: result.productId,
      status: 'active',
      errors: []
    };
  } catch (error) {
    console.error('네이버 상품 동기화 오류:', error);
    
    // 오류 로그 기록
    if (data.product && data.product._id) {
      const Marketplace = require('../models/marketplaceModel');
      const naverMarketplace = await Marketplace.findOne({ code: 'naver' });
      
      if (naverMarketplace) {
        await naverMarketplace.addSyncLog({
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
  NaverSmartStoreAPI,
  syncProduct
};