// src/reducers/marketplaceReducers.js
import {
    MARKETPLACE_LIST_REQUEST,
    MARKETPLACE_LIST_SUCCESS,
    MARKETPLACE_LIST_FAIL,
    MARKETPLACE_LIST_RESET,
    MARKETPLACE_DETAILS_REQUEST,
    MARKETPLACE_DETAILS_SUCCESS,
    MARKETPLACE_DETAILS_FAIL,
    MARKETPLACE_DETAILS_RESET,
    MARKETPLACE_CREATE_REQUEST,
    MARKETPLACE_CREATE_SUCCESS,
    MARKETPLACE_CREATE_FAIL,
    MARKETPLACE_CREATE_RESET,
    MARKETPLACE_UPDATE_REQUEST,
    MARKETPLACE_UPDATE_SUCCESS,
    MARKETPLACE_UPDATE_FAIL,
    MARKETPLACE_UPDATE_RESET,
    MARKETPLACE_DELETE_REQUEST,
    MARKETPLACE_DELETE_SUCCESS,
    MARKETPLACE_DELETE_FAIL,
    MARKETPLACE_DELETE_RESET,
    MARKETPLACE_ACCOUNT_CREATE_REQUEST,
    MARKETPLACE_ACCOUNT_CREATE_SUCCESS,
    MARKETPLACE_ACCOUNT_CREATE_FAIL,
    MARKETPLACE_ACCOUNT_CREATE_RESET,
    MARKETPLACE_ACCOUNT_UPDATE_REQUEST,
    MARKETPLACE_ACCOUNT_UPDATE_SUCCESS,
    MARKETPLACE_ACCOUNT_UPDATE_FAIL,
    MARKETPLACE_ACCOUNT_UPDATE_RESET,
    MARKETPLACE_ACCOUNT_DELETE_REQUEST,
    MARKETPLACE_ACCOUNT_DELETE_SUCCESS,
    MARKETPLACE_ACCOUNT_DELETE_FAIL,
    MARKETPLACE_ACCOUNT_DELETE_RESET,
    MARKETPLACE_SYNC_LOGS_REQUEST,
    MARKETPLACE_SYNC_LOGS_SUCCESS,
    MARKETPLACE_SYNC_LOGS_FAIL,
    MARKETPLACE_SYNC_LOGS_RESET
  } from '../constants/marketplaceConstants';
  
  // 마켓플레이스 목록 리듀서
  export const marketplaceListReducer = (state = { marketplaces: [] }, action) => {
    switch (action.type) {
      case MARKETPLACE_LIST_REQUEST:
        return { loading: true, marketplaces: [] };
      case MARKETPLACE_LIST_SUCCESS:
        return { loading: false, marketplaces: action.payload };
      case MARKETPLACE_LIST_FAIL:
        return { loading: false, error: action.payload };
      case MARKETPLACE_LIST_RESET:
        return { marketplaces: [] };
      default:
        return state;
    }
  };
  
  // 마켓플레이스 상세 리듀서
  export const marketplaceDetailsReducer = (state = { marketplace: {} }, action) => {
    switch (action.type) {
      case MARKETPLACE_DETAILS_REQUEST:
        return { ...state, loading: true };
      case MARKETPLACE_DETAILS_SUCCESS:
        return { loading: false, marketplace: action.payload };
      case MARKETPLACE_DETAILS_FAIL:
        return { loading: false, error: action.payload };
      case MARKETPLACE_DETAILS_RESET:
        return { marketplace: {} };
      default:
        return state;
    }
  };
  
  // 마켓플레이스 생성 리듀서
  export const marketplaceCreateReducer = (state = {}, action) => {
    switch (action.type) {
      case MARKETPLACE_CREATE_REQUEST:
        return { loading: true };
      case MARKETPLACE_CREATE_SUCCESS:
        return { loading: false, success: true, marketplace: action.payload };
      case MARKETPLACE_CREATE_FAIL:
        return { loading: false, error: action.payload };
      case MARKETPLACE_CREATE_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 마켓플레이스 수정 리듀서
  export const marketplaceUpdateReducer = (state = {}, action) => {
    switch (action.type) {
      case MARKETPLACE_UPDATE_REQUEST:
        return { loading: true };
      case MARKETPLACE_UPDATE_SUCCESS:
        return { loading: false, success: true, marketplace: action.payload };
      case MARKETPLACE_UPDATE_FAIL:
        return { loading: false, error: action.payload };
      case MARKETPLACE_UPDATE_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 마켓플레이스 삭제 리듀서
  export const marketplaceDeleteReducer = (state = {}, action) => {
    switch (action.type) {
      case MARKETPLACE_DELETE_REQUEST:
        return { loading: true };
      case MARKETPLACE_DELETE_SUCCESS:
        return { loading: false, success: true };
      case MARKETPLACE_DELETE_FAIL:
        return { loading: false, error: action.payload };
      case MARKETPLACE_DELETE_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 마켓플레이스 계정 생성 리듀서
  export const marketplaceAccountCreateReducer = (state = {}, action) => {
    switch (action.type) {
      case MARKETPLACE_ACCOUNT_CREATE_REQUEST:
        return { loading: true };
      case MARKETPLACE_ACCOUNT_CREATE_SUCCESS:
        return { loading: false, success: true, accounts: action.payload };
      case MARKETPLACE_ACCOUNT_CREATE_FAIL:
        return { loading: false, error: action.payload };
      case MARKETPLACE_ACCOUNT_CREATE_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 마켓플레이스 계정 수정 리듀서
  export const marketplaceAccountUpdateReducer = (state = {}, action) => {
    switch (action.type) {
      case MARKETPLACE_ACCOUNT_UPDATE_REQUEST:
        return { loading: true };
      case MARKETPLACE_ACCOUNT_UPDATE_SUCCESS:
        return { loading: false, success: true, account: action.payload };
      case MARKETPLACE_ACCOUNT_UPDATE_FAIL:
        return { loading: false, error: action.payload };
      case MARKETPLACE_ACCOUNT_UPDATE_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 마켓플레이스 계정 삭제 리듀서
  export const marketplaceAccountDeleteReducer = (state = {}, action) => {
    switch (action.type) {
      case MARKETPLACE_ACCOUNT_DELETE_REQUEST:
        return { loading: true };
      case MARKETPLACE_ACCOUNT_DELETE_SUCCESS:
        return { loading: false, success: true };
      case MARKETPLACE_ACCOUNT_DELETE_FAIL:
        return { loading: false, error: action.payload };
      case MARKETPLACE_ACCOUNT_DELETE_RESET:
        return {};
      default:
        return state;
    }
  };
  
  // 마켓플레이스 동기화 로그 리듀서
  export const marketplaceSyncLogsReducer = (state = { logs: [] }, action) => {
    switch (action.type) {
      case MARKETPLACE_SYNC_LOGS_REQUEST:
        return { loading: true, logs: [] };
      case MARKETPLACE_SYNC_LOGS_SUCCESS:
        return { 
          loading: false, 
          logs: action.payload.logs,
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total
        };
      case MARKETPLACE_SYNC_LOGS_FAIL:
        return { loading: false, error: action.payload };
      case MARKETPLACE_SYNC_LOGS_RESET:
        return { logs: [] };
      default:
        return state;
    }
  };