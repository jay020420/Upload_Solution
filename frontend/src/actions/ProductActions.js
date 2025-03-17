// src/actions/categoryActions.js
import axios from 'axios';
import {
  CATEGORY_LIST_REQUEST,
  CATEGORY_LIST_SUCCESS,
  CATEGORY_LIST_FAIL,
  CATEGORY_DETAILS_REQUEST,
  CATEGORY_DETAILS_SUCCESS,
  CATEGORY_DETAILS_FAIL,
  CATEGORY_CREATE_REQUEST,
  CATEGORY_CREATE_SUCCESS,
  CATEGORY_CREATE_FAIL,
  CATEGORY_UPDATE_REQUEST,
  CATEGORY_UPDATE_SUCCESS,
  CATEGORY_UPDATE_FAIL,
  CATEGORY_DELETE_REQUEST,
  CATEGORY_DELETE_SUCCESS,
  CATEGORY_DELETE_FAIL
} from '../constants/categoryConstants';

import { BASE_URL } from '../constants/apiConstants';

// 카테고리 목록 조회 액션
export const listCategories = () => async (dispatch, getState) => {
  try {
    dispatch({ type: CATEGORY_LIST_REQUEST });
    
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
    const { data } = await axios.get(`${BASE_URL}/api/categories`, config);
    
    dispatch({
      type: CATEGORY_LIST_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: CATEGORY_LIST_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};

// 카테고리 상세 조회 액션
export const getCategoryDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: CATEGORY_DETAILS_REQUEST });
    
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
    const { data } = await axios.get(`${BASE_URL}/api/categories/${id}`, config);
    
    dispatch({
      type: CATEGORY_DETAILS_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: CATEGORY_DETAILS_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};

// 카테고리 생성 액션
export const createCategory = (categoryData) => async (dispatch, getState) => {
  try {
    dispatch({ type: CATEGORY_CREATE_REQUEST });
    
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
      `${BASE_URL}/api/categories`, 
      categoryData, 
      config
    );
    
    dispatch({
      type: CATEGORY_CREATE_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: CATEGORY_CREATE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};

// 카테고리 수정 액션
export const updateCategory = (id, categoryData) => async (dispatch, getState) => {
  try {
    dispatch({ type: CATEGORY_UPDATE_REQUEST });
    
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
      `${BASE_URL}/api/categories/${id}`, 
      categoryData, 
      config
    );
    
    dispatch({
      type: CATEGORY_UPDATE_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: CATEGORY_UPDATE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};

// 카테고리 삭제 액션
export const deleteCategory = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: CATEGORY_DELETE_REQUEST });
    
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
    await axios.delete(`${BASE_URL}/api/categories/${id}`, config);
    
    dispatch({
      type: CATEGORY_DELETE_SUCCESS
    });
  } catch (error) {
    dispatch({
      type: CATEGORY_DELETE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};