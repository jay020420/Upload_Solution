// src/actions/batchJobActions.js
import axios from 'axios';
import {
  BATCH_JOB_LIST_REQUEST,
  BATCH_JOB_LIST_SUCCESS,
  BATCH_JOB_LIST_FAIL,
  BATCH_JOB_DETAILS_REQUEST,
  BATCH_JOB_DETAILS_SUCCESS,
  BATCH_JOB_DETAILS_FAIL,
  BATCH_JOB_CREATE_REQUEST,
  BATCH_JOB_CREATE_SUCCESS,
  BATCH_JOB_CREATE_FAIL,
  BATCH_JOB_STATUS_UPDATE_REQUEST,
  BATCH_JOB_STATUS_UPDATE_SUCCESS,
  BATCH_JOB_STATUS_UPDATE_FAIL,
  BATCH_JOB_DELETE_REQUEST,
  BATCH_JOB_DELETE_SUCCESS,
  BATCH_JOB_DELETE_FAIL,
  BATCH_JOB_ITEMS_REQUEST,
  BATCH_JOB_ITEMS_SUCCESS,
  BATCH_JOB_ITEMS_FAIL,
  BATCH_JOB_LOGS_REQUEST,
  BATCH_JOB_LOGS_SUCCESS,
  BATCH_JOB_LOGS_FAIL
} from '../constants/batchJobConstants';

import { BASE_URL } from '../constants/apiConstants';

// 배치 작업 목록 조회
export const listBatchJobs = (params = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: BATCH_JOB_LIST_REQUEST });
    
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
    const { data } = await axios.get(`${BASE_URL}/api/batch-jobs`, config);
    
    dispatch({
      type: BATCH_JOB_LIST_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: BATCH_JOB_LIST_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};

// 배치 작업 상세 조회
export const getBatchJobDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: BATCH_JOB_DETAILS_REQUEST });
    
    // 인증 헤더 설정
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    // API 호출
    const { data } = await axios.get(`${BASE_URL}/api/batch-jobs/${id}`, config);
    
    dispatch({
      type: BATCH_JOB_DETAILS_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: BATCH_JOB_DETAILS_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};

// 배치 작업 생성
export const createBatchJob = (jobData) => async (dispatch, getState) => {
  try {
    dispatch({ type: BATCH_JOB_CREATE_REQUEST });
    
    // 인증 헤더 설정
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    // API 호출
    const { data } = await axios.post(
      `${BASE_URL}/api/batch-jobs`, 
      jobData, 
      config
    );
    
    dispatch({
      type: BATCH_JOB_CREATE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: BATCH_JOB_CREATE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 배치 작업 상태 업데이트
export const updateBatchJobStatus = (id, status) => async (dispatch, getState) => {
  try {
    dispatch({ type: BATCH_JOB_STATUS_UPDATE_REQUEST });
    
    // 인증 헤더 설정
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    // API 호출
    const { data } = await axios.put(
      `${BASE_URL}/api/batch-jobs/${id}/status`, 
      { status }, 
      config
    );
    
    dispatch({
      type: BATCH_JOB_STATUS_UPDATE_SUCCESS,
      payload: data
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: BATCH_JOB_STATUS_UPDATE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// 배치 작업 삭제
export const deleteBatchJob = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: BATCH_JOB_DELETE_REQUEST });
    
    // 인증 헤더 설정
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    // API 호출
    await axios.delete(`${BASE_URL}/api/batch-jobs/${id}`, config);
    
    dispatch({
      type: BATCH_JOB_DELETE_SUCCESS
    });
  } catch (error) {
    dispatch({
      type: BATCH_JOB_DELETE_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};

// 배치 작업 항목 조회
export const getBatchJobItems = (jobId, params = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: BATCH_JOB_ITEMS_REQUEST });
    
    // 인증 헤더 설정
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      },
      params
    };
    
    // API 호출
    const { data } = await axios.get(
      `${BASE_URL}/api/batch-jobs/${jobId}/items`, 
      config
    );
    
    dispatch({
      type: BATCH_JOB_ITEMS_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: BATCH_JOB_ITEMS_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};

// 배치 작업 로그 조회
export const getBatchJobLogs = (jobId) => async (dispatch, getState) => {
  try {
    dispatch({ type: BATCH_JOB_LOGS_REQUEST });
    
    // 인증 헤더 설정
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    // API 호출
    const { data } = await axios.get(
      `${BASE_URL}/api/batch-jobs/${jobId}/logs`, 
      config
    );
    
    dispatch({
      type: BATCH_JOB_LOGS_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: BATCH_JOB_LOGS_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
  }
};