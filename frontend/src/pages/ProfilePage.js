// src/pages/ProfilePage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Form, Input, Button, Card, Tabs, Avatar, Alert, 
  Row, Col, Typography, Space, Divider, message, Descriptions 
} from 'antd';
import { 
  UserOutlined, MailOutlined, LockOutlined, 
  SaveOutlined, EditOutlined
} from '@ant-design/icons';
import { getUserDetails, updateUserProfile } from '../actions/userActions';
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants';
import Loader from '../components/common/Loader';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const ProfilePage = ({ history }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  // Redux 상태
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  
  const userDetails = useSelector(state => state.userDetails);
  const { loading, error, user } = userDetails;
  
  const userUpdateProfile = useSelector(state => state.userUpdateProfile);
  const { 
    loading: loadingUpdate, 
    success: successUpdate, 
    error: errorUpdate 
  } = userUpdateProfile;
  
  // 페이지 로드 시 사용자 정보 조회
  useEffect(() => {
    if (!userInfo) {
      history.push('/login');
    } else {
      if (!user || !user.name || successUpdate) {
        // 프로필 업데이트 성공 후 또는 초기 로드 시 프로필 리셋 후 다시 로드
        dispatch({ type: USER_UPDATE_PROFILE_RESET });
        dispatch(getUserDetails('profile'));
      } else {
        form.setFieldsValue({
          name: user.name,
          email: user.email
        });
      }
    }
  }, [dispatch, history, userInfo, user, successUpdate, form]);
  
  // 성공 메시지 표시
  useEffect(() => {
    if (successUpdate) {
      message.success('프로필이 성공적으로 업데이트되었습니다');
    }
  }, [successUpdate]);
  
  // 기본 정보 업데이트 처리
  const updateProfile = (values) => {
    dispatch(updateUserProfile({
      id: user._id,
      name: values.name,
      email: values.email
    }));
  };
  
  // 비밀번호 변경 처리
  const updatePassword = (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('새 비밀번호가 일치하지 않습니다');
      return;
    }
    
    dispatch(updateUserProfile({
      id: user._id,
      password: values.newPassword
    }));
    
    // 폼 초기화
    passwordForm.resetFields();
  };
  
  return (
    <div className="profile-page">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Avatar size={100} icon={<UserOutlined />} />
              <Title level={3} style={{ marginTop: '16px', marginBottom: '0' }}>
                {user?.name}
              </Title>
              <Text type="secondary">{user?.email}</Text>
              
              <Divider />
              
              <Descriptions column={1} size="small">
                <Descriptions.Item label="계정 유형">
                  {user?.isAdmin ? '관리자' : '일반 사용자'}
                </Descriptions.Item>
                <Descriptions.Item label="가입일">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="마지막 로그인">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={16}>
          <Card>
            <Tabs defaultActiveKey="1">
              <TabPane 
                tab={
                  <span>
                    <UserOutlined />
                    기본 정보
                  </span>
                } 
                key="1"
              >
                {loading ? (
                  <Loader />
                ) : error ? (
                  <Alert
                    message="프로필 정보 조회 오류"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                ) : (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={updateProfile}
                  >
                    {errorUpdate && (
                      <Alert
                        message="프로필 업데이트 오류"
                        description={errorUpdate}
                        type="error"
                        showIcon
                        style={{ marginBottom: '16px' }}
                      />
                    )}
                    
                    <Form.Item
                      name="name"
                      label="이름"
                      rules={[{ required: true, message: '이름을 입력해주세요' }]}
                    >
                      <Input 
                        prefix={<UserOutlined />} 
                        placeholder="이름"
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
                      />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        icon={<SaveOutlined />}
                        loading={loadingUpdate}
                      >
                        정보 업데이트
                      </Button>
                    </Form.Item>
                  </Form>
                )}
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <LockOutlined />
                    비밀번호 변경
                  </span>
                } 
                key="2"
              >
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={updatePassword}
                >
                  {errorUpdate && (
                    <Alert
                      message="비밀번호 변경 오류"
                      description={errorUpdate}
                      type="error"
                      showIcon
                      style={{ marginBottom: '16px' }}
                    />
                  )}
                  
                  <Form.Item
                    name="currentPassword"
                    label="현재 비밀번호"
                    rules={[{ required: true, message: '현재 비밀번호를 입력해주세요' }]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="현재 비밀번호"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="newPassword"
                    label="새 비밀번호"
                    rules={[
                      { required: true, message: '새 비밀번호를 입력해주세요' },
                      { min: 6, message: '비밀번호는 6자 이상이어야 합니다' }
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="새 비밀번호"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="confirmPassword"
                    label="새 비밀번호 확인"
                    rules={[
                      { required: true, message: '새 비밀번호를 다시 입력해주세요' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('비밀번호가 일치하지 않습니다'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="새 비밀번호 확인"
                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />}
                      loading={loadingUpdate}
                    >
                      비밀번호 변경
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <EditOutlined />
                    설정
                  </span>
                } 
                key="3"
              >
                <div style={{ padding: '20px 0' }}>
                  <Title level={4}>알림 설정</Title>
                  <Text>현재 알림 설정 기능은 개발 중입니다. 곧 제공될 예정입니다.</Text>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;