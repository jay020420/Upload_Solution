// src/reducers/productReducers.js
import {
    PRODUCT_LIST_REQUEST,
    PRODUCT_LIST_SUCCESS,
    PRODUCT_LIST_FAIL,
    PRODUCT_LIST_RESET,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    PRODUCT_DETAILS_RESET,
    PRODUCT_CREATE_REQUEST,
    PRODUCT_CREATE_SUCCESS,
    PRODUCT_CREATE_FAIL,
    PRODUCT_CREATE_RESET,
    PRODUCT_UPDATE_REQUEST,
    PRODUCT_UPDATE_SUCCESS,
    PRODUCT_UPDATE_FAIL,
    PRODUCT_UPDATE_RESET,
    PRODUCT_DELETE_REQUEST,
    PRODUCT_DELETE_SUCCESS,
    PRODUCT_DELETE_FAIL,
    PRODUCT_DELETE_RESET,
    PRODUCT_UPLOAD_IMAGE_REQUEST,
    PRODUCT_UPLOAD_IMAGE_SUCCESS,
    PRODUCT_UPLOAD_IMAGE_FAIL,
    PRODUCT_UPLOAD_IMAGE_RESET,
    PRODUCT_BULK_UPLOAD_REQUEST,
    PRODUCT_BULK_UPLOAD_SUCCESS,
    PRODUCT_BULK_UPLOAD_FAIL,
    PRODUCT_BULK_UPLOAD_RESET,
    PRODUCT_EXPORT_REQUEST,
    PRODUCT_EXPORT_SUCCESS,
    PRODUCT_EXPORT_FAIL,
    PRODUCT_EXPORT_RESET,
    PRODUCT_SYNC_MARKETPLACE_REQUEST,
    PRODUCT_SYNC_MARKETPLACE_SUCCESS,
    PRODUCT_SYNC_MARKETPLACE_FAIL,
    PRODUCT_SYNC_MARKETPLACE_RESET
  } from '../constants/productConstants';
  
  // 상품 목록 리듀서
  export const productListReducer = (state = { products: [] }, action) => {
    switch (action.type) {
      case PRODUCT_LIST_REQUEST:
        return { loading: true, products: [] };
      case PRODUCT_LIST_SUCCESS:
        return {
          loading: false,
          products: action.payload.products,
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total
        };
      case PRODUCT_LIST_FAIL:
        return { loading: false, error: action.payload };
      case PRODUCT_LIST_RESET:
        return { products: [] };
      default:
        return state;
    }
  };
  
  // 상품 상세 리듀서
  export const productDetailsReducer = (state = { product: {} }, action) => {
    switch (action.type) {
      case PRODUCT_DETAILS_REQUEST:
        return { ...state, loading: true };
      case PRODUCT_DETAILS_SUCCESS:
        return { loading: false, product: action.payload };
      case PRODUCT_DETAILS_FAIL:
        return { loading: false, error: action.payload };
      case PRODUCT_DETAILS_RESET:
        return { product: {} };
      default:
        return state;
    }
  };
  
  // 상품 생성 리듀서
  export const productCreateReducer = (state = {}, action) => {
    switch (action.type) {
      case PRODUCT_CREATE_REQUEST:
        return { loading: true };
      case PRODUCT_CREATE_SUCCESS:
        return { loading: false, success: true, product: action.payload };
      case PRODUCT_CREATE_FAIL:
        return { loading: false, error: action.payload };
      case PRODUCT_CREATE_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 상품 수정 리듀서
  export const productUpdateReducer = (state = {}, action) => {
    switch (action.type) {
      case PRODUCT_UPDATE_REQUEST:
        return { loading: true };
      case PRODUCT_UPDATE_SUCCESS:
        return { loading: false, success: true, product: action.payload };
      case PRODUCT_UPDATE_FAIL:
        return { loading: false, error: action.payload };
      case PRODUCT_UPDATE_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 상품 삭제 리듀서
  export const productDeleteReducer = (state = {}, action) => {
    switch (action.type) {
      case PRODUCT_DELETE_REQUEST:
        return { loading: true };
      case PRODUCT_DELETE_SUCCESS:
        return { loading: false, success: true };
      case PRODUCT_DELETE_FAIL:
        return { loading: false, error: action.payload };
      case PRODUCT_DELETE_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 상품 이미지 업로드 리듀서
  export const productUploadImageReducer = (state = {}, action) => {
    switch (action.type) {
      case PRODUCT_UPLOAD_IMAGE_REQUEST:
        return { loading: true };
      case PRODUCT_UPLOAD_IMAGE_SUCCESS:
        return { loading: false, success: true, image: action.payload };
      case PRODUCT_UPLOAD_IMAGE_FAIL:
        return { loading: false, error: action.payload };
      case PRODUCT_UPLOAD_IMAGE_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 대량 상품 업로드 리듀서
  export const productBulkUploadReducer = (state = {}, action) => {
    switch (action.type) {
      case PRODUCT_BULK_UPLOAD_REQUEST:
        return { loading: true };
      case PRODUCT_BULK_UPLOAD_SUCCESS:
        return { 
          loading: false, 
          success: true, 
          result: action.payload 
        };
      case PRODUCT_BULK_UPLOAD_FAIL:
        return { loading: false, error: action.payload };
      case PRODUCT_BULK_UPLOAD_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 상품 엑셀 내보내기 리듀서
  export const productExportReducer = (state = {}, action) => {
    switch (action.type) {
      case PRODUCT_EXPORT_REQUEST:
        return { loading: true };
      case PRODUCT_EXPORT_SUCCESS:
        return { loading: false, success: true };
      case PRODUCT_EXPORT_FAIL:
        return { loading: false, error: action.payload };
      case PRODUCT_EXPORT_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 상품 마켓플레이스 동기화 리듀서
  export const productSyncMarketplaceReducer = (state = {}, action) => {
    switch (action.type) {
      case PRODUCT_SYNC_MARKETPLACE_REQUEST:
        return { loading: true };
      case PRODUCT_SYNC_MARKETPLACE_SUCCESS:
        return { 
          loading: false, 
          success: true, 
          result: action.payload 
        };
      case PRODUCT_SYNC_MARKETPLACE_FAIL:
        return { loading: false, error: action.payload };
      case PRODUCT_SYNC_MARKETPLACE_RESET:
        return {};
      default:
        return state;
    }
  };