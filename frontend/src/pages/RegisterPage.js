// src/pages/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // useNavigate와 useLocation 추가
import { Form, Input, Button, Card, Row, Col, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { register } from '../actions/userActions';
import Loader from '../components/common/Loader';

const { Title, Text } = Typography;

const RegisterPage = () => { // props 제거
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // useNavigate 사용
  const location = useLocation(); // useLocation 사용
  
  // Redux 상태
  const userRegister = useSelector(state => state.userRegister);
  const { loading, error, userInfo } = userRegister;
  
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
    // 비밀번호 확인
    if (values.password !== values.confirmPassword) {
      form.setFields([
        {
          name: 'confirmPassword',
          errors: ['비밀번호가 일치하지 않습니다']
        }
      ]);
      return;
    }
    
    dispatch(register(values.name, values.email, values.password));
  };
  
  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Col xs={22} sm={18} md={12} lg={8} xl={6}>
        <Card bordered={false} style={{ boxShadow: '0 1px 4px rgba(0,21,41,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Title level={2} style={{ margin: 0 }}>계정 등록</Title>
            <Text type="secondary">상품 업로드 솔루션 계정을 생성하세요</Text>
          </div>
          
          {error && (
            <Alert
              message="계정 등록 오류"
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
              name="register"
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ remember: true }}
            >
              <Form.Item
                name="name"
                label="이름"
                rules={[
                  { required: true, message: '이름을 입력해주세요' },
                  { min: 2, message: '이름은 2자 이상이어야 합니다' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="이름" 
                  size="large"
                />
              </Form.Item>
              
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
                rules={[
                  { required: true, message: '비밀번호를 입력해주세요' },
                  { min: 6, message: '비밀번호는 6자 이상이어야 합니다' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="비밀번호" 
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="비밀번호 확인"
                rules={[
                  { required: true, message: '비밀번호를 다시 입력해주세요' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="비밀번호 확인" 
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
                  계정 등록
                </Button>
              </Form.Item>
              
              <Divider plain>또는</Divider>
              
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">이미 계정이 있으신가요?</Text>
                <br />
                <Link to={redirect ? `/login?redirect=${redirect}` : '/login'}>
                  <Button type="link">로그인</Button>
                </Link>
              </div>
            </Form>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default RegisterPage;