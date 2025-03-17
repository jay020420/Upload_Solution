// src/actions/productActions.js
import axios from 'axios';
import {
  PRODUCT_LIST_REQUEST,
  PRODUCT_LIST_SUCCESS,
  PRODUCT_LIST_FAIL,
  PRODUCT_DETAILS_REQUEST,
  PRODUCT_DETAILS_SUCCESS,
  PRODUCT_DETAILS_FAIL,
  PRODUCT_CREATE_REQUEST,
  PRODUCT_CREATE_SUCCESS,
  PRODUCT_CREATE_FAIL,
  PRODUCT_UPDATE_REQUEST,
  PRODUCT_UPDATE_SUCCESS,
  PRODUCT_UPDATE_FAIL,
  PRODUCT_DELETE_REQUEST,
  PRODUCT_DELETE_SUCCESS,
  PRODUCT_DELETE_FAIL,
  PRODUCT_UPLOAD_IMAGE_REQUEST,
  PRODUCT_UPLOAD_IMAGE_SUCCESS,
  PRODUCT_UPLOAD_IMAGE_FAIL,
  PRODUCT_BULK_UPLOAD_REQUEST,
  PRODUCT_BULK_UPLOAD_SUCCESS,
  PRODUCT_BULK_UPLOAD_FAIL,
  PRODUCT_EXPORT_REQUEST,
  PRODUCT_EXPORT_SUCCESS,
  PRODUCT_EXPORT_FAIL,
  PRODUCT_SYNC_MARKETPLACE_REQUEST,
  PRODUCT_SYNC_MARKETPLACE_SUCCESS,
  PRODUCT_SYNC_MARKETPLACE_FAIL
} from '../constants/productConstants';

import { BASE_URL } from '../constants/apiConstants';

// 상품 목록 조회 액션
export const getProducts = (params = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRODUCT_LIST_REQUEST });
    
    // 인증 헤더 설정
    const { 
      userLogin: { userInfo } 
    } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo?.token}`
      },
      params
    };
    
    // API 호출
    const { data } = await axios.get(`${BASE_URL}/api/products`, config);
    
    dispatch({
      type: PRODUCT_LIST_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: PRODUCT_LIST_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};

// 상품 상세 조회 액션
export const getProductDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRODUCT_DETAILS_REQUEST });
    
    // 인증 헤더 설정
    const { 
      userLogin: { userInfo } 
    } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo?.token}`
      }
    };
    
    // API 호출
    const { data } = await axios.get(`${BASE_URL}/api/products/${id}`, config);
    
    dispatch({
      type: PRODUCT_DETAILS_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: PRODUCT_DETAILS_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};

// 상품 생성 액션
export const createProduct = (productData) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRODUCT_CREATE_REQUEST });
    
    // 인증 헤더 설정
    const { 
      userLogin: { userInfo } 
    } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    // API 호출
    const { data } = await axios.post(
      `${BASE_URL}/api/products`, 
      productData, 
      config
    );
    
    dispatch({
      type: PRODUCT_CREATE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: PRODUCT_CREATE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 상품 수정 액션
export const updateProduct = (id, productData) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRODUCT_UPDATE_REQUEST });
    
    // 인증 헤더 설정
    const { 
      userLogin: { userInfo } 
    } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    // API 호출
    const { data } = await axios.put(
      `${BASE_URL}/api/products/${id}`, 
      productData, 
      config
    );
    
    dispatch({
      type: PRODUCT_UPDATE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: PRODUCT_UPDATE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 상품 삭제 액션
export const deleteProduct = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRODUCT_DELETE_REQUEST });
    
    // 인증 헤더 설정
    const { 
      userLogin: { userInfo } 
    } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    // API 호출
    await axios.delete(`${BASE_URL}/api/products/${id}`, config);
    
    dispatch({
      type: PRODUCT_DELETE_SUCCESS,
      payload: id
    });
  } catch (error) {
    dispatch({
      type: PRODUCT_DELETE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 상품 이미지 업로드 액션
export const uploadProductImage = (formData) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRODUCT_UPLOAD_IMAGE_REQUEST });
    
    // 인증 헤더 설정
    const { 
      userLogin: { userInfo } 
    } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    // API 호출
    const { data } = await axios.post(
      `${BASE_URL}/api/uploads/product-image`, 
      formData, 
      config
    );
    
    dispatch({
      type: PRODUCT_UPLOAD_IMAGE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: PRODUCT_UPLOAD_IMAGE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 대량 상품 업로드 액션
export const bulkUploadProducts = (formData) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRODUCT_BULK_UPLOAD_REQUEST });
    
    // 인증 헤더 설정
    const { 
      userLogin: { userInfo } 
    } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    // API 호출
    const { data } = await axios.post(
      `${BASE_URL}/api/products/bulk-upload`, 
      formData, 
      config
    );
    
    dispatch({
      type: PRODUCT_BULK_UPLOAD_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: PRODUCT_BULK_UPLOAD_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 상품 엑셀 내보내기 액션
export const exportProductsToExcel = (params) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRODUCT_EXPORT_REQUEST });
    
    // 인증 헤더 설정
    const { 
      userLogin: { userInfo } 
    } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      },
      responseType: 'blob' // 파일 다운로드를 위한 설정
    };
    
    // API 호출
    const response = await axios.post(
      `${BASE_URL}/api/products/export`, 
      params, 
      config
    );
    
    // 파일 다운로드 처리
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // 파일명 추출 시도
    let filename = 'products_export.xlsx';
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) { 
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    
    dispatch({
      type: PRODUCT_EXPORT_SUCCESS
    });
  } catch (error) {
    dispatch({
      type: PRODUCT_EXPORT_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};

// 상품을 마켓플레이스와 동기화 액션
export const syncProductToMarketplace = (productId, marketplaceId, syncData) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRODUCT_SYNC_MARKETPLACE_REQUEST });
    
    // 인증 헤더 설정
    const { 
      userLogin: { userInfo } 
    } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    // API 호출
    const { data } = await axios.post(
      `${BASE_URL}/api/products/${productId}/sync/${marketplaceId}`, 
      syncData, 
      config
    );
    
    dispatch({
      type: PRODUCT_SYNC_MARKETPLACE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: PRODUCT_SYNC_MARKETPLACE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};