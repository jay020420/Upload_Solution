// src/components/common/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Result, Button } from 'antd';

/**
 * 인증된 사용자만 접근할 수 있는 라우트 컴포넌트
 * @param {boolean} isAdmin - 관리자 권한이 필요한지 여부
 * @param {React.ReactNode} children - 자식 컴포넌트
 */
const PrivateRoute = ({ children, isAdmin }) => {
  const location = useLocation();
  
  // Redux state
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  
  // 로그인 체크
  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // 관리자 권한 체크
  if (isAdmin && !userInfo.isAdmin) {
    return (
      <Result
        status="403"
        title="접근 권한이 없습니다"
        subTitle="이 페이지를 볼 수 있는 권한이 없습니다"
        extra={
          <Button 
            type="primary" 
            onClick={() => <Navigate to="/dashboard" replace />}
          >
            대시보드로 이동
          </Button>
        }
      />
    );
  }
  
  // 인증 및 권한 통과
  return children;
};

export default PrivateRoute;