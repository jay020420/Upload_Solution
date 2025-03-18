// middleware/validationSchemas.js
const { body, query, param } = require('express-validator');

// 사용자 관련 유효성 검증 스키마
const userValidation = {
  register: [
    body('name')
      .notEmpty().withMessage('이름은 필수 항목입니다')
      .isLength({ min: 2, max: 50 }).withMessage('이름은 2-50자 사이여야 합니다'),
    body('email')
      .notEmpty().withMessage('이메일은 필수 항목입니다')
      .isEmail().withMessage('유효한 이메일 주소를 입력해주세요'),
    body('password')
      .notEmpty().withMessage('비밀번호는 필수 항목입니다')
      .isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다')
  ],
  login: [
    body('email')
      .notEmpty().withMessage('이메일은 필수 항목입니다')
      .isEmail().withMessage('유효한 이메일 주소를 입력해주세요'),
    body('password')
      .notEmpty().withMessage('비밀번호는 필수 항목입니다')
  ],
  updateProfile: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 50 }).withMessage('이름은 2-50자 사이여야 합니다'),
    body('email')
      .optional()
      .isEmail().withMessage('유효한 이메일 주소를 입력해주세요'),
    body('password')
      .optional()
      .isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다')
  ]
};

// 상품 관련 유효성 검증 스키마
const productValidation = {
  create: [
    body('name')
      .notEmpty().withMessage('상품명은 필수 항목입니다'),
    body('description')
      .notEmpty().withMessage('상품 설명은 필수 항목입니다'),
    body('regularPrice')
      .notEmpty().withMessage('정상가는 필수 항목입니다')
      .isNumeric().withMessage('정상가는 유효한 숫자여야 합니다')
      .custom(value => value >= 0).withMessage('정상가는 0 이상이어야 합니다'),
    body('categories')
      .isArray().withMessage('카테고리는 배열이어야 합니다')
      .notEmpty().withMessage('최소 하나 이상의 카테고리를 선택해야 합니다')
  ],
  update: [
    body('name')
      .optional()
      .notEmpty().withMessage('상품명은 필수 항목입니다'),
    body('description')
      .optional()
      .notEmpty().withMessage('상품 설명은 필수 항목입니다'),
    body('regularPrice')
      .optional()
      .isNumeric().withMessage('정상가는 유효한 숫자여야 합니다')
      .custom(value => value >= 0).withMessage('정상가는 0 이상이어야 합니다'),
    body('salePrice')
      .optional()
      .isNumeric().withMessage('판매가는 유효한 숫자여야 합니다')
      .custom(value => value >= 0).withMessage('판매가는 0 이상이어야 합니다'),
    body('status')
      .optional()
      .isIn(['draft', 'active', 'inactive', 'out_of_stock']).withMessage('유효하지 않은 상태 값입니다')
  ],
  getProducts: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('페이지 번호는 1 이상이어야 합니다'),
    query('pageSize')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('페이지 크기는 1-100 사이여야 합니다'),
    query('sortField')
      .optional()
      .isString().withMessage('정렬 필드는 문자열이어야 합니다'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc']).withMessage('정렬 순서는 asc 또는 desc여야 합니다')
  ]
};

// 마켓플레이스 관련 유효성 검증 스키마
const marketplaceValidation = {
  create: [
    body('name')
      .notEmpty().withMessage('마켓플레이스 이름은 필수 항목입니다'),
    body('code')
      .notEmpty().withMessage('마켓플레이스 코드는 필수 항목입니다')
      .isAlphanumeric().withMessage('마켓플레이스 코드는 영숫자만 포함할 수 있습니다')
  ],
  addAccount: [
    body('name')
      .notEmpty().withMessage('계정 이름은 필수 항목입니다')
  ],
  updateCategoryMappings: [
    body('mappings')
      .isArray().withMessage('매핑 데이터는 배열이어야 합니다')
      .notEmpty().withMessage('최소 하나 이상의 매핑이 필요합니다'),
    body('mappings.*.systemCategoryId')
      .notEmpty().withMessage('시스템 카테고리 ID는 필수 항목입니다'),
    body('mappings.*.marketCategoryId')
      .notEmpty().withMessage('마켓 카테고리 ID는 필수 항목입니다'),
    body('mappings.*.marketCategoryName')
      .notEmpty().withMessage('마켓 카테고리 이름은 필수 항목입니다')
  ]
};

// 배치 작업 관련 유효성 검증 스키마
const batchJobValidation = {
  create: [
    body('name')
      .notEmpty().withMessage('작업 이름은 필수 항목입니다'),
    body('type')
      .notEmpty().withMessage('작업 타입은 필수 항목입니다')
      .isIn([
        'product_price_update',
        'product_stock_update',
        'product_status_update',
        'product_marketplace_sync',
        'product_category_update',
        'product_delete',
        'custom'
      ]).withMessage('유효하지 않은 작업 타입입니다')
  ],
  updateStatus: [
    body('status')
      .notEmpty().withMessage('상태 값은 필수 항목입니다')
      .isIn(['processing', 'paused', 'cancelled']).withMessage('유효하지 않은 상태 값입니다')
  ]
};

module.exports = {
  userValidation,
  productValidation,
  marketplaceValidation,
  batchJobValidation
};