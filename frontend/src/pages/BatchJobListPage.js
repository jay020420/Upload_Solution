// src/pages/BatchJobListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Table, Button, Card, Input, Select, Row, Col, 
  Tag, Tooltip, Dropdown, Menu, Space, DatePicker, 
  Progress, Badge, Popconfirm, Typography 
} from 'antd';
import { PageHeader } from '@ant-design/pro-components';
import { 
  PlusOutlined, SearchOutlined, FilterOutlined, 
  SyncOutlined, MoreOutlined, DownloadOutlined,
  DeleteOutlined, EditOutlined, ExportOutlined,
  EyeOutlined, LinkOutlined, FileExcelOutlined,
  DatabaseOutlined, TagOutlined, WarningOutlined,
  CloseCircleOutlined, FieldTimeOutlined, CheckCircleOutlined,
  StopOutlined, PauseCircleOutlined, PlayCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { listBatchJobs, updateBatchJobStatus, deleteBatchJob } from '../actions/batchJobActions';
import { BATCH_JOB_DELETE_RESET, BATCH_JOB_STATUS_UPDATE_RESET } from '../constants/batchJobConstants';
import Loader from '../components/common/Loader';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

const BatchJobListPage = ({ history }) => {
  const dispatch = useDispatch();
  
  // 로컬 상태
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Redux 상태
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  
  const batchJobList = useSelector(state => state.batchJobList);
  const { loading, error, jobs, page, pages, total } = batchJobList;
  
  const batchJobStatusUpdate = useSelector(state => state.batchJobStatusUpdate);
  const { success: successStatusUpdate } = batchJobStatusUpdate;
  
  const batchJobDelete = useSelector(state => state.batchJobDelete);
  const { success: successDelete } = batchJobDelete;
  
  // 배치 작업 목록 조회
  const fetchJobs = () => {
    const params = {
      page: currentPage,
      pageSize,
      sortField,
      sortOrder,
      keyword: keyword || undefined,
      type: type || undefined,
      status: status || undefined
    };
    
    // 날짜 범위 추가
    if (dateRange && dateRange.length === 2) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    
    dispatch(listBatchJobs(params));
  };
  
  // 페이지 로드 시 데이터 조회
  useEffect(() => {
    // 로그인 확인
    if (!userInfo) {
      history.push('/login');
    } else {
      fetchJobs();
    }
  }, [dispatch, history, userInfo, currentPage, pageSize, sortField, sortOrder]);
  
  // 작업 상태 업데이트 또는 삭제 성공 후 목록 갱신
  useEffect(() => {
    if (successStatusUpdate) {
      dispatch({ type: BATCH_JOB_STATUS_UPDATE_RESET });
      fetchJobs();
    }
    
    if (successDelete) {
      dispatch({ type: BATCH_JOB_DELETE_RESET });
      fetchJobs();
    }
  }, [dispatch, successStatusUpdate, successDelete]);
  
  // 필터 적용
  const handleApplyFilters = () => {
    setCurrentPage(1); // 필터 적용 시 첫 페이지로 리셋
    fetchJobs();
  };
  
  // 필터 초기화
  const handleResetFilters = () => {
    setKeyword('');
    setType('');
    setStatus('');
    setDateRange(null);
    setCurrentPage(1);
    setSortField('createdAt');
    setSortOrder('desc');
    fetchJobs();
  };
  
  // 테이블 변경 처리
  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    
    if (sorter.field && sorter.order) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };
  
  // 작업 상태 업데이트 처리
  const handleStatusUpdate = (jobId, newStatus) => {
    dispatch(updateBatchJobStatus(jobId, newStatus));
  };
  
  // 작업 삭제 처리
  const handleDeleteJob = (jobId) => {
    dispatch(deleteBatchJob(jobId));
  };
  
  // 작업 타입별 아이콘 및 텍스트
  const getJobTypeInfo = (type) => {
    switch (type) {
      case 'product_price_update':
        return { icon: '$', text: '가격 수정', color: 'blue' };
      case 'product_stock_update':
        return { icon: <DatabaseOutlined />, text: '재고 수정', color: 'cyan' };
      case 'product_status_update':
        return { icon: <TagOutlined />, text: '상태 변경', color: 'geekblue' };
      case 'product_marketplace_sync':
        return { icon: <SyncOutlined />, text: '마켓 연동', color: 'purple' };
      case 'product_category_update':
        return { icon: <TagOutlined />, text: '카테고리 수정', color: 'magenta' };
      case 'product_delete':
        return { icon: <DeleteOutlined />, text: '상품 삭제', color: 'red' };
      default:
        return { icon: <FieldTimeOutlined />, text: '사용자 정의', color: 'default' };
    }
  };
  
  // 작업 상태별 태그 정보
  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag icon={<FieldTimeOutlined />} color="default">대기 중</Tag>;
      case 'processing':
        return <Tag icon={<SyncOutlined spin />} color="processing">처리 중</Tag>;
      case 'completed':
        return <Tag icon={<CheckCircleOutlined />} color="success">완료</Tag>;
      case 'failed':
        return <Tag icon={<CloseCircleOutlined />} color="error">실패</Tag>;
      case 'cancelled':
        return <Tag icon={<StopOutlined />} color="warning">취소됨</Tag>;
      case 'paused':
        return <Tag icon={<PauseCircleOutlined />} color="orange">일시정지</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  
  // 배치 작업 테이블 컬럼
  const columns = [
    {
      title: '작업명',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      sortOrder: sortField === 'name' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (text, record) => (
        <Link to={`/admin/batch-jobs/${record._id}`}>
          <Space>
            <Tag color={getJobTypeInfo(record.type).color}>{getJobTypeInfo(record.type).text}</Tag>
            <span>{text}</span>
          </Space>
        </Link>
      )
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: '대기 중', value: 'pending' },
        { text: '처리 중', value: 'processing' },
        { text: '완료', value: 'completed' },
        { text: '실패', value: 'failed' },
        { text: '취소됨', value: 'cancelled' },
        { text: '일시정지', value: 'paused' }
      ],
      render: status => getStatusTag(status)
    },
    {
      title: '진행률',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress, record) => (
        <Tooltip 
          title={`${progress?.processed || 0}/${progress?.total || 0} 항목 처리됨 (성공: ${progress?.succeeded || 0}, 실패: ${progress?.failed || 0})`}
        >
          <Progress 
            percent={progress?.total ? Math.round((progress.processed / progress.total) * 100) : 0}
            size="small"
            status={
              record.status === 'failed' ? 'exception' :
              record.status === 'completed' ? 'success' :
              record.status === 'processing' ? 'active' :
              record.status === 'cancelled' ? 'exception' :
              'normal'
            }
          />
        </Tooltip>
      )
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: true,
      sortOrder: sortField === 'createdAt' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: date => moment(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '작업 시간',
      key: 'duration',
      width: 100,
      render: (_, record) => {
        // 작업 시간 계산
        if (!record.startedAt) {
          return <Text type="secondary">대기 중</Text>;
        }
        
        const start = moment(record.startedAt);
        const end = record.completedAt ? moment(record.completedAt) : moment();
        const duration = moment.duration(end.diff(start));
        
        // 형식: 00:00:00 (시:분:초)
        const hours = Math.floor(duration.asHours()).toString().padStart(2, '0');
        const minutes = duration.minutes().toString().padStart(2, '0');
        const seconds = duration.seconds().toString().padStart(2, '0');
        
        return <Text>{hours}:{minutes}:{seconds}</Text>;
      }
    },
    {
      title: '작업',
      key: 'actions',
      width: 100,
      render: (_, record) => {
        // 작업 항목별 가능한 액션 결정
        const actions = [];
        
        if (record.status === 'pending') {
          actions.push(
            <Menu.Item 
              key="start" 
              icon={<PlayCircleOutlined />}
              onClick={() => handleStatusUpdate(record._id, 'processing')}
            >
              시작
            </Menu.Item>
          );
          
          actions.push(
            <Menu.Item 
              key="cancel" 
              icon={<StopOutlined />}
              onClick={() => handleStatusUpdate(record._id, 'cancelled')}
            >
              취소
            </Menu.Item>
          );
        }
        
        if (record.status === 'processing') {
          actions.push(
            <Menu.Item 
              key="pause" 
              icon={<PauseCircleOutlined />}
              onClick={() => handleStatusUpdate(record._id, 'paused')}
            >
              일시정지
            </Menu.Item>
          );
          
          actions.push(
            <Menu.Item 
              key="cancel" 
              icon={<StopOutlined />}
              onClick={() => handleStatusUpdate(record._id, 'cancelled')}
            >
              취소
            </Menu.Item>
          );
        }
        
        if (record.status === 'paused') {
          actions.push(
            <Menu.Item 
              key="resume" 
              icon={<PlayCircleOutlined />}
              onClick={() => handleStatusUpdate(record._id, 'processing')}
            >
              재개
            </Menu.Item>
          );
          
          actions.push(
            <Menu.Item 
              key="cancel" 
              icon={<StopOutlined />}
              onClick={() => handleStatusUpdate(record._id, 'cancelled')}
            >
              취소
            </Menu.Item>
          );
        }
        
        // 삭제 액션은 관리자만 가능
        if (userInfo && userInfo.isAdmin) {
          actions.push(
            <Menu.Item 
              key="delete" 
              icon={<DeleteOutlined />} 
              danger
              onClick={() => handleDeleteJob(record._id)}
            >
              삭제
            </Menu.Item>
          );
        }
        
        return (
          <Space>
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => history.push(`/admin/batch-jobs/${record._id}`)}
            >
              상세
            </Button>
            
            {actions.length > 0 && (
              <Dropdown 
                overlay={<Menu>{actions}</Menu>} 
                trigger={['click']}
                placement="bottomRight"
              >
                <Button size="small" icon={<MoreOutlined />} />
              </Dropdown>
            )}
          </Space>
        );
      }
    }
  ];
  
  return (
    <div className="batch-job-list-page">
      <PageHeader
        title="배치 작업 관리"
        subTitle="배치 작업 목록"
      />
      
      <Card style={{ marginBottom: '20px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="작업명 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleApplyFilters}
              prefix={<SearchOutlined />}
              style={{ width: '100%' }}
            />
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="작업 유형"
              style={{ width: '100%' }}
              value={type}
              onChange={(value) => setType(value)}
              allowClear
            >
              <Option value="product_price_update">가격 수정</Option>
              <Option value="product_stock_update">재고 수정</Option>
              <Option value="product_status_update">상태 변경</Option>
              <Option value="product_marketplace_sync">마켓 연동</Option>
              <Option value="product_category_update">카테고리 수정</Option>
              <Option value="product_delete">상품 삭제</Option>
              <Option value="custom">사용자 정의</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="작업 상태"
              style={{ width: '100%' }}
              value={status}
              onChange={(value) => setStatus(value)}
              allowClear
            >
              <Option value="pending">대기 중</Option>
              <Option value="processing">처리 중</Option>
              <Option value="completed">완료</Option>
              <Option value="failed">실패</Option>
              <Option value="cancelled">취소됨</Option>
              <Option value="paused">일시정지</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              placeholder={['시작일', '종료일']}
            />
          </Col>
          
          <Col xs={24} sm={24} md={8} lg={6} style={{ marginTop: '10px' }}>
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
        {loading ? (
          <Loader />
        ) : error ? (
          <div>에러: {error}</div>
        ) : (
          <Table
            columns={columns}
            dataSource={jobs || []}
            rowKey="_id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `총 ${total}개 작업`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>
    </div>
  );
};

export default BatchJobListPage;