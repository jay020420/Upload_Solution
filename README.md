업로드 솔루션

```
product-upload-solution/
├── backend/                    # 백엔드 (Node.js/Express)
│   ├── config/                 # 설정 파일
│   │   ├── db.js               # 데이터베이스 연결 설정
│   │   └── s3.js               # AWS S3 설정
│   ├── controllers/            # 컨트롤러
│   │   ├── productController.js  # 상품 컨트롤러
│   │   ├── userController.js   # 사용자 컨트롤러
│   │   └── marketplaceController.js  # 마켓플레이스 컨트롤러
│   ├── middleware/             # 미들웨어
│   │   ├── authMiddleware.js   # 인증 미들웨어
│   │   └── errorMiddleware.js  # 에러 처리 미들웨어
│   ├── models/                 # 데이터 모델 (Mongoose)
│   │   ├── productModel.js     # 상품 모델
│   │   ├── userModel.js        # 사용자 모델
│   │   └── marketplaceModel.js # 마켓플레이스 모델
│   ├── routes/                 # API 라우트
│   │   ├── productRoutes.js    # 상품 관련 라우트
│   │   ├── userRoutes.js       # 사용자 관련 라우트
│   │   └── marketplaceRoutes.js # 마켓플레이스 관련 라우트
│   ├── marketplaces/           # 마켓플레이스 연동 모듈
│   │   ├── naverModule.js      # 네이버 스마트스토어 연동
│   │   ├── coupangModule.js    # 쿠팡 연동
│   │   └── eleventhModule.js   # 11번가 연동
│   ├── utils/                  # 유틸리티 함수
│   │   ├── excelUtils.js       # 엑셀 처리 유틸리티
│   │   ├── s3Utils.js          # S3 이미지 처리 유틸리티
│   │   └── validationUtils.js  # 데이터 유효성 검사 유틸리티
│   ├── uploads/                # 임시 업로드 디렉토리
│   ├── server.js               # 메인 서버 파일
│   └── package.json            # 백엔드 의존성
│
├── frontend/                   # 프론트엔드 (React)
│   ├── public/                 # 정적 파일
│   ├── src/                    # 소스 코드
│   │   ├── actions/            # Redux 액션
│   │   ├── components/         # React 컴포넌트
│   │   │   ├── products/       # 상품 관련 컴포넌트
│   │   │   ├── marketplaces/   # 마켓플레이스 관련 컴포넌트
│   │   │   └── common/         # 공통 컴포넌트
│   │   ├── constants/          # 상수 정의
│   │   ├── pages/              # 페이지 컴포넌트
│   │   ├── reducers/           # Redux 리듀서
│   │   ├── store.js            # Redux 스토어
│   │   ├── App.js              # 메인 앱 컴포넌트
│   │   └── index.js            # 엔트리 포인트
│   └── package.json            # 프론트엔드 의존성
│
├── .env                        # 환경 변수
├── .gitignore                  # Git 제외 파일
└── README.md                   # 프로젝트 문서```
