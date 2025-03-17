// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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
        
        <Layout className="site-layout">
          <Header />
          
          <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
            <Switch>
              {/* 공개 라우트 */}
              <Route path="/login" component={LoginPage} exact />
              <Route path="/register" component={RegisterPage} exact />
              
              {/* 대시보드 */}
              <PrivateRoute path="/" component={DashboardPage} exact />
              <PrivateRoute path="/dashboard" component={DashboardPage} exact />
              
              {/* 상품 관리 */}
              <PrivateRoute path="/admin/products" component={ProductListPage} exact />
              <PrivateRoute path="/admin/product/create" component={ProductCreatePage} exact />
              <PrivateRoute path="/admin/product/:id" component={ProductDetailPage} exact />
              <PrivateRoute path="/admin/product/:id/edit" component={ProductEditPage} exact />
              
              {/* 카테고리 관리 */}
              <PrivateRoute path="/admin/categories" component={CategoryListPage} exact />
              <PrivateRoute path="/admin/category/create" component={CategoryEditPage} exact />
              <PrivateRoute path="/admin/category/:id/edit" component={CategoryEditPage} exact />
              
              {/* 마켓플레이스 관리 */}
              <PrivateRoute path="/admin/marketplaces" component={MarketplaceListPage} exact />
              <PrivateRoute path="/admin/marketplace/create" component={MarketplaceEditPage} exact />
              <PrivateRoute path="/admin/marketplace/:id/edit" component={MarketplaceEditPage} exact />
              
              {/* 배치 작업 관리 */}
              <PrivateRoute path="/admin/batch-jobs" component={BatchJobListPage} exact />
              <PrivateRoute path="/admin/batch-jobs/:id" component={BatchJobDetailPage} exact />
              
              {/* 사용자 관리 */}
              <PrivateRoute path="/admin/users" component={UserListPage} exact isAdmin />
              <PrivateRoute path="/admin/user/:id/edit" component={UserEditPage} exact isAdmin />
              <PrivateRoute path="/profile" component={ProfilePage} exact />
                            
              {/* 404 페이지 */}
              <Route component={NotFoundPage} />
            </Switch>
          </Content>
          
          <Footer />
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;