// src/actions/marketplaceActions.js
import axios from 'axios';
import {
  MARKETPLACE_LIST_REQUEST,
  MARKETPLACE_LIST_SUCCESS,
  MARKETPLACE_LIST_FAIL,
  MARKETPLACE_DETAILS_REQUEST,
  MARKETPLACE_DETAILS_SUCCESS,
  MARKETPLACE_DETAILS_FAIL,
  MARKETPLACE_CREATE_REQUEST,
  MARKETPLACE_CREATE_SUCCESS,
  MARKETPLACE_CREATE_FAIL,
  MARKETPLACE_UPDATE_REQUEST,
  MARKETPLACE_UPDATE_SUCCESS,
  MARKETPLACE_UPDATE_FAIL,
  MARKETPLACE_DELETE_REQUEST,
  MARKETPLACE_DELETE_SUCCESS,
  MARKETPLACE_DELETE_FAIL,
  MARKETPLACE_ACCOUNT_CREATE_REQUEST,
  MARKETPLACE_ACCOUNT_CREATE_SUCCESS,
  MARKETPLACE_ACCOUNT_CREATE_FAIL,
  MARKETPLACE_ACCOUNT_UPDATE_REQUEST,
  MARKETPLACE_ACCOUNT_UPDATE_SUCCESS,
  MARKETPLACE_ACCOUNT_UPDATE_FAIL,
  MARKETPLACE_ACCOUNT_DELETE_REQUEST,
  MARKETPLACE_ACCOUNT_DELETE_SUCCESS,
  MARKETPLACE_ACCOUNT_DELETE_FAIL,
  MARKETPLACE_CATEGORY_MAPPING_UPDATE_REQUEST,
  MARKETPLACE_CATEGORY_MAPPING_UPDATE_SUCCESS,
  MARKETPLACE_CATEGORY_MAPPING_UPDATE_FAIL,
  MARKETPLACE_FIELD_MAPPING_UPDATE_REQUEST,
  MARKETPLACE_FIELD_MAPPING_UPDATE_SUCCESS,
  MARKETPLACE_FIELD_MAPPING_UPDATE_FAIL,
  MARKETPLACE_SYNC_LOGS_REQUEST,
  MARKETPLACE_SYNC_LOGS_SUCCESS,
  MARKETPLACE_SYNC_LOGS_FAIL
} from '../constants/marketplaceConstants';

import { BASE_URL } from '../constants/apiConstants';

// 마켓플레이스 목록 조회 액션
export const listMarketplaces = (params = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: MARKETPLACE_LIST_REQUEST });
    
    // 인증 헤더 설정
    const { 
      userLogin: { userInfo } 
    } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      },
      params
    };
    
    // API 호출
    const { data } = await axios.get(`${BASE_URL}/api/marketplaces`, config);
    
    dispatch({
      type: MARKETPLACE_LIST_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: MARKETPLACE_LIST_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};

// 마켓플레이스 상세 조회 액션
export const getMarketplaceDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: MARKETPLACE_DETAILS_REQUEST });
    
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
    const { data } = await axios.get(`${BASE_URL}/api/marketplaces/${id}`, config);
    
    dispatch({
      type: MARKETPLACE_DETAILS_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: MARKETPLACE_DETAILS_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};

// 마켓플레이스 생성 액션
export const createMarketplace = (marketplaceData) => async (dispatch, getState) => {
  try {
    dispatch({ type: MARKETPLACE_CREATE_REQUEST });
    
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
    
    // FormData인 경우 헤더 변경
    const isFormData = marketplaceData instanceof FormData;
    if (isFormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    // API 호출
    const { data } = await axios.post(
      `${BASE_URL}/api/marketplaces`,
      marketplaceData,
      config
    );
    
    dispatch({
      type: MARKETPLACE_CREATE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: MARKETPLACE_CREATE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 마켓플레이스 수정 액션
export const updateMarketplace = (id, marketplaceData) => async (dispatch, getState) => {
  try {
    dispatch({ type: MARKETPLACE_UPDATE_REQUEST });
    
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
    
    // FormData인 경우 헤더 변경
    const isFormData = marketplaceData instanceof FormData;
    if (isFormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    // API 호출
    const { data } = await axios.put(
      `${BASE_URL}/api/marketplaces/${id}`,
      marketplaceData,
      config
    );
    
    dispatch({
      type: MARKETPLACE_UPDATE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: MARKETPLACE_UPDATE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 마켓플레이스 삭제 액션
export const deleteMarketplace = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: MARKETPLACE_DELETE_REQUEST });
    
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
    await axios.delete(`${BASE_URL}/api/marketplaces/${id}`, config);
    
    dispatch({ type: MARKETPLACE_DELETE_SUCCESS });
  } catch (error) {
    dispatch({
      type: MARKETPLACE_DELETE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 마켓플레이스 계정 추가 액션
export const addMarketplaceAccount = (marketplaceId, accountData) => async (dispatch, getState) => {
  try {
    dispatch({ type: MARKETPLACE_ACCOUNT_CREATE_REQUEST });
    
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
      `${BASE_URL}/api/marketplaces/${marketplaceId}/accounts`,
      accountData,
      config
    );
    
    dispatch({
      type: MARKETPLACE_ACCOUNT_CREATE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: MARKETPLACE_ACCOUNT_CREATE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 마켓플레이스 계정 수정 액션
export const updateMarketplaceAccount = (marketplaceId, accountId, accountData) => async (dispatch, getState) => {
  try {
    dispatch({ type: MARKETPLACE_ACCOUNT_UPDATE_REQUEST });
    
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
      `${BASE_URL}/api/marketplaces/${marketplaceId}/accounts/${accountId}`,
      accountData,
      config
    );
    
    dispatch({
      type: MARKETPLACE_ACCOUNT_UPDATE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: MARKETPLACE_ACCOUNT_UPDATE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 마켓플레이스 계정 삭제 액션
export const deleteMarketplaceAccount = (marketplaceId, accountId) => async (dispatch, getState) => {
  try {
    dispatch({ type: MARKETPLACE_ACCOUNT_DELETE_REQUEST });
    
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
    await axios.delete(
      `${BASE_URL}/api/marketplaces/${marketplaceId}/accounts/${accountId}`,
      config
    );
    
    dispatch({ type: MARKETPLACE_ACCOUNT_DELETE_SUCCESS });
  } catch (error) {
    dispatch({
      type: MARKETPLACE_ACCOUNT_DELETE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 카테고리 매핑 업데이트 액션
export const updateCategoryMappings = (marketplaceId, mappings) => async (dispatch, getState) => {
  try {
    dispatch({ type: MARKETPLACE_CATEGORY_MAPPING_UPDATE_REQUEST });
    
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
      `${BASE_URL}/api/marketplaces/${marketplaceId}/category-mappings`,
      { mappings },
      config
    );
    
    dispatch({
      type: MARKETPLACE_CATEGORY_MAPPING_UPDATE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: MARKETPLACE_CATEGORY_MAPPING_UPDATE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 필드 매핑 업데이트 액션
export const updateFieldMappings = (marketplaceId, mappings) => async (dispatch, getState) => {
  try {
    dispatch({ type: MARKETPLACE_FIELD_MAPPING_UPDATE_REQUEST });
    
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
      `${BASE_URL}/api/marketplaces/${marketplaceId}/field-mappings`,
      { mappings },
      config
    );
    
    dispatch({
      type: MARKETPLACE_FIELD_MAPPING_UPDATE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: MARKETPLACE_FIELD_MAPPING_UPDATE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 마켓플레이스 동기화 로그 조회 액션
export const getSyncLogs = (marketplaceId, params = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: MARKETPLACE_SYNC_LOGS_REQUEST });
    
    // 인증 헤더 설정
    const { 
      userLogin: { userInfo } 
    } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      },
      params
    };
    
    // API 호출
    const { data } = await axios.get(
      `${BASE_URL}/api/marketplaces/${marketplaceId}/sync-logs`,
      config
    );
    
    dispatch({
      type: MARKETPLACE_SYNC_LOGS_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: MARKETPLACE_SYNC_LOGS_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};