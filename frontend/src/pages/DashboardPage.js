// src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Row, Col, Card, Statistic, Table, Button, Typography, 
  PageHeader, Progress, Timeline, Empty, Spin, Alert 
} from 'antd';
import { 
  ShoppingOutlined, AppstoreOutlined, ShopOutlined, 
  SyncOutlined, FileExcelOutlined, PlusOutlined, 
  AreaChartOutlined, CheckCircleOutlined, CloseCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { getProducts } from './actions/productActions';
import { listMarketplaces } from '../actions/marketplaceActions';
import Loader from '../components/common/Loader';

const { Title, Text } = Typography;

const DashboardPage = ({ history }) => {
  const dispatch = useDispatch();
  
  // Redux 상태
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  
  const productList = useSelector(state => state.productList);
  const { loading: loadingProducts, error: errorProducts, products, total: totalProducts } = productList;
  
  const marketplaceList = useSelector(state => state.marketplaceList);
  const { loading: loadingMarketplaces, error: errorMarketplaces, marketplaces } = marketplaceList;
  
  // 로컬 상태
  const [recentActivities] = useState([
    { 
      id: 1, 
      type: 'product', 
      action: 'create', 
      message: '새 상품 등록: 무선 블루투스 이어폰', 
      status: 'success',
      time: '10분 전' 
    },
    { 
      id: 2, 
      type: 'marketplace', 
      action: 'sync', 
      message: '네이버 스마트스토어 상품 동기화 완료', 
      status: 'success',
      time: '30분 전' 
    },
    { 
      id: 3, 
      type: 'marketplace', 
      action: 'sync', 
      message: '쿠팡 상품 동기화 실패', 
      status: 'error',
      time: '1시간 전' 
    },
    { 
      id: 4, 
      type: 'product', 
      action: 'update', 
      message: '상품 정보 업데이트: 스마트 워치', 
      status: 'success',
      time: '2시간 전' 
    },
    { 
      id: 5, 
      type: 'bulk', 
      action: 'upload', 
      message: '대량 상품 업로드 완료 (120개)', 
      status: 'success',
      time: '3시간 전' 
    }
  ]);
  
  // 페이지 로드 시 데이터 조회
  useEffect(() => {
    if (!userInfo) {
      history.push('/login');
    } else {
      dispatch(getProducts({ limit: 5 }));
      dispatch(listMarketplaces());
    }
  }, [dispatch, history, userInfo]);
  
  // 마켓플레이스별 상품 연동 상태 (예시)
  const getMarketplaceSyncStatus = () => {
    if (!products || !marketplaces) return [];
    
    const result = [];
    
    marketplaces.forEach(market => {
      // 해당 마켓플레이스에 연동된 상품 수 계산
      const syncedProducts = products.filter(product => 
        product.marketplaces && product.marketplaces.some(m => 
          m.marketplaceId === market._id || m.marketplaceId?._id === market._id
        )
      ).length;
      
      // 총 상품 대비 연동률
      const syncRate = totalProducts ? Math.round((syncedProducts / totalProducts) * 100) : 0;
      
      result.push({
        name: market.name,
        code: market.code,
        syncedCount: syncedProducts,
        totalCount: totalProducts || 0,
        syncRate
      });
    });
    
    return result;
  };
  
  // 최근 등록 상품 테이블 컬럼
  const recentProductColumns = [
    {
      title: '상품명',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/admin/product/${record._id}`}>{text}</Link>
      )
    },
    {
      title: '가격',
      dataIndex: 'regularPrice',
      key: 'price',
      render: price => `${price.toLocaleString()}원`
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'blue';
        let text = '알 수 없음';
        
        switch (status) {
          case 'active':
            color = 'green';
            text = '판매 중';
            break;
          case 'draft':
            color = 'gray';
            text = '임시 저장';
            break;
          case 'inactive':
            color = 'orange';
            text = '판매 중지';
            break;
          case 'out_of_stock':
            color = 'red';
            text = '품절';
            break;
          default:
            break;
        }
        
        return <Text style={{ color }}>{text}</Text>;
      }
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => new Date(date).toLocaleDateString()
    }
  ];
  
  return (
    <div className="dashboard-page">
      <PageHeader
        title="대시보드"
        subTitle="상품 및 마켓플레이스 현황"
        extra={[
          <Button 
            key="upload" 
            icon={<FileExcelOutlined />}
            onClick={() => history.push('/admin/products?action=bulk-upload')}
          >
            대량 상품 업로드
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => history.push('/admin/product/create')}
          >
            상품 등록
          </Button>,
        ]}
      />
      
      {/* 요약 통계 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="전체 상품"
              value={totalProducts || 0}
              prefix={<ShoppingOutlined />}
              loading={loadingProducts}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="판매 중 상품"
              value={products?.filter(p => p.status === 'active').length || 0}
              prefix={<ShoppingOutlined style={{ color: '#52c41a' }} />}
              loading={loadingProducts}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="마켓플레이스 수"
              value={marketplaces?.filter(m => m.isActive).length || 0}
              prefix={<ShopOutlined />}
              loading={loadingMarketplaces}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="카테고리 수"
              value={0} // 실제 구현 시 카테고리 데이터 연결
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      {/* 마켓플레이스 연동 상태 및 최근 상품 */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ShopOutlined style={{ marginRight: '8px' }} />
                <span>마켓플레이스 연동 현황</span>
              </div>
            }
            extra={<Button type="link" onClick={() => history.push('/admin/marketplaces')}>관리</Button>}
          >
            {loadingMarketplaces || loadingProducts ? (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <Spin />
              </div>
            ) : errorMarketplaces ? (
              <Alert type="error" message={errorMarketplaces} />
            ) : getMarketplaceSyncStatus().length === 0 ? (
              <Empty description="마켓플레이스 정보가 없습니다" />
            ) : (
              <div>
                {getMarketplaceSyncStatus().map(market => (
                  <div key={market.code} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{market.name}</Text>
                      <Text>{market.syncedCount} / {market.totalCount}</Text>
                    </div>
                    <Progress 
                      percent={market.syncRate} 
                      size="small" 
                      status={market.syncRate === 100 ? 'success' : 'active'}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingOutlined style={{ marginRight: '8px' }} />
                <span>최근 등록 상품</span>
              </div>
            }
            extra={<Button type="link" onClick={() => history.push('/admin/products')}>전체 보기</Button>}
          >
            {loadingProducts ? (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <Spin />
              </div>
            ) : errorProducts ? (
              <Alert type="error" message={errorProducts} />
            ) : products?.length === 0 ? (
              <Empty description="상품 정보가 없습니다" />
            ) : (
              <Table 
                dataSource={products} 
                columns={recentProductColumns} 
                rowKey="_id"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Col>
      </Row>
      
      {/* 최근 활동 */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <AreaChartOutlined style={{ marginRight: '8px' }} />
                <span>최근 활동</span>
              </div>
            }
          >
            <Timeline style={{ padding: '10px' }}>
              {recentActivities.map(activity => (
                <Timeline.Item
                  key={activity.id}
                  color={activity.status === 'success' ? 'green' : activity.status === 'error' ? 'red' : 'blue'}
                  dot={
                    activity.status === 'success' ? <CheckCircleOutlined /> :
                    activity.status === 'error' ? <CloseCircleOutlined /> :
                    activity.status === 'warning' ? <WarningOutlined /> :
                    <SyncOutlined spin />
                  }
                >
                  <div>
                    <Text strong>{activity.message}</Text>
                    <div>
                      <Text type="secondary">{activity.time}</Text>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;