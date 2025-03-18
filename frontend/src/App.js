// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

// Components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import PrivateRoute from './components/common/PrivateRoute';
import Loader from './components/common/Loader';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductListPage from './pages/ProductListPage';
import ProductEditPage from './pages/ProductEditPage';
import ProductCreatePage from './pages/ProductCreatePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryListPage from './pages/CategoryListPage';
import CategoryEditPage from './pages/CategoryEditPage';
import MarketplaceListPage from './pages/MarketplaceListPage';
import MarketplaceEditPage from './pages/MarketplaceEditPage';
import UserListPage from './pages/UserListPage';
import UserEditPage from './pages/UserEditPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import BatchJobListPage from './pages/BatchJobListPage';
import BatchJobDetailPage from './pages/BatchJobDetailPage';

// Actions
import { getUserDetails } from './actions/userActions';

// CSS
import './App.css';

const { Content } = Layout;

const App = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  
  // Load user details if logged in
  useEffect(() => {
    if (userInfo) {
      dispatch(getUserDetails('profile'));
    }
  }, [dispatch, userInfo]);
  
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        {userInfo && <Sidebar />}
        
        <Layout style={{ marginLeft: userInfo ? 200 : 0, transition: 'margin-left 0.2s' }}>
          <Header />
          
          <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
            <Routes>
              {/* 공개 라우트 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* 대시보드 */}
              <Route path="/" element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } />
              
              {/* 상품 관리 */}
              <Route path="/admin/products" element={
                <PrivateRoute>
                  <ProductListPage />
                </PrivateRoute>
              } />
              <Route path="/admin/product/create" element={
                <PrivateRoute>
                  <ProductCreatePage />
                </PrivateRoute>
              } />
              <Route path="/admin/product/:id" element={
                <PrivateRoute>
                  <ProductDetailPage />
                </PrivateRoute>
              } />
              <Route path="/admin/product/:id/edit" element={
                <PrivateRoute>
                  <ProductEditPage />
                </PrivateRoute>
              } />
              
              {/* 카테고리 관리 */}
              <Route path="/admin/categories" element={
                <PrivateRoute>
                  <CategoryListPage />
                </PrivateRoute>
              } />
              <Route path="/admin/category/create" element={
                <PrivateRoute>
                  <CategoryEditPage />
                </PrivateRoute>
              } />
              <Route path="/admin/category/:id/edit" element={
                <PrivateRoute>
                  <CategoryEditPage />
                </PrivateRoute>
              } />
              
              {/* 마켓플레이스 관리 */}
              <Route path="/admin/marketplaces" element={
                <PrivateRoute>
                  <MarketplaceListPage />
                </PrivateRoute>
              } />
              <Route path="/admin/marketplace/create" element={
                <PrivateRoute>
                  <MarketplaceEditPage />
                </PrivateRoute>
              } />
              <Route path="/admin/marketplace/:id/edit" element={
                <PrivateRoute>
                  <MarketplaceEditPage />
                </PrivateRoute>
              } />
              
              {/* 배치 작업 관리 */}
              <Route path="/admin/batch-jobs" element={
                <PrivateRoute>
                  <BatchJobListPage />
                </PrivateRoute>
              } />
              <Route path="/admin/batch-jobs/:id" element={
                <PrivateRoute>
                  <BatchJobDetailPage />
                </PrivateRoute>
              } />
              
              {/* 사용자 관리 */}
              <Route path="/admin/users" element={
                <PrivateRoute isAdmin={true}>
                  <UserListPage />
                </PrivateRoute>
              } />
              <Route path="/admin/user/:id/edit" element={
                <PrivateRoute isAdmin={true}>
                  <UserEditPage />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } />
                            
              {/* 404 페이지 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Content>
          
          <Footer />
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;