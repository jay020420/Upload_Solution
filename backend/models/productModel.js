// models/productModel.js
const mongoose = require('mongoose');

// 옵션 값 스키마
const OptionValueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  additionalPrice: { type: Number, default: 0 },
  sku: String,
  stock: { type: Number, default: 0 }
});

// 옵션 스키마
const OptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  values: [OptionValueSchema]
});

// 상품 조합 스키마 (옵션 조합)
const VariantSchema = new mongoose.Schema({
  optionCombination: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  sku: String,
  barcode: String,
  isActive: { type: Boolean, default: true }
});

// 이미지 스키마
const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: String,
  order: { type: Number, default: 0 },
  isMain: { type: Boolean, default: false }
});

// 마켓 연동 정보 스키마
const MarketplaceInfoSchema = new mongoose.Schema({
  marketplaceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Marketplace', 
    required: true 
  },
  externalProductId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending', 'rejected'], 
    default: 'pending' 
  },
  categoryMapping: { type: String },
  lastSyncDate: { type: Date, default: Date.now },
  errors: [String]
});

// 상품 메인 스키마
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: String,
  brand: String,
  regularPrice: { type: Number, required: true },
  salePrice: Number,
  costPrice: Number,
  
  // 카테고리 (다중 카테고리 지원)
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  
  // 옵션과 조합
  hasVariants: { type: Boolean, default: false },
  options: [OptionSchema],
  variants: [VariantSchema],
  
  // 이미지
  images: [ImageSchema],
  
  // 상품 상태
  status: { 
    type: String, 
    enum: ['draft', 'active', 'inactive', 'out_of_stock'], 
    default: 'draft' 
  },
  
  // 마켓 연동 정보
  marketplaces: [MarketplaceInfoSchema],
  
  // 검색 및 SEO
  keywords: [String],
  metaTitle: String,
  metaDescription: String,
  
  // 배송 정보
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  shippingClass: String,
  
  // 추가 필드 (유연성을 위한 동적 필드)
  additionalFields: {
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
ProductSchema.index({ name: 'text', description: 'text', keywords: 'text' });
ProductSchema.index({ status: 1 });
ProductSchema.index({ 'categories': 1 });
ProductSchema.index({ 'marketplaces.marketplaceId': 1, 'marketplaces.externalProductId': 1 });

// 메소드 추가
ProductSchema.methods.getSaleStatus = function() {
  if (this.salePrice && this.salePrice < this.regularPrice) {
    return {
      onSale: true,
      discountPercent: Math.round(((this.regularPrice - this.salePrice) / this.regularPrice) * 100)
    };
  }
  return { onSale: false, discountPercent: 0 };
};

// 총 재고 계산하는 가상 필드
ProductSchema.virtual('totalStock').get(function() {
  if (this.hasVariants && this.variants.length > 0) {
    return this.variants.reduce((total, variant) => total + variant.stock, 0);
  }
  return this.stock || 0;
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;