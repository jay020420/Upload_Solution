// models/categoryModel.js
const mongoose = require('mongoose');
const slugify = require('slugify');

// 카테고리 스키마
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '카테고리 이름은 필수입니다'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 1
  },
  path: {
    type: String
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 가상필드: 하위 카테고리
CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
  justOne: false
});

// 슬러그 자동 생성 (저장 전)
CategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, locale: 'ko' });
  }
  next();
});

// 전체 경로 생성 (저장 전)
CategorySchema.pre('save', async function(next) {
  if (this.parent && this.isModified('parent')) {
    const parentCategory = await this.constructor.findById(this.parent);
    if (parentCategory) {
      this.level = parentCategory.level + 1;
      this.path = parentCategory.path ? `${parentCategory.path} > ${this.name}` : this.name;
    }
  } else if (!this.parent) {
    this.level = 1;
    this.path = this.name;
  }
  next();
});

// 인덱스 생성
CategorySchema.index({ name: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ level: 1 });
CategorySchema.index({ isActive: 1 });

// 카테고리 모델 생성
const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;