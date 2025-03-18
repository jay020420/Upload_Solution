// src/pages/ProductCreatePage.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Alert } from 'antd';
import { PageHeader } from '@ant-design/pro-components';
import ProductForm from '../components/products/ProductForm';
import Loader from '../components/common/Loader';

const ProductCreatePage = ({ history }) => {
  // Redux 상태
  const productCreate = useSelector(state => state.productCreate);
  const { loading, error } = productCreate;
  
  return (
    <div className="product-create-page">
      <PageHeader
        onBack={() => history.push('/admin/products')}
        title="상품 등록"
        subTitle="새 상품 정보 입력"
      />
      
      {loading && <Loader />}
      
      {error && (
        <Alert
          message="상품 등록 오류"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}
      
      <ProductForm history={history} />
    </div>
  );
};

export default ProductCreatePage;