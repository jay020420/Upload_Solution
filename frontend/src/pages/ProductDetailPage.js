// src/pages/ProductDetailPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Row, Col, Card, Button, Typography, Descriptions, Tag, Image, 
  Divider, Table, Tabs, Popconfirm, Alert, Space,
  List, Timeline, Spin, Tooltip, Modal, message
} from 'antd';
import { PageHeader } from '@ant-design/pro-components';
import { 
  EditOutlined, DeleteOutlined, SyncOutlined, 
  ShopOutlined, PictureOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, WarningOutlined, CopyOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { getProductDetails, deleteProduct, syncProductToMarketplace } from '../actions/productActions';
import { listMarketplaces } from '../actions/marketplaceActions';
import Loader from '../components/common/Loader';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ProductDetailPage = ({ match, history }) => {
  const productId = match.params.id;
  const dispatch = useDispatch();
  
  // Redux 상태
  const productDetails = useSelector(state => state.productDetails);
  const { loading, error, product } = productDetails;
  
  const productDelete = useSelector(state => state.productDelete);
  const { loading: loadingDelete, success: successDelete } = productDelete;
  
  const productSyncMarketplace = useSelector(state => state.productSyncMarketplace);
  const { loading: loadingSync, success: successSync, error: errorSync } = productSyncMarketplace;
  
  const marketplaceList = useSelector(state => state.marketplaceList);
  const { marketplaces } = marketplaceList;
  
  // 로컬 상태
  const [selectedMarketplace, setSelectedMarketplace] = useState(null);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  
  // 페이지 로드 시 데이터 조회
  useEffect(() => {
    if (successDelete) {
      message.success('상품이 삭제되었습니다');
      history.push('/admin/products');
    } else {
      dispatch(getProductDetails(productId));
      dispatch(listMarketplaces({ active: true }));
    }
  }, [dispatch, productId, successDelete, history]);
  
  // 동기화 성공 시 처리
  useEffect(() => {
    if (successSync) {
      dispatch(getProductDetails(productId));
      message.success('마켓플레이스 동기화가 완료되었습니다');
      setSyncModalVisible(false);
    }
  }, [successSync, dispatch, productId]);
  
  // 상품 삭제 처리
  const handleDelete = () => {
    Modal.confirm({
      title: '상품 삭제',
      content: '이 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: () => dispatch(deleteProduct(productId))
    });
  };
  
  // 마켓플레이스 동기화 모달 표시
  const showSyncModal = (marketplace) => {
    setSelectedMarketplace(marketplace);
    setSyncModalVisible(true);
  };
  
  // 마켓플레이스 동기화 처리
  const handleSync = (accountId) => {
    dispatch(syncProductToMarketplace(productId, selectedMarketplace._id, { accountId }));
  };
  
  // 상태별 태그 색상
  const getStatusTag = (status) => {
    switch (status) {
      case 'active':
        return <Tag color="success">판매 중</Tag>;
      case 'draft':
        return <Tag>임시 저장</Tag>;
      case 'inactive':
        return <Tag color="warning">판매 중지</Tag>;
      case 'out_of_stock':
        return <Tag color="error">품절</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  
  // 마켓플레이스 연동 상태 태그
  const getMarketStatusTag = (status) => {
    switch (status) {
      case 'active':
        return <Tag color="success" icon={<CheckCircleOutlined />}>연동 완료</Tag>;
      case 'pending':
        return <Tag color="processing" icon={<SyncOutlined spin />}>처리 중</Tag>;
      case 'inactive':
        return <Tag color="warning" icon={<WarningOutlined />}>비활성</Tag>;
      case 'rejected':
        return <Tag color="error" icon={<CloseCircleOutlined />}>거부됨</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  
  // 옵션 테이블 컬럼
  const variantColumns = [
    {
      title: '옵션 조합',
      dataIndex: 'optionCombination',
      key: 'optionCombination'
    },
    {
      title: '가격',
      dataIndex: 'price',
      key: 'price',
      render: price => `${price.toLocaleString()}원`
    },
    {
      title: '재고',
      dataIndex: 'stock',
      key: 'stock'
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku'
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      render: isActive => isActive ? 
        <Tag color="success">활성</Tag> : 
        <Tag color="default">비활성</Tag>
    }
  ];
  
  return (
    <div className="product-detail-page">
      <PageHeader
        onBack={() => history.push('/admin/products')}
        title="상품 상세"
        subTitle={product?.name}
        extra={[
          <Button
            key="delete"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            loading={loadingDelete}
          >
            삭제
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => history.push(`/admin/product/${productId}/edit`)}
          >
            수정
          </Button>
        ]}
      />
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Alert
          message="상품 조회 오류"
          description={error}
          type="error"
          showIcon
        />
      ) : product ? (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card>
                {product.images && product.images.length > 0 ? (
                  <Image.PreviewGroup>
                    <Image
                      src={product.images.find(img => img.isMain)?.url || product.images[0].url}
                      alt={product.name}
                      style={{ width: '100%', objectFit: 'contain' }}
                    />
                  </Image.PreviewGroup>
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '200px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: '#f0f0f0' 
                  }}>
                    <PictureOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  </div>
                )}
                
                {product.images && product.images.length > 1 && (
                  <div style={{ marginTop: '10px', overflow: 'auto', whiteSpace: 'nowrap' }}>
                    {product.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image.url}
                        alt={`${product.name} - ${index}`}
                        width={60}
                        height={60}
                        style={{ 
                          objectFit: 'cover', 
                          marginRight: '5px',
                          border: image.isMain ? '2px solid #1890ff' : 'none',
                          borderRadius: '4px'
                        }}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </Col>
            
            <Col xs={24} md={16}>
              <Card>
                <Descriptions 
                  title="기본 정보" 
                  bordered 
                  column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
                >
                  <Descriptions.Item label="상품명">{product.name}</Descriptions.Item>
                  <Descriptions.Item label="상태">{getStatusTag(product.status)}</Descriptions.Item>
                  <Descriptions.Item label="정상가">{product.regularPrice?.toLocaleString()}원</Descriptions.Item>
                  
                  {product.salePrice && (
                    <Descriptions.Item label="판매가">{product.salePrice.toLocaleString()}원</Descriptions.Item>
                  )}
                  
                  {product.costPrice && (
                    <Descriptions.Item label="원가">{product.costPrice.toLocaleString()}원</Descriptions.Item>
                  )}
                  
                  <Descriptions.Item label="브랜드">{product.brand || '-'}</Descriptions.Item>
                  
                  <Descriptions.Item label="카테고리">
                    {product.categories && product.categories.length > 0 ? (
                      product.categories.map(cat => (
                        <Tag key={cat._id || cat}>{cat.name || cat}</Tag>
                      ))
                    ) : '-'}
                  </Descriptions.Item>
                  
                  {!product.hasVariants && (
                    <Descriptions.Item label="재고">{product.stock || 0}</Descriptions.Item>
                  )}
                  
                  <Descriptions.Item label="등록일">{new Date(product.createdAt).toLocaleString()}</Descriptions.Item>
                  <Descriptions.Item label="최종 수정일">{new Date(product.updatedAt).toLocaleString()}</Descriptions.Item>
                </Descriptions>
                
                {/* 마켓플레이스 연동 정보 */}
                <Divider orientation="left">마켓플레이스 연동</Divider>
                
                <Row gutter={[16, 16]}>
                  {marketplaces?.map(marketplace => {
                    // 이 마켓플레이스에 연동된 정보 찾기
                    const syncInfo = product.marketplaces?.find(
                      m => m.marketplaceId === marketplace._id || 
                          (m.marketplaceId && m.marketplaceId._id === marketplace._id)
                    );
                    
                    return (
                      <Col key={marketplace._id} xs={24} sm={12} md={8}>
                        <Card 
                          size="small" 
                          title={
                            <Space>
                              {marketplace.logo ? (
                                <img 
                                  src={marketplace.logo} 
                                  alt={marketplace.name}
                                  style={{ width: '20px', height: '20px' }}
                                />
                              ) : (
                                <ShopOutlined />
                              )}
                              <span>{marketplace.name}</span>
                            </Space>
                          }
                          extra={
                            <Button 
                              type="link" 
                              size="small"
                              onClick={() => showSyncModal(marketplace)}
                            >
                              {syncInfo ? '재연동' : '연동'}
                            </Button>
                          }
                        >
                          {syncInfo ? (
                            <div>
                              <div style={{ marginBottom: '5px' }}>
                                {getMarketStatusTag(syncInfo.status)}
                              </div>
                              
                              {syncInfo.externalProductId && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Text ellipsis style={{ maxWidth: '150px' }} copyable>
                                    {syncInfo.externalProductId}
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {syncInfo.lastSyncDate ? 
                                      new Date(syncInfo.lastSyncDate).toLocaleDateString() : 
                                      '-'}
                                  </Text>
                                </div>
                              )}
                              
                              {syncInfo.errors && syncInfo.errors.length > 0 && (
                                <Tooltip title={syncInfo.errors.join('\n')}>
                                  <Text type="danger">오류 발생</Text>
                                </Tooltip>
                              )}
                            </div>
                          ) : (
                            <Text type="secondary">연동되지 않음</Text>
                          )}
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            </Col>
          </Row>
          
          <Tabs defaultActiveKey="description" style={{ marginTop: '16px' }}>
            <TabPane tab="상품 설명" key="description">
              <Card>
                {product.shortDescription && (
                  <div style={{ marginBottom: '20px' }}>
                    <Title level={5}>간단 설명</Title>
                    <Paragraph>{product.shortDescription}</Paragraph>
                    <Divider />
                  </div>
                )}
                
                <Title level={5}>상세 설명</Title>
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <Text type="secondary">상세 설명이 없습니다</Text>
                )}
              </Card>
            </TabPane>
            
            <TabPane tab="옵션 및 재고" key="options">
              <Card>
                {product.hasVariants && product.variants && product.variants.length > 0 ? (
                  <>
                    <Title level={5}>옵션 정보</Title>
                    {product.options && product.options.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <Descriptions bordered size="small" column={1}>
                          {product.options.map((option, index) => (
                            <Descriptions.Item key={index} label={option.name}>
                              {option.values.map((value, valueIndex) => (
                                <Tag key={valueIndex}>
                                  {value.name}
                                  {value.additionalPrice > 0 && ` (+${value.additionalPrice.toLocaleString()}원)`}
                                </Tag>
                              ))}
                            </Descriptions.Item>
                          ))}
                        </Descriptions>
                      </div>
                    )}
                    
                    <Title level={5}>조합별 정보</Title>
                    <Table 
                      dataSource={product.variants} 
                      columns={variantColumns}
                      rowKey="optionCombination"
                      pagination={false}
                      size="small"
                    />
                  </>
                ) : (
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="재고 수량">{product.stock || 0}</Descriptions.Item>
                    <Descriptions.Item label="SKU">{product.sku || '-'}</Descriptions.Item>
                  </Descriptions>
                )}
              </Card>
            </TabPane>
            
            {product.dimensions && (
              <TabPane tab="배송 정보" key="shipping">
                <Card>
                  <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="무게">{product.weight ? `${product.weight}g` : '-'}</Descriptions.Item>
                    <Descriptions.Item label="배송 분류">{product.shippingClass || '-'}</Descriptions.Item>
                    
                    {product.dimensions && (
                      <Descriptions.Item label="치수">
                        {product.dimensions.length && product.dimensions.width && product.dimensions.height ? 
                          `${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height} cm` : 
                          '-'}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </TabPane>
            )}
          </Tabs>
          
          {/* 마켓플레이스 동기화 모달 */}
          {selectedMarketplace && (
            <Modal
              title={`${selectedMarketplace.name} 연동`}
              visible={syncModalVisible}
              onCancel={() => setSyncModalVisible(false)}
              footer={null}
            >
              {errorSync && (
                <Alert
                  message="동기화 오류"
                  description={errorSync}
                  type="error"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}
              
              {loadingSync ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '10px' }}>동기화 중입니다...</div>
                </div>
              ) : (
                <>
                  <Paragraph>
                    이 상품을 {selectedMarketplace.name}에 연동하시겠습니까?
                  </Paragraph>
                  
                  {selectedMarketplace.accounts && selectedMarketplace.accounts.length > 0 ? (
                    <>
                      <Divider>연동 계정 선택</Divider>
                      <List
                        dataSource={selectedMarketplace.accounts.filter(acc => acc.isActive)}
                        renderItem={account => (
                          <List.Item
                            actions={[
                              <Button 
                                type="primary" 
                                onClick={() => handleSync(account._id)}
                              >
                                연동하기
                              </Button>
                            ]}
                          >
                            <List.Item.Meta
                              title={account.name}
                              description={account.isDefault ? '기본 계정' : ''}
                            />
                          </List.Item>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <Alert
                        message="계정 정보 없음"
                        description={`${selectedMarketplace.name}에 등록된 계정이 없습니다. 마켓플레이스 관리에서 계정을 추가해주세요.`}
                        type="warning"
                        showIcon
                      />
                      <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <Button onClick={() => history.push('/admin/marketplaces')}>
                          마켓플레이스 관리
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </Modal>
          )}
        </>
      ) : (
        <Alert
          message="상품 정보 없음"
          description="해당 상품을 찾을 수 없습니다"
          type="info"
          showIcon
        />
      )}
    </div>
  );
};

export default ProductDetailPage;