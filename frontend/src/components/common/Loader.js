// src/components/common/Loader.js
import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

/**
 * 로딩 인디케이터 컴포넌트
 * @param {string} tip - 로딩 텍스트
 * @param {string} size - 로딩 아이콘 크기 (small, default, large)
 * @param {boolean} fullScreen - 전체 화면 로딩 여부
 */
const Loader = ({ tip = '로딩 중...', size = 'large', fullScreen = false }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 
    size === 'small' ? 24 : 
    size === 'large' ? 40 : 32 
  }} spin />;
  
  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999
      }}>
        <Spin 
          indicator={antIcon}
          tip={tip}
          size={size}
        />
      </div>
    );
  }
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <Spin 
        indicator={antIcon}
        tip={tip}
        size={size}
      />
    </div>
  );
};

export default Loader;