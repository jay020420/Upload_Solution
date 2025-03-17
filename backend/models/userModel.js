// models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 사용자 스키마
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '이름은 필수 항목입니다'],
    trim: true
  },
  email: {
    type: String,
    required: [true, '이메일은 필수 항목입니다'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      '유효한 이메일 주소를 입력해주세요'
    ]
  },
  password: {
    type: String,
    required: [true, '비밀번호는 필수 항목입니다'],
    minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'user'],
    default: 'user'
  },
  permissions: {
    type: [String],
    default: []
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  department: String,
  position: String,
  phone: String,
  profileImage: String,
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// 저장 전 비밀번호 암호화
UserSchema.pre('save', async function(next) {
  // 비밀번호가 변경된 경우에만 해시 처리
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 비밀번호 검증 메소드
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWT 토큰 발급 메소드
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role, isAdmin: this.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// 비밀번호 초기화 토큰 생성 메소드
UserSchema.methods.getResetPasswordToken = function() {
  // 랜덤 토큰 생성
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // 토큰 해시 후 저장
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // 만료 시간 설정 (1시간)
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  
  return resetToken;
};

// 관리자 권한 체크 가상 필드 생성
UserSchema.virtual('isAdminOrManager').get(function() {
  return this.isAdmin || this.role === 'manager';
});

const User = mongoose.model('User', UserSchema);

module.exports = User;