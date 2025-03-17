// src/store.js
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// 사용자 관련 리듀서
import {
  userLoginReducer,
  userRegisterReducer,
  userDetailsReducer,
  userUpdateProfileReducer,
  userListReducer,
  userDeleteReducer,
  userUpdateReducer
} from './reducers/userReducers';

// 상품 관련 리듀서
import {
  productListReducer,
  productDetailsReducer,
  productCreateReducer,
  productUpdateReducer,
  productDeleteReducer,
  productUploadImageReducer,
  productBulkUploadReducer,
  productExportReducer,
  productSyncMarketplaceReducer
} from './reducers/productReducers';

// 카테고리 관련 리듀서
import {
  categoryListReducer,
  categoryDetailsReducer,
  categoryCreateReducer,
  categoryUpdateReducer,
  categoryDeleteReducer
} from './reducers/categoryReducers';

// 마켓플레이스 관련 리듀서
import {
  marketplaceListReducer,
  marketplaceDetailsReducer,
  marketplaceCreateReducer,
  marketplaceUpdateReducer,
  marketplaceDeleteReducer,
  marketplaceAccountCreateReducer,
  marketplaceAccountUpdateReducer,
  marketplaceAccountDeleteReducer,
  marketplaceSyncLogsReducer
} from './reducers/marketplaceReducers';

// 배치 작업 관련 리듀서
import {
    batchJobListReducer,
    batchJobDetailsReducer,
    batchJobCreateReducer,
    batchJobStatusUpdateReducer,
    batchJobDeleteReducer,
    batchJobItemsReducer,
    batchJobLogsReducer
  } from './reducers/batchJobReducers';
  
  // 모든 리듀서 결합
  const reducer = combineReducers({
    // 사용자 리듀서
    userLogin: userLoginReducer,
    userRegister: userRegisterReducer,
    userDetails: userDetailsReducer,
    userUpdateProfile: userUpdateProfileReducer,
    userList: userListReducer,
    userDelete: userDeleteReducer,
    userUpdate: userUpdateReducer,
    
    // 상품 리듀서
    productList: productListReducer,
    productDetails: productDetailsReducer,
    productCreate: productCreateReducer,
    productUpdate: productUpdateReducer,
    productDelete: productDeleteReducer,
    productUploadImage: productUploadImageReducer,
    productBulkUpload: productBulkUploadReducer,
    productExport: productExportReducer,
    productSyncMarketplace: productSyncMarketplaceReducer,
    
    // 카테고리 리듀서
    categoryList: categoryListReducer,
    categoryDetails: categoryDetailsReducer,
    categoryCreate: categoryCreateReducer,
    categoryUpdate: categoryUpdateReducer,
    categoryDelete: categoryDeleteReducer,
    
    // 마켓플레이스 리듀서
    marketplaceList: marketplaceListReducer,
    marketplaceDetails: marketplaceDetailsReducer,
    marketplaceCreate: marketplaceCreateReducer,
    marketplaceUpdate: marketplaceUpdateReducer,
    marketplaceDelete: marketplaceDeleteReducer,
    marketplaceAccountCreate: marketplaceAccountCreateReducer,
    marketplaceAccountUpdate: marketplaceAccountUpdateReducer,
    marketplaceAccountDelete: marketplaceAccountDeleteReducer,
    marketplaceSyncLogs: marketplaceSyncLogsReducer,
    
    // 배치 작업 리듀서
    batchJobList: batchJobListReducer,
    batchJobDetails: batchJobDetailsReducer,
    batchJobCreate: batchJobCreateReducer,
    batchJobStatusUpdate: batchJobStatusUpdateReducer,
    batchJobDelete: batchJobDeleteReducer,
    batchJobItems: batchJobItemsReducer,
    batchJobLogs: batchJobLogsReducer
  });

// 로컬 스토리지에서 사용자 정보 가져오기
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

// 초기 상태 설정
const initialState = {
  userLogin: { userInfo: userInfoFromStorage }
};

// 미들웨어 설정
const middleware = [thunk];

// 스토어 생성
const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;