// src/pages/UserEditPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Form, Input, Button, Card, Switch, Alert, 
  Divider, Space, message
} from 'antd';
import { PageHeader } from '@ant-design/pro-components';
import { SaveOutlined, UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { getUserDetails, updateUser } from '../actions/userActions';
import { USER_UPDATE_RESET } from '../constants/userConstants';
import Loader from '../components/common/Loader';

const UserEditPage = ({ match, history }) => {
  const userId = match.params.id;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [changePassword, setChangePassword] = useState(false);
  
  // Redux 상태
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  
  const userDetails = useSelector(state => state.userDetails);
  const { loading, error, user } = userDetails;
  
  const userUpdate = useSelector(state => state.userUpdate);
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = userUpdate;
  
  // 페이지 로드 시 사용자 정보 조회
  useEffect(() => {
    // 관리자 권한 체크
    if (!userInfo || !userInfo.isAdmin) {
      history.push('/login');
    } else if (successUpdate) {
      dispatch({ type: USER_UPDATE_RESET });
      message.success('사용자 정보가 업데이트되었습니다');
      history.push('/admin/users');
    } else {
      if (!user || user._id !== userId) {
        dispatch(getUserDetails(userId));
      } else {
        // 사용자 정보를 폼에 설정
        form.setFieldsValue({
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin
        });
      }
    }
  }, [dispatch, history, userId, user, userInfo, successUpdate, form]);
  
  // 폼 제출 처리
  const onFinish = (values) => {
    const userData = {
      name: values.name,
      email: values.email,
      isAdmin: values.isAdmin
    };
    
    // 비밀번호 변경이 활성화된 경우에만 비밀번호 포함
    if (changePassword && values.password) {
      userData.password = values.password;
    }
    
    dispatch(updateUser(userId, userData));
  };
  
  return (
    <div className="user-edit-page">
      <PageHeader
        onBack={() => history.push('/admin/users')}
        title="사용자 수정"
        subTitle={user?.name}
      />
      
      <Card>
        {loading || loadingUpdate ? (
          <Loader />
        ) : error ? (
          <Alert
            message="사용자 정보 조회 오류"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        ) : errorUpdate ? (
          <Alert
            message="사용자 정보 수정 오류"
            description={errorUpdate}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              isAdmin: false
            }}
          >
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
            
            <Form.Item
              name="isAdmin"
              label="관리자 권한"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Divider>비밀번호 변경</Divider>
            
            <Form.Item>
              <Space align="center">
                <Switch 
                  checked={changePassword} 
                  onChange={(checked) => setChangePassword(checked)} 
                />
                <span>비밀번호 변경하기</span>
              </Space>
            </Form.Item>
            
            {changePassword && (
              <Form.Item
                name="password"
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
            )}
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={loadingUpdate}
              >
                저장
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default UserEditPage;