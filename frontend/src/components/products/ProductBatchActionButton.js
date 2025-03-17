// src/components/products/ProductBatchActionButton.js
import React, { useState } from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { 
  DatabaseOutlined, DollarOutlined, DownOutlined, 
  ShopOutlined, TagOutlined, DeleteOutlined 
} from '@ant-design/icons';
import BatchJobModal from '../batch/BatchJobModal';

/**
 * 상품 일괄 작업 버튼 컴포넌트
 * 
 * @param {Array} selectedProducts - 선택된 상품 ID 배열
 * @param {Function} refreshProducts - 상품 목록 갱신 함수
 */
const ProductBatchActionButton = ({ selectedProducts = [], refreshProducts }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  
  // 작업 선택 처리
  const handleMenuClick = ({ key }) => {
    setSelectedAction(key);
    setModalVisible(true);
  };
  
  // 모달 닫기 처리
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedAction('');
  };
  
  // 배치 작업 버튼 메뉴
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="product_price_update" icon={<DollarOutlined />}>
        가격 일괄 수정
      </Menu.Item>
      <Menu.Item key="product_stock_update" icon={<DatabaseOutlined />}>
        재고 일괄 수정
      </Menu.Item>
      <Menu.Item key="product_status_update" icon={<TagOutlined />}>
        상태 일괄 변경
      </Menu.Item>
      <Menu.Item key="product_marketplace_sync" icon={<ShopOutlined />}>
        마켓플레이스 일괄 연동
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="product_delete" icon={<DeleteOutlined />} danger>
        상품 일괄 삭제
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown 
        overlay={menu} 
        disabled={selectedProducts.length === 0}
        trigger={['click']}
      >
        <Button>
          일괄 작업 <DownOutlined />
        </Button>
      </Dropdown>
      
      <BatchJobModal
        visible={modalVisible}
        onCancel={handleModalClose}
        selectedProducts={selectedProducts}
        refreshProducts={refreshProducts}
        initialJobType={selectedAction}
      />
    </>
  );
};

export default ProductBatchActionButton;