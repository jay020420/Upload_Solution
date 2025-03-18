// src/components/common/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { 
    DashboardOutlined, ShoppingOutlined, AppstoreOutlined, 
    ShopOutlined, UserOutlined, SettingOutlined, 
    BarChartOutlined, FileOutlined, TeamOutlined,
    FieldTimeOutlined, DatabaseOutlined
  } from '@ant-design/icons';

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  
  // Redux state
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  
  // Update selected menu key based on current path
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const currentPath = pathSegments.length > 1 ? pathSegments[1] : '';
    
    if (currentPath === '') {
      setSelectedKeys(['dashboard']);
    } else if (currentPath === 'admin' && pathSegments.length > 2) {
      setSelectedKeys([pathSegments[2]]);
    } else {
      setSelectedKeys([currentPath]);
    }
  }, [location]);
  
  // Handle sidebar collapse
  const onCollapse = collapsed => {
    setCollapsed(collapsed);
  };
  
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'absolute',
        left: 0,
        zIndex: 999
      }}
    >
      <div className="logo" style={{ 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '16px',
        color: '#fff',
        fontSize: collapsed ? '18px' : '20px',
        fontWeight: 'bold',
        backgroundColor: '#001529'
      }}>
        {collapsed ? 'PMS' : '상품관리 시스템'}
      </div>
      
      <Menu theme="dark" mode="inline" selectedKeys={selectedKeys}>
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          <Link to="/dashboard">대시보드</Link>
        </Menu.Item>
        
        <SubMenu key="products" icon={<ShoppingOutlined />} title="상품 관리">
          <Menu.Item key="products">
            <Link to="/admin/products">상품 목록</Link>
          </Menu.Item>
          <Menu.Item key="product-create">
            <Link to="/admin/product/create">상품 등록</Link>
          </Menu.Item>
        </SubMenu>
        
        <Menu.Item key="categories" icon={<AppstoreOutlined />}>
          <Link to="/admin/categories">카테고리 관리</Link>
        </Menu.Item>
        
        <Menu.Item key="marketplaces" icon={<ShopOutlined />}>
          <Link to="/admin/marketplaces">마켓플레이스 관리</Link>
        </Menu.Item>
        
        <Menu.Item key="batchJobs" icon={<FieldTimeOutlined />}>
          <Link to="/admin/batch-jobs">배치 작업 관리</Link>
        </Menu.Item>
        
        {userInfo && userInfo.isAdmin && (
          <SubMenu key="admin" icon={<SettingOutlined />} title="관리자">
            <Menu.Item key="users" icon={<TeamOutlined />}>
              <Link to="/admin/users">사용자 관리</Link>
            </Menu.Item>
            <Menu.Item key="system" icon={<SettingOutlined />}>
              <Link to="/admin/system">시스템 설정</Link>
            </Menu.Item>
          </SubMenu>
        )}
        
        <SubMenu key="reports" icon={<BarChartOutlined />} title="보고서">
          <Menu.Item key="sync-logs">
            <Link to="/reports/sync-logs">동기화 로그</Link>
          </Menu.Item>
          <Menu.Item key="activity-logs">
            <Link to="/reports/activity-logs">활동 로그</Link>
          </Menu.Item>
        </SubMenu>
        
        <Menu.Item key="docs" icon={<FileOutlined />}>
          <Link to="/docs">문서</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;