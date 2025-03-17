// src/components/common/Header.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Badge, Space, Typography, Button } from 'antd';
import { 
  UserOutlined, LogoutOutlined, SettingOutlined, 
  MenuUnfoldOutlined, MenuFoldOutlined, BellOutlined 
} from '@ant-design/icons';
import { logout } from '../../actions/userActions';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

const Header = ({ collapsed, toggleSidebar }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  
  // Redux state
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    history.push('/login');
  };
  
  // User dropdown menu
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">프로필</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/profile/settings">설정</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        로그아웃
      </Menu.Item>
    </Menu>
  );
  
  // Notification menu (example)
  const notificationMenu = (
    <Menu>
      <Menu.Item key="notification1">
        <Text strong>마켓플레이스 연동 완료</Text>
        <div>네이버 스마트스토어 연동이 완료되었습니다.</div>
        <Text type="secondary" style={{ fontSize: '12px' }}>2분 전</Text>
      </Menu.Item>
      <Menu.Item key="notification2">
        <Text strong>대량 상품 업로드 완료</Text>
        <div>150개 상품이 성공적으로 등록되었습니다.</div>
        <Text type="secondary" style={{ fontSize: '12px' }}>15분 전</Text>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="all">
        <Link to="/notifications">모든 알림 보기</Link>
      </Menu.Item>
    </Menu>
  );
  
  return (
    <AntHeader style={{ 
      padding: '0 20px', 
      background: '#fff', 
      boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {toggleSidebar && (
          <Button 
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{ fontSize: '18px', marginRight: '15px' }}
          />
        )}
        <Title level={4} style={{ margin: 0 }}>
          상품 업로드 솔루션
        </Title>
      </div>
      
      {userInfo ? (
        <Space size="large">
          <Dropdown overlay={notificationMenu} trigger={['click']} placement="bottomRight">
            <Badge count={2} style={{ cursor: 'pointer' }}>
              <BellOutlined style={{ fontSize: '18px' }} />
            </Badge>
          </Dropdown>
          
          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
              <span>{userInfo.name}</span>
            </div>
          </Dropdown>
        </Space>
      ) : (
        <Space>
          <Button type="primary">
            <Link to="/login">로그인</Link>
          </Button>
        </Space>
      )}
    </AntHeader>
  );
};

export default Header;