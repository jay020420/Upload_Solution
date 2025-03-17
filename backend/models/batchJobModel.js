// models/batchJobModel.js
const mongoose = require('mongoose');

// 배치 작업 아이템 스키마 (개별 작업 항목)
const BatchJobItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType'
  },
  itemType: {
    type: String,
    required: true,
    enum: ['Product', 'Category', 'Marketplace']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  result: {
    success: { type: Boolean, default: false },
    message: String,
    data: mongoose.Schema.Types.Mixed
  },
  errors: [String],
  processingTime: Number, // 처리 소요 시간 (ms)
  retryCount: { type: Number, default: 0 },
  lastProcessedAt: Date
});

// 배치 작업 스키마
const BatchJobSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    required: true,
    enum: [
      'product_price_update',      // 상품 가격 일괄 수정
      'product_stock_update',      // 상품 재고 일괄 수정
      'product_status_update',     // 상품 상태 일괄 수정
      'product_marketplace_sync',  // 상품 마켓플레이스 일괄 연동
      'product_category_update',   // 상품 카테고리 일괄 수정
      'product_delete',            // 상품 일괄 삭제
      'custom'                     // 사용자 정의 작업
    ]
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'paused'],
    default: 'pending'
  },
  progress: {
    total: { type: Number, default: 0 },
    processed: { type: Number, default: 0 },
    succeeded: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  params: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  items: [BatchJobItemSchema],
  priority: {
    type: Number,
    default: 1, // 1: 낮음, 2: 보통, 3: 높음
    min: 1,
    max: 3
  },
  startedAt: Date,
  completedAt: Date,
  estimatedCompletionAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  logs: [{
    message: String,
    level: {
      type: String,
      enum: ['info', 'warning', 'error', 'debug'],
      default: 'info'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// 인덱스 생성
BatchJobSchema.index({ status: 1, createdAt: -1 });
BatchJobSchema.index({ 'items.status': 1 });
BatchJobSchema.index({ createdBy: 1 });
BatchJobSchema.index({ type: 1 });

// 상태 업데이트 시 타임스탬프 설정 미들웨어
BatchJobSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'processing' && !this.startedAt) {
      this.startedAt = new Date();
    } else if (this.status === 'completed' || this.status === 'failed') {
      this.completedAt = new Date();
    }
  }
  next();
});

// 진행률 업데이트 메소드
BatchJobSchema.methods.updateProgress = function() {
  const total = this.items.length;
  const processed = this.items.filter(item => 
    item.status === 'completed' || item.status === 'failed'
  ).length;
  const succeeded = this.items.filter(item => 
    item.status === 'completed' && item.result.success
  ).length;
  const failed = this.items.filter(item => 
    item.status === 'failed' || (item.status === 'completed' && !item.result.success)
  ).length;
  
  this.progress = {
    total,
    processed,
    succeeded,
    failed
  };
  
  // 모두 처리 완료된 경우 상태 업데이트
  if (processed === total && total > 0) {
    if (failed === 0) {
      this.status = 'completed';
    } else if (succeeded === 0) {
      this.status = 'failed';
    } else {
      this.status = 'completed'; // 일부 실패해도 완료로 간주
      this.addLog(`작업 완료 (성공: ${succeeded}, 실패: ${failed})`, 'info');
    }
    this.completedAt = new Date();
  }
  
  return this.save();
};

// 로그 추가 메소드
BatchJobSchema.methods.addLog = function(message, level = 'info') {
  this.logs.push({
    message,
    level,
    timestamp: new Date()
  });
  
  // 로그가 너무 많아지면 오래된 로그 삭제
  if (this.logs.length > 100) {
    this.logs = this.logs.slice(-100);
  }
  
  return this;
};

// 배치 작업 아이템 업데이트 메소드
BatchJobSchema.methods.updateItem = function(itemId, updateData) {
  const itemIndex = this.items.findIndex(item => item._id.toString() === itemId.toString());
  
  if (itemIndex !== -1) {
    Object.assign(this.items[itemIndex], updateData);
    
    // 아이템 상태 변경 시 관련 필드 업데이트
    if (updateData.status) {
      if (updateData.status === 'completed' || updateData.status === 'failed') {
        this.items[itemIndex].lastProcessedAt = new Date();
      }
    }
    
    // 작업 진행률 업데이트
    this.updateProgress();
  }
  
  return this;
};

// 배치 작업 취소 메소드
BatchJobSchema.methods.cancel = function() {
  if (this.status === 'pending' || this.status === 'processing' || this.status === 'paused') {
    this.status = 'cancelled';
    this.addLog('작업이 취소되었습니다', 'info');
    return this.save();
  }
  return this;
};

// 배치 작업 일시정지 메소드
BatchJobSchema.methods.pause = function() {
  if (this.status === 'processing') {
    this.status = 'paused';
    this.addLog('작업이 일시정지되었습니다', 'info');
    return this.save();
  }
  return this;
};

// 배치 작업 재개 메소드
BatchJobSchema.methods.resume = function() {
  if (this.status === 'paused') {
    this.status = 'processing';
    this.addLog('작업이 재개되었습니다', 'info');
    return this.save();
  }
  return this;
};

const BatchJob = mongoose.model('BatchJob', BatchJobSchema);

module.exports = BatchJob;