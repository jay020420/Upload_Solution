// src/constants/apiConstants.js

// API 기본 URL (환경에 따라 다르게 설정)
export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// API 타임아웃 (밀리초)
export const API_TIMEOUT = 30000;

// 페이지당 기본 아이템 수
export const DEFAULT_PAGE_SIZE = 10;