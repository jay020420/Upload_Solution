// src/components/common/Footer.js
import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <AntFooter style={{ 
      textAlign: 'center',
      background: '#f0f2f5',
      padding: '12px 50px'
    }}>
      <Text type="secondary">
        상품 업로드 솔루션 &copy; {currentYear} All Rights Reserved
      </Text>
    </AntFooter>
  );
};

export default Footer;