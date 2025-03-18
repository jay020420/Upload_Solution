// src/pages/ProductEditPage.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'antd';
import { PageHeader } from '@ant-design/pro-components';
import { getProductDetails } from '../actions/productActions';
import ProductForm from '../components/products/ProductForm';
import Loader from '../components/common/Loader';

const ProductEditPage = ({ match, history }) => {
  const productId = match.params.id;
  const dispatch = useDispatch();
  
  // Redux 상태
  const productDetails = useSelector(state => state.productDetails);
  const { loading, error, product } = productDetails;
  
  const productUpdate = useSelector(state => state.productUpdate);
  const { loading: loadingUpdate, error: errorUpdate } = productUpdate;
  
  // 페이지 로드 시 상품 상세 정보 조회
  useEffect(() => {
    if (!product || product._id !== productId) {
      dispatch(getProductDetails(productId));
    }
  }, [dispatch, productId, product]);
  
  return (
    <div className="product-edit-page">
      <PageHeader
        onBack={() => history.push(`/admin/product/${productId}`)}
        title="상품 수정"
        subTitle={product?.name}
      />
      
      {(loading || loadingUpdate) && <Loader />}
      
      {error && (
        <Alert
          message="상품 조회 오류"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}
      
      {errorUpdate && (
        <Alert
          message="상품 수정 오류"
          description={errorUpdate}
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}
      
      {!loading && product && (
        <ProductForm
          product={product}
          isEdit={true}
          history={history}
        />
      )}
    </div>
  );
};

export default ProductEditPage;