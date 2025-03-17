// src/pages/ProductListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Table, Button, Card, Input, Select, Row, Col, 
  Tag, Tooltip, Dropdown, Menu, Space, Modal, Typography,
  DatePicker, Statistic, PageHeader
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, FilterOutlined, 
  SyncOutlined, MoreOutlined, DownloadOutlined,
  DeleteOutlined, EditOutlined, ExportOutlined,
  EyeOutlined, LinkOutlined, FileExcelOutlined
} from '@ant-design/icons';
import moment from 'moment';

import { 
  getProducts, 
  deleteProduct,
  exportProductsToExcel 
} from '../actions/productActions';
import BulkUploadModal from '../components/products/BulkUploadModal';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

const ProductListPage = ({ history }) => {
  const dispatch = useDispatch();
  
  // Redux 상태
  const productList = useSelector(state => state.productList);
  const { loading, error, products, page, pages, total } = productList;
  
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  
  // 로컬 상태
  const [keyword, setKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    dateRange: null
  });
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  
  // 페이지 로드 시 상품 조회
  useEffect(() => {
    // 로그인 확인
    if (!userInfo) {
      history.push('/login');
    } else {
      fetchProducts();
    }
  }, [dispatch, history, userInfo, currentPage, pageSize, sortField, sortOrder]);
  
  // 검색 및 필터를 적용하여 상품 조회
  const fetchProducts = () => {
    // 쿼리 파라미터 구성
    const params = {
      page: currentPage,
      pageSize,
      sortField,
      sortOrder,
      keyword: keyword || undefined,
      status: filters.status || undefined,
      category: filters.category || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined
    };
    
    // 날짜 범위 추가
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
      params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
    }
    
    dispatch(getProducts(params));
  };
  
  // 키워드 검색 처리
  const handleSearch = () => {
    setCurrentPage(1); // 검색 시 첫 페이지로 리셋
    fetchProducts();
  };
  
  // 필터 변경 처리
  const handleFilterChange = (name, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };
  
  // 필터 적용 처리
  const handleApplyFilters = () => {
    setCurrentPage(1); // 필터 적용 시 첫 페이지로 리셋
    fetchProducts();
  };
  
  // 필터 초기화 처리
  const handleResetFilters = () => {
    setFilters({
      status: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      dateRange: null
    });
    setKeyword('');
    setCurrentPage(1);
    setSortField('createdAt');
    setSortOrder('desc');
    // 상품 리스트 다시 불러오기
    dispatch(getProducts({ page: 1, pageSize }));
  };
  
  // 정렬 변경 처리
  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    
    if (sorter.field && sorter.order) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };
  
  // 선택된 상품 삭제 처리
  const handleBulkDelete = () => {
    Modal.confirm({
      title: '선택한 상품 삭제',
      content: `선택한 ${selectedRowKeys.length}개의 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          // 선택된 상품 순차적으로 삭제
          for (const productId of selectedRowKeys) {
            await dispatch(deleteProduct(productId));
          }
          
          // 삭제 후 목록 새로고침
          fetchProducts();
          // 선택 초기화
          setSelectedRowKeys([]);
          Modal.success({
            content: '선택한 상품이 성공적으로 삭제되었습니다.'
          });
        } catch (error) {
          Modal.error({
            title: '삭제 실패',
            content: error.message || '상품 삭제 중 오류가 발생했습니다.'
          });
        }
      }
    });
  };
  
  // 엑셀 내보내기 처리
  const handleExportToExcel = () => {
    // 내보낼 상품 ID 배열 (선택된 상품 또는 전체)
    const productIds = selectedRowKeys.length > 0 ? selectedRowKeys : null;
    
    dispatch(exportProductsToExcel({
      productIds,
      filters: {
        ...filters,
        keyword,
        startDate: filters.dateRange ? filters.dateRange[0].format('YYYY-MM-DD') : undefined,
        endDate: filters.dateRange ? filters.dateRange[1].format('YYYY-MM-DD') : undefined
      }
    }));
  };
  
  // 상품 목록 테이블 컬럼 정의
  const columns = [
    {
      title: '상품명',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      sorter: true,
      sortOrder: sortField === 'name' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (text, record) => (
        <Space>
          {record.images && record.images.length > 0 ? (
            <img
              src={record.images.find(img => img.isMain)?.url || record.images[0].url}
              alt={text}
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '40px', height: '40px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              No Img
            </div>
          )}
          <Link to={`/admin/product/${record._id}/edit`}>{text}</Link>
        </Space>
      ),
    },
    {
      title: '가격',
      dataIndex: 'regularPrice',
      key: 'regularPrice',
      width: 120,
      sorter: true,
      sortOrder: sortField === 'regularPrice' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (price, record) => (
        <div>
          {record.salePrice && record.salePrice < price ? (
            <>
              <Text delete>{price.toLocaleString()}원</Text>
              <br />
              <Text type="danger">{record.salePrice.toLocaleString()}원</Text>
            </>
          ) : (
            <Text>{price.toLocaleString()}원</Text>
          )}
        </div>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '판매 중', value: 'active' },
        { text: '임시 저장', value: 'draft' },
        { text: '판매 중지', value: 'inactive' },
        { text: '품절', value: 'out_of_stock' },
      ],
      render: status => {
        let color = 'default';
        let text = '알 수 없음';
        
        switch (status) {
          case 'active':
            color = 'success';
            text = '판매 중';
            break;
          case 'draft':
            color = 'default';
            text = '임시 저장';
            break;
          case 'inactive':
            color = 'warning';
            text = '판매 중지';
            break;
          case 'out_of_stock':
            color = 'error';
            text = '품절';
            break;
          default:
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '재고',
      dataIndex: 'totalStock',
      key: 'totalStock',
      width: 80,
      sorter: true,
      sortOrder: sortField === 'totalStock' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (text, record) => {
        const stock = record.hasVariants
          ? (record.variants || []).reduce((total, variant) => total + (variant.stock || 0), 0)
          : (record.stock || 0);
          
        let color = 'green';
        if (stock <= 0) {
          color = 'red';
        } else if (stock < 10) {
          color = 'orange';
        }
        
        return <Text style={{ color }}>{stock.toLocaleString()}</Text>;
      },
    },
    {
      title: '마켓 연동',
      key: 'marketplaces',
      width: 120,
      render: (_, record) => {
        const marketplaces = record.marketplaces || [];
        
        return (
          <Space>
            {marketplaces.length > 0 ? (
              marketplaces.map(market => {
                const status = market.status || 'pending';
                const marketplace = market.marketplaceId || {};
                
                let color = 'blue';
                let icon = <SyncOutlined spin={status === 'pending'} />;
                
                switch (status) {
                  case 'active':
                    color = 'green';
                    icon = <LinkOutlined />;
                    break;
                  case 'inactive':
                    color = 'orange';
                    icon = <WarningOutlined />;
                    break;
                  case 'rejected':
                    color = 'red';
                    icon = <CloseCircleOutlined />;
                    break;
                  default:
                    break;
                }
                
                return (
                  <Tooltip 
                    key={marketplace._id} 
                    title={`${marketplace.name || '마켓'}: ${status}`}
                  >
                    <Tag color={color} icon={icon}>
                      {marketplace.name || '마켓'}
                    </Tag>
                  </Tooltip>
                );
              })
            ) : (
              <Tag>미연동</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: true,
      sortOrder: sortField === 'createdAt' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: date => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: '작업',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="edit" icon={<EditOutlined />}>
                <Link to={`/admin/product/${record._id}/edit`}>수정</Link>
              </Menu.Item>
              <Menu.Item key="view" icon={<EyeOutlined />}>
                <Link to={`/product/${record._id}`} target="_blank">상품 보기</Link>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                key="delete" 
                icon={<DeleteOutlined />} 
                danger
                onClick={() => {
                  Modal.confirm({
                    title: '상품 삭제',
                    content: `"${record.name}" 상품을 삭제하시겠습니까?`,
                    okText: '삭제',
                    okType: 'danger',
                    cancelText: '취소',
                    onOk: async () => {
                      try {
                        await dispatch(deleteProduct(record._id));
                        fetchProducts();
                      } catch (error) {
                        Modal.error({
                          title: '삭제 실패',
                          content: error.message || '상품 삭제 중 오류가 발생했습니다.'
                        });
                      }
                    }
                  });
                }}
              >
                삭제
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];
  
  // 테이블 행 선택 설정
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    }
  };
  
  return (
    <div className="product-list-page">
      <PageHeader
        title="상품 관리"
        subTitle="상품 목록 조회 및 관리"
        extra={[
          <Button
            key="bulk-upload"
            icon={<FileExcelOutlined />}
            onClick={() => setShowBulkUploadModal(true)}
          >
            대량 업로드
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => history.push('/admin/product/create')}
          >
            상품 등록
          </Button>
        ]}
      />
      
      <Card style={{ marginBottom: '20px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="상품명, 설명 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              style={{ width: '100%' }}
            />
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="상태 필터"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Option value="active">판매 중</Option>
              <Option value="draft">임시 저장</Option>
              <Option value="inactive">판매 중지</Option>
              <Option value="out_of_stock">품절</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
              placeholder={['등록일 시작', '등록일 종료']}
            />
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space>
              <Button 
                type="primary" 
                icon={<FilterOutlined />} 
                onClick={handleApplyFilters}
              >
                필터 적용
              </Button>
              <Button 
                icon={<SyncOutlined />} 
                onClick={handleResetFilters}
              >
                초기화
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      
      <Card>
        {selectedRowKeys.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <Space>
              <Button 
                type="danger" 
                icon={<DeleteOutlined />} 
                onClick={handleBulkDelete}
              >
                {selectedRowKeys.length}개 삭제
              </Button>
              <Button 
                icon={<ExportOutlined />} 
                onClick={handleExportToExcel}
              >
                선택 항목 내보내기
              </Button>
            </Space>
          </div>
        )}
        
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Statistic title="전체 상품" value={total || 0} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="판매 중" 
              value={products?.filter(p => p.status === 'active').length || 0} 
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="품절" 
              value={products?.filter(p => p.status === 'out_of_stock').length || 0} 
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="임시 저장" 
              value={products?.filter(p => p.status === 'draft').length || 0} 
            />
          </Col>
        </Row>
        
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={products || []}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `총 ${total}개 상품`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>
      
      {/* 대량 업로드 모달 */}
      <BulkUploadModal
        visible={showBulkUploadModal}
        onCancel={() => setShowBulkUploadModal(false)}
      />
    </div>
  );
};

export default ProductListPage;