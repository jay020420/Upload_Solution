// src/pages/NotFoundPage.js
import React from 'react';
import { Result, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { HomeFilled, ArrowLeftOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

const NotFoundPage = ({ history }) => {
  return (
    <div className="not-found-page" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 64px - 50px)' // header and footer height
    }}>
      <Result
        status="404"
        title="404"
        subTitle="요청하신 페이지를 찾을 수 없습니다"
        extra={[
          <Button 
            type="primary" 
            key="dashboard" 
            icon={<HomeFilled />}
          >
            <Link to="/dashboard">대시보드로 이동</Link>
          </Button>,
          <Button 
            key="back" 
            icon={<ArrowLeftOutlined />}
            onClick={() => history.goBack()}
          >
            이전 페이지로 돌아가기
          </Button>
        ]}
      >
        <div className="desc">
          <Paragraph>
            <Text
              strong
              style={{
                fontSize: 16,
              }}
            >
              이 페이지가 표시되는 몇 가지 이유:
            </Text>
          </Paragraph>
          <Paragraph>
            <ul>
              <li>요청하신 URL이 변경되었거나 제거되었을 수 있습니다.</li>
              <li>입력하신 URL에 오타가 있을 수 있습니다.</li>
              <li>해당 페이지에 접근할 권한이 없을 수 있습니다.</li>
            </ul>
          </Paragraph>
          <Paragraph>
            문제가 계속되면 관리자에게 문의해주세요.
          </Paragraph>
        </div>
      </Result>
    </div>
  );
};

export default NotFoundPage;