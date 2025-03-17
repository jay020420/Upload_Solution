// src/reducers/batchJobReducers.js
import {
    BATCH_JOB_LIST_REQUEST,
    BATCH_JOB_LIST_SUCCESS,
    BATCH_JOB_LIST_FAIL,
    BATCH_JOB_LIST_RESET,
    BATCH_JOB_DETAILS_REQUEST,
    BATCH_JOB_DETAILS_SUCCESS,
    BATCH_JOB_DETAILS_FAIL,
    BATCH_JOB_DETAILS_RESET,
    BATCH_JOB_CREATE_REQUEST,
    BATCH_JOB_CREATE_SUCCESS,
    BATCH_JOB_CREATE_FAIL,
    BATCH_JOB_CREATE_RESET,
    BATCH_JOB_STATUS_UPDATE_REQUEST,
    BATCH_JOB_STATUS_UPDATE_SUCCESS,
    BATCH_JOB_STATUS_UPDATE_FAIL,
    BATCH_JOB_STATUS_UPDATE_RESET,
    BATCH_JOB_DELETE_REQUEST,
    BATCH_JOB_DELETE_SUCCESS,
    BATCH_JOB_DELETE_FAIL,
    BATCH_JOB_DELETE_RESET,
    BATCH_JOB_ITEMS_REQUEST,
    BATCH_JOB_ITEMS_SUCCESS,
    BATCH_JOB_ITEMS_FAIL,
    BATCH_JOB_ITEMS_RESET,
    BATCH_JOB_LOGS_REQUEST,
    BATCH_JOB_LOGS_SUCCESS,
    BATCH_JOB_LOGS_FAIL,
    BATCH_JOB_LOGS_RESET
  } from '../constants/batchJobConstants';
  
  // 배치 작업 목록 리듀서
  export const batchJobListReducer = (state = { jobs: [] }, action) => {
    switch (action.type) {
      case BATCH_JOB_LIST_REQUEST:
        return { loading: true, jobs: [] };
      case BATCH_JOB_LIST_SUCCESS:
        return {
          loading: false,
          jobs: action.payload.jobs,
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total
        };
      case BATCH_JOB_LIST_FAIL:
        return { loading: false, error: action.payload };
      case BATCH_JOB_LIST_RESET:
        return { jobs: [] };
      default:
        return state;
    }
  };
  
  // 배치 작업 상세 리듀서
  export const batchJobDetailsReducer = (state = { job: {} }, action) => {
    switch (action.type) {
      case BATCH_JOB_DETAILS_REQUEST:
        return { ...state, loading: true };
      case BATCH_JOB_DETAILS_SUCCESS:
        return { loading: false, job: action.payload };
      case BATCH_JOB_DETAILS_FAIL:
        return { loading: false, error: action.payload };
      case BATCH_JOB_DETAILS_RESET:
        return { job: {} };
      default:
        return state;
    }
  };
  
  // 배치 작업 생성 리듀서
  export const batchJobCreateReducer = (state = {}, action) => {
    switch (action.type) {
      case BATCH_JOB_CREATE_REQUEST:
        return { loading: true };
      case BATCH_JOB_CREATE_SUCCESS:
        return { loading: false, success: true, job: action.payload };
      case BATCH_JOB_CREATE_FAIL:
        return { loading: false, error: action.payload };
      case BATCH_JOB_CREATE_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 배치 작업 상태 업데이트 리듀서
  export const batchJobStatusUpdateReducer = (state = {}, action) => {
    switch (action.type) {
      case BATCH_JOB_STATUS_UPDATE_REQUEST:
        return { loading: true };
      case BATCH_JOB_STATUS_UPDATE_SUCCESS:
        return { loading: false, success: true, job: action.payload };
      case BATCH_JOB_STATUS_UPDATE_FAIL:
        return { loading: false, error: action.payload };
      case BATCH_JOB_STATUS_UPDATE_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 배치 작업 삭제 리듀서
  export const batchJobDeleteReducer = (state = {}, action) => {
    switch (action.type) {
      case BATCH_JOB_DELETE_REQUEST:
        return { loading: true };
      case BATCH_JOB_DELETE_SUCCESS:
        return { loading: false, success: true };
      case BATCH_JOB_DELETE_FAIL:
        return { loading: false, error: action.payload };
      case BATCH_JOB_DELETE_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 배치 작업 항목 리듀서
  export const batchJobItemsReducer = (state = { items: [] }, action) => {
    switch (action.type) {
      case BATCH_JOB_ITEMS_REQUEST:
        return { loading: true, items: [] };
      case BATCH_JOB_ITEMS_SUCCESS:
        return {
          loading: false,
          items: action.payload.items,
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total
        };
      case BATCH_JOB_ITEMS_FAIL:
        return { loading: false, error: action.payload };
      case BATCH_JOB_ITEMS_RESET:
        return { items: [] };
      default:
        return state;
    }
  };
  
  // 배치 작업 로그 리듀서
  export const batchJobLogsReducer = (state = { logs: [] }, action) => {
    switch (action.type) {
      case BATCH_JOB_LOGS_REQUEST:
        return { loading: true, logs: [] };
      case BATCH_JOB_LOGS_SUCCESS:
        return { loading: false, logs: action.payload };
      case BATCH_JOB_LOGS_FAIL:
        return { loading: false, error: action.payload };
      case BATCH_JOB_LOGS_RESET:
        return { logs: [] };
      default:
        return state;
    }
  };