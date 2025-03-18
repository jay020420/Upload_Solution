// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // useNavigate와 useLocation 추가
import { Form, Input, Button, Card, Row, Col, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { login } from '../actions/userActions';
import Loader from '../components/common/Loader';

const { Title, Text } = Typography;

const LoginPage = () => { // props 제거
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // useNavigate 사용
  const location = useLocation(); // useLocation 사용
  
  // Redux 상태
  const userLogin = useSelector(state => state.userLogin);
  const { loading, error, userInfo } = userLogin;
  
  // 리디렉션 경로 확인
  const redirect = location.search ? location.search.split('=')[1] : '/dashboard';
  
  // 이미 로그인된 경우 리디렉션
  useEffect(() => {
    if (userInfo) {
      navigate(redirect); // history.push 대신 navigate 사용
    }
  }, [navigate, userInfo, redirect]); // 의존성 배열 업데이트
  
  // 폼 제출 처리
  const onFinish = (values) => {
    dispatch(login(values.email, values.password));
  };
  
  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Col xs={22} sm={18} md={12} lg={8} xl={6}>
        <Card bordered={false} style={{ boxShadow: '0 1px 4px rgba(0,21,41,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Title level={2} style={{ margin: 0 }}>상품 업로드 솔루션</Title>
            <Text type="secondary">로그인하여 시작하세요</Text>
          </div>
          
          {error && (
            <Alert
              message="로그인 오류"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: '20px' }}
            />
          )}
          
          {loading ? (
            <Loader />
          ) : (
            <Form
              form={form}
              name="login"
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ remember: true }}
            >
              <Form.Item
                name="email"
                label="이메일"
                rules={[
                  { required: true, message: '이메일을 입력해주세요' },
                  { type: 'email', message: '유효한 이메일 주소를 입력해주세요' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="이메일" 
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                label="비밀번호"
                rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="비밀번호" 
                  size="large"
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  size="large"
                  loading={loading}
                >
                  로그인
                </Button>
              </Form.Item>
              
              <Divider plain>또는</Divider>
              
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">계정이 없으신가요?</Text>
                <br />
                <Link to={redirect ? `/register?redirect=${redirect}` : '/register'}>
                  <Button type="link">회원가입</Button>
                </Link>
              </div>
            </Form>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;