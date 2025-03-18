// models/marketplaceModel.js
const mongoose = require('mongoose');

// 마켓플레이스 카테고리 매핑 스키마
const CategoryMappingSchema = new mongoose.Schema({
  systemCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  marketCategoryId: {
    type: String,
    required: true
  },
  marketCategoryName: {
    type: String,
    required: true
  },
  marketCategoryPath: String
});

// 마켓플레이스 계정 정보 스키마
const AccountInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  apiKey: { type: String },
  apiSecret: { type: String },
  accessToken: String,
  refreshToken: String,
  tokenExpiry: Date,
  shopId: String,
  sellerId: String,
  additionalInfo: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  isActive: { type: Boolean, default: true },
  lastSyncDate: { type: Date }
});

// 마켓플레이스 필드 매핑 스키마
const FieldMappingSchema = new mongoose.Schema({
  systemField: { type: String, required: true },
  marketField: { type: String, required: true },
  defaultValue: String,
  transformFunction: String,
  isRequired: { type: Boolean, default: false }
});

// 마켓플레이스 연동 로그 스키마
const SyncLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    enum: ['sync_product', 'sync_order', 'sync_inventory', 'sync_category'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['success', 'warning', 'error'],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  details: String,
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId
  },
  requestData: Object,
  responseData: Object
});

// 마켓플레이스 메인 스키마
const MarketplaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: String,
  logo: String,
  website: String,
  isActive: { type: Boolean, default: true },
  
  // 마켓플레이스 API 설정
  apiBaseUrl: String,
  apiVersion: String,
  authType: { 
    type: String, 
    enum: ['oauth2', 'apikey', 'basic'], 
    default: 'apikey' 
  },
  
  // 연동 기능 지원 여부
  features: {
    productSync: { type: Boolean, default: true },
    orderSync: { type: Boolean, default: true },
    inventorySync: { type: Boolean, default: true },
    categorySync: { type: Boolean, default: true },
    autoFulfillment: { type: Boolean, default: false }
  },
  
  // 계정 정보 (다중 계정 지원)
  accounts: [AccountInfoSchema],
  
  // 카테고리 매핑
  categoryMappings: [CategoryMappingSchema],
  
  // 필드 매핑 (상품 정보 변환 규칙)
  fieldMappings: [FieldMappingSchema],
  
  // 연동 로그
  syncLogs: [SyncLogSchema],
  
  // 추가 설정
  settings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // 메타 정보
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 인덱스 추가
MarketplaceSchema.index({ code: 1 });
MarketplaceSchema.index({ isActive: 1 });
MarketplaceSchema.index({ 'accounts.isActive': 1 });
MarketplaceSchema.index({ 'syncLogs.timestamp': -1 });

// 마켓 계정 찾기 메소드
MarketplaceSchema.methods.findAccount = function(accountId) {
  if (!accountId && this.accounts.length > 0) {
    // 기본 계정 찾기
    const defaultAccount = this.accounts.find(account => account.isDefault);
    return defaultAccount || this.accounts[0];
  }
  
  return this.accounts.id(accountId);
};

// 활성 계정 찾기 메소드
MarketplaceSchema.methods.getActiveAccounts = function() {
  return this.accounts.filter(account => account.isActive);
};

// 필드 매핑 메소드
MarketplaceSchema.methods.mapProductData = function(product) {
  const mappedData = {};
  
  this.fieldMappings.forEach(mapping => {
    let value = null;
    
    // 시스템 필드값 추출 (중첩 필드 지원: product.variants.0.sku)
    if (mapping.systemField.includes('.')) {
      const fieldParts = mapping.systemField.split('.');
      let currentValue = product;
      
      for (const part of fieldParts) {
        if (currentValue && typeof currentValue === 'object') {
          // 배열 인덱스 처리 (product.variants.0.sku 형식)
          if (!isNaN(part) && Array.isArray(currentValue)) {
            currentValue = currentValue[parseInt(part)];
          } else {
            currentValue = currentValue[part];
          }
        } else {
          currentValue = null;
          break;
        }
      }
      
      value = currentValue;
    } else {
      value = product[mapping.systemField];
    }
    
    // 값이 없고 기본값이 설정된 경우
    if ((value === undefined || value === null) && mapping.defaultValue) {
      value = mapping.defaultValue;
    }
    
    // 변환 함수가 있는 경우 적용 (eval 대신 안전한 방식 사용)
    if (value !== undefined && value !== null && mapping.transformFunction) {
      try {
        // 안전하지 않은 함수 실행 방지를 위한 검증 
        if (mapping.transformFunction.includes('require') || 
            mapping.transformFunction.includes('process') || 
            mapping.transformFunction.includes('global') ||
            mapping.transformFunction.includes('__dirname') ||
            mapping.transformFunction.includes('__filename')) {
          console.error(`변환 함수에 안전하지 않은 코드가 포함되어 있습니다: ${mapping.systemField}`);
        } else {
          // Function 생성자 사용 (eval보다는 안전하지만 여전히 주의 필요)
          const transformFn = new Function('value', `
            try {
              return ${mapping.transformFunction};
            } catch (e) {
              console.error("변환 함수 실행 오류:", e);
              return value;
            }
          `);
          value = transformFn(value);
        }
      } catch (error) {
        console.error(`Transform function error for ${mapping.systemField}:`, error);
      }
    }
    
    mappedData[mapping.marketField] = value;
  });
  
  return mappedData;
};

// 로그 추가 메소드
MarketplaceSchema.methods.addSyncLog = function(logData) {
  this.syncLogs.push(logData);
  
  // 로그 개수 제한 (최근 1000개만 유지)
  if (this.syncLogs.length > 1000) {
    this.syncLogs = this.syncLogs.slice(-1000);
  }
  
  return this.save();
};

const Marketplace = mongoose.model('Marketplace', MarketplaceSchema);

module.exports = Marketplace;