// scripts/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs');

// 모델 임포트
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Marketplace = require('../models/marketplaceModel');

// 환경변수 설정
dotenv.config();

// 데이터베이스 연결
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('데이터베이스 연결 성공'.green.inverse))
  .catch(err => {
    console.error(`데이터베이스 연결 오류: ${err.message}`.red);
    process.exit(1);
  });

// 관리자 계정 생성
const adminUser = {
  name: '관리자',
  email: 'admin@example.com',
  password: 'admin1234',
  isAdmin: true,
  role: 'admin',
  permissions: ['all'],
  department: '시스템관리부',
  isActive: true
};

// 기본 카테고리 데이터
const categories = [
  {
    name: '패션',
    description: '의류, 신발, 가방 등의 패션 상품',
    isActive: true
  },
  {
    name: '전자제품',
    description: '컴퓨터, 모바일, 가전제품',
    isActive: true
  },
  {
    name: '가구/인테리어',
    description: '가구, 침구, 인테리어 소품',
    isActive: true
  },
  {
    name: '도서/음반',
    description: '책, 음반, DVD',
    isActive: true
  }
];

// 마켓플레이스 기본 데이터
const marketplaces = [
  {
    name: '네이버 스마트스토어',
    code: 'naver',
    description: '네이버 스마트스토어 마켓플레이스',
    isActive: true,
    apiBaseUrl: 'https://api.commerce.naver.com/external',
    apiVersion: 'v1',
    authType: 'oauth2',
    features: {
      productSync: true,
      orderSync: true,
      inventorySync: true,
      categorySync: true,
      autoFulfillment: false
    }
  },
  {
    name: '쿠팡',
    code: 'coupang',
    description: '쿠팡 마켓플레이스',
    isActive: true,
    apiBaseUrl: 'https://api-gateway.coupang.com',
    apiVersion: '1.0',
    authType: 'apikey',
    features: {
      productSync: true,
      orderSync: true,
      inventorySync: true,
      categorySync: true,
      autoFulfillment: false
    }
  },
  {
    name: '11번가',
    code: 'eleventh',
    description: '11번가 마켓플레이스',
    isActive: true,
    apiBaseUrl: 'https://api.11st.co.kr/rest',
    apiVersion: '1.0',
    authType: 'apikey',
    features: {
      productSync: true,
      orderSync: true,
      inventorySync: true,
      categorySync: true,
      autoFulfillment: false
    }
  }
];

// 데이터 추가 함수
const importData = async () => {
  try {
    // 기존 데이터 삭제
    await User.deleteMany();
    await Category.deleteMany();
    await Marketplace.deleteMany();
    
    console.log('기존 데이터 삭제 완료'.yellow);

    // 관리자 계정 생성
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    
    await User.create({
      ...adminUser,
      password: hashedPassword
    });
    
    console.log('관리자 계정 생성 완료'.green);
    
    // 카테고리 생성
    await Category.create(categories);
    console.log('기본 카테고리 생성 완료'.green);
    
    // 마켓플레이스 생성
    await Marketplace.create(marketplaces);
    console.log('기본 마켓플레이스 생성 완료'.green);
    
    console.log('데이터 시드 완료'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`오류: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// 데이터 삭제 함수
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Marketplace.deleteMany();
    
    console.log('데이터 삭제 완료'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`오류: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// 명령줄 인자 처리
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}