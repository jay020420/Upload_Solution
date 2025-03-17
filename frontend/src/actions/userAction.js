// src/actions/userActions.js
import axios from 'axios';
import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAIL,
  USER_DETAILS_RESET,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_PROFILE_FAIL,
  USER_LIST_REQUEST,
  USER_LIST_SUCCESS,
  USER_LIST_FAIL,
  USER_LIST_RESET,
  USER_DELETE_REQUEST,
  USER_DELETE_SUCCESS,
  USER_DELETE_FAIL,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAIL
} from '../constants/userConstants';

import { BASE_URL } from '../constants/apiConstants';

// 사용자 로그인 액션
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // API 호출
    const { data } = await axios.post(
      `${BASE_URL}/api/users/login`,
      { email, password },
      config
    );
    
    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data
    });
    
    // 로컬 스토리지에 사용자 정보 저장
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    });
  }
};

// 사용자 로그아웃 액션
export const logout = () => (dispatch) => {
  // 로컬 스토리지에서 사용자 정보 제거
  localStorage.removeItem('userInfo');
  
  // 사용자 관련 상태 초기화
  dispatch({ type: USER_LOGOUT });
  dispatch({ type: USER_DETAILS_RESET });
  dispatch({ type: USER_LIST_RESET });
};

// 사용자 등록 액션
export const register = (name, email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // API 호출
    const { data } = await axios.post(
      `${BASE_URL}/api/users`,
      { name, email, password },
      config
    );
    
    dispatch({
      type: USER_REGISTER_SUCCESS,
      payload: data
    });
    
    // 등록 후 자동 로그인
    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data
    });
    
    // 로컬 스토리지에 사용자 정보 저장
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    });
  }
};

// 사용자 상세 정보 조회 액션
export const getUserDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });
    
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
    
    // API 호출 (id가 'profile'인 경우 사용자 프로필, 아니면 특정 사용자 조회)
    const { data } = await axios.get(
      `${BASE_URL}/api/users/${id}`,
      config
    );
    
    dispatch({
      type: USER_DETAILS_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: USER_DETAILS_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    });
  }
};

// 사용자 프로필 업데이트 액션
export const updateUserProfile = (user) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_UPDATE_PROFILE_REQUEST });
    
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
      `${BASE_URL}/api/users/profile`,
      user,
      config
    );
    
    dispatch({
      type: USER_UPDATE_PROFILE_SUCCESS,
      payload: data
    });
    
    // 로그인 정보 업데이트
    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data
    });
    
    // 로컬 스토리지 업데이트
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: USER_UPDATE_PROFILE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    });
  }
};

// 사용자 목록 조회 액션 (관리자)
export const listUsers = (params = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_LIST_REQUEST });
    
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
      `${BASE_URL}/api/users`,
      config
    );
    
    dispatch({
      type: USER_LIST_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: USER_LIST_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    });
  }
};

// 사용자 삭제 액션 (관리자)
export const deleteUser = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DELETE_REQUEST });
    
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
      `${BASE_URL}/api/users/${id}`,
      config
    );
    
    dispatch({ type: USER_DELETE_SUCCESS });
  } catch (error) {
    dispatch({
      type: USER_DELETE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    });
  }
};

// 사용자 정보 업데이트 액션 (관리자)
export const updateUser = (id, userData) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_UPDATE_REQUEST });
    
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
      `${BASE_URL}/api/users/${id}`,
      userData,
      config
    );
    
    dispatch({
      type: USER_UPDATE_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: USER_UPDATE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    });
  }
};