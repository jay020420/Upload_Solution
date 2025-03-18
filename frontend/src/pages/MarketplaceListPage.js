// src/pages/MarketplaceListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Table, Button, Card, Input, Select, Row, Col, 
  Tag, Tooltip, Dropdown, Menu, Space, Modal, Typography,
  PageHeader, Alert
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, FilterOutlined, 
  SyncOutlined, MoreOutlined, EditOutlined,
  DeleteOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { listMarketplaces, deleteMarketplace } from '../actions/marketplaceActions';
import Loader from '../components/common/Loader';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;
const { confirm } = Modal;

const MarketplaceListPage = ({ history }) => {
  const dispatch = useDispatch();
  
  // Redux 상태
  const marketplaceList = useSelector(state => state.marketplaceList);
  const { loading, error, marketplaces } = marketplaceList;
  
  const marketplaceDelete = useSelector(state => state.marketplaceDelete);
  const { loading: loadingDelete, success: successDelete, error: errorDelete } = marketplaceDelete;
  
  // 로컬 상태
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // 페이지 로드 시 마켓플레이스 목록 조회
  useEffect(() => {
    dispatch(listMarketplaces());
  }, [dispatch, successDelete]);
  
  // 마켓플레이스 삭제 확인 모달
  const showDeleteConfirm = (id, name) => {
    confirm({
      title: '마켓플레이스 삭제',
      icon: <ExclamationCircleOutlined />,
      content: `"${name}" 마켓플레이스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk() {
        dispatch(deleteMarketplace(id));
      }
    });
  };
  
  // 키워드 검색 처리
  const handleSearch = (value) => {
    setKeyword(value);
    dispatch(listMarketplaces({ keyword: value, type: typeFilter }));
  };
  
  // 유형 필터 변경 처리
  const handleTypeChange = (value) => {
    setTypeFilter(value);
    dispatch(listMarketplaces({ keyword, type: value }));
  };
  
  // 필터 초기화
  const handleResetFilters = () => {
    setKeyword('');
    setTypeFilter('');
    dispatch(listMarketplaces());
  };
  
  // 마켓플레이스 테이블 컬럼
  const columns = [
    {
      title: '마켓플레이스',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.logo ? (
            <img
              src={record.logo}
              alt={text}
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ width: '32px', height: '32px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text>로고</Text>
            </div>
          )}
          <Link to={`/admin/marketplace/${record._id}/edit`}>{text}</Link>
        </Space>
      ),
    },
    {
      title: '코드',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      filters: [
        { text: '오픈마켓', value: 'openmarket' },
        { text: '소셜커머스', value: 'socialcommerce' },
        { text: '종합몰', value: 'mall' },
        { text: '기타', value: 'other' },
      ],
      render: type => {
        let text = type;
        let color = 'default';
        
        switch (type) {
          case 'openmarket':
            text = '오픈마켓';
            color = 'blue';
            break;
          case 'socialcommerce':
            text = '소셜커머스';
            color = 'green';
            break;
          case 'mall':
            text = '종합몰';
            color = 'purple';
            break;
          case 'other':
            text = '기타';
            color = 'default';
            break;
          default:
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: isActive => (
        isActive ? 
          <Tag color="success">활성</Tag> : 
          <Tag color="error">비활성</Tag>
      ),
    },
    {
      title: '등록 계정',
      dataIndex: 'accounts',
      key: 'accounts',
      width: 120,
      render: accounts => accounts?.length || 0,
    },
    {
      title: '작업',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => history.push(`/admin/marketplace/${record._id}/edit`)}
          >
            수정
          </Button>
          
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record._id, record.name)}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];
  
  return (
    <div className="marketplace-list-page">
      <PageHeader
        title="마켓플레이스 관리"
        subTitle="마켓플레이스 목록"
        extra={[
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => history.push('/admin/marketplace/create')}
          >
            마켓플레이스 추가
          </Button>
        ]}
      />
      
      <Card style={{ marginBottom: '20px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6} lg={8}>
            <Search
              placeholder="마켓플레이스 검색"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          
          <Col xs={24} sm={8} md={6} lg={8}>
            <Select
              placeholder="유형 필터"
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={handleTypeChange}
              allowClear
            >
              <Option value="openmarket">오픈마켓</Option>
              <Option value="socialcommerce">소셜커머스</Option>
              <Option value="mall">종합몰</Option>
              <Option value="other">기타</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={8} md={6} lg={8}>
            <Button
              icon={<SyncOutlined />}
              onClick={handleResetFilters}
            >
              필터 초기화
            </Button>
          </Col>
        </Row>
      </Card>
      
      <Card>
        {errorDelete && (
          <Alert
            message="마켓플레이스 삭제 오류"
            description={errorDelete}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}
        
        {loading ? (
          <Loader />
        ) : error ? (
          <Alert
            message="마켓플레이스 조회 오류"
            description={error}
            type="error"
            showIcon
          />
        ) : (
          <Table
            columns={columns}
            dataSource={marketplaces || []}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  );
};

export default MarketplaceListPage;