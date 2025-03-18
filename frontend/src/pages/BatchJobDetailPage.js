// src/pages/BatchJobDetailPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Row, Col, Descriptions, Tag, Button, Tabs, 
  Table, Progress, Timeline, Tooltip, Statistic, 
  PageHeader, Space, Spin, Result, Badge, Divider,
  Alert, Modal, message, Typography, Select
} from 'antd';
import { 
  ArrowLeftOutlined, SyncOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, InfoCircleOutlined, WarningOutlined,
  PlayCircleOutlined, PauseCircleOutlined, StopOutlined,
  ReloadOutlined, FieldTimeOutlined, DatabaseOutlined
} from '@ant-design/icons';
import moment from 'moment';

import { 
  getBatchJobDetails, 
  getBatchJobItems, 
  getBatchJobLogs,
  updateBatchJobStatus 
} from '../actions/batchJobActions';
import { 
  BATCH_JOB_DETAILS_RESET,
  BATCH_JOB_ITEMS_RESET,
  BATCH_JOB_LOGS_RESET,
  BATCH_JOB_STATUS_UPDATE_RESET
} from '../constants/batchJobConstants';
import Loader from '../components/common/Loader';

const { TabPane } = Tabs;
const { Text } = Typography;
const { Option } = Select;

const BatchJobDetailPage = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // 로컬 상태
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsPageSize, setItemsPageSize] = useState(50);
  const [itemsStatus, setItemsStatus] = useState('');
  
  // Redux 상태
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const batchJobDetails = useSelector(state => state.batchJobDetails);
  const { loading, error, job } = batchJobDetails;
  
  const batchJobItems = useSelector(state => state.batchJobItems);
  const { 
    loading: loadingItems, 
    error: errorItems, 
    items, 
    page: itemsCurrentPage,
    pages: itemsTotalPages,
    total: itemsTotal
  } = batchJobItems;
  
  const batchJobLogs = useSelector(state => state.batchJobLogs);
  const { loading: loadingLogs, error: errorLogs, logs } = batchJobLogs;
  
  const batchJobStatusUpdate = useSelector(state => state.batchJobStatusUpdate);
  const { 
    loading: loadingStatusUpdate, 
    success: successStatusUpdate, 
    error: errorStatusUpdate
  } = batchJobStatusUpdate;
  
  // 작업 상세 정보 조회
  const fetchJobDetails = () => {
    dispatch(getBatchJobDetails(jobId));
  };
  
  // 작업 항목 조회
  const fetchJobItems = () => {
    const params = {
      page: itemsPage,
      pageSize: itemsPageSize,
      status: itemsStatus || undefined
    };
    
    dispatch(getBatchJobItems(jobId, params));
  };
  
  // 작업 로그 조회
  const fetchJobLogs = () => {
    dispatch(getBatchJobLogs(jobId));
  };
  
  // 페이지 로드 시 데이터 조회
  useEffect(() => {
    // 로그인 상태 확인
    if (!userInfo) {
      navigate('/login');
    } else {
      fetchJobDetails();
      fetchJobItems();
      fetchJobLogs();
    }

    // 컴포넌트 언마운트 시 인터벌 제거 및 상태 초기화
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }

      // Redux 상태 초기화
      dispatch({ type: BATCH_JOB_DETAILS_RESET });
      dispatch({ type: BATCH_JOB_ITEMS_RESET });
      dispatch({ type: BATCH_JOB_LOGS_RESET });
    };
  }, [dispatch, navigate, jobId, userInfo]);
  
  // 작업 상태에 따른 갱신 주기 설정
  useEffect(() => {
    if (job) {
      setupRefreshInterval(job.status);
    }
  }, [job]);
  
  // 항목 페이지 변경 시 데이터 조회
  useEffect(() => {
    fetchJobItems();
  }, [itemsPage, itemsPageSize, itemsStatus]);
  
  // 작업 상태 업데이트 성공 시 처리
  useEffect(() => {
    if (successStatusUpdate) {
      // 상태 업데이트 Redux 상태 초기화
      dispatch({ type: BATCH_JOB_STATUS_UPDATE_RESET });
      
      // 작업 상세 정보 다시 조회
      fetchJobDetails();
      
      message.success('작업 상태가 업데이트되었습니다');
    }
  }, [dispatch, successStatusUpdate]);
  
  // 주기적 갱신 설정 함수
  const setupRefreshInterval = (status) => {
    // 기존 인터벌 제거
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    
    // 진행 중이거나 일시정지 상태인 경우에만 주기적 갱신
    if (status === 'processing' || status === 'paused') {
      const interval = setInterval(() => {
        fetchJobDetails();
        fetchJobItems();
        fetchJobLogs();
      }, 5000); // 5초마다 갱신
      
      setRefreshInterval(interval);
    }
  };
  
  // 작업 상태 업데이트 처리
  const handleStatusUpdate = (status) => {
    Modal.confirm({
      title: '작업 상태 변경',
      content: `작업을 ${getStatusText(status)}(으)로 변경하시겠습니까?`,
      onOk: () => {
        dispatch(updateBatchJobStatus(jobId, status));
      }
    });
  };
  
  // 데이터 수동 갱신
  const handleRefresh = () => {
    fetchJobDetails();
    fetchJobItems();
    fetchJobLogs();
  };
  
  // 작업 타입별 정보
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
        return { icon: <StopOutlined />, text: '상품 삭제', color: 'red' };
      default:
        return { icon: <FieldTimeOutlined />, text: '사용자 정의', color: 'default' };
    }
  };
  
  // 작업 상태별 태그
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
  
  // 작업 항목 상태별 태그
  const getItemStatusTag = (status, result) => {
    switch (status) {
      case 'pending':
        return <Badge status="default" text="대기 중" />;
      case 'processing':
        return <Badge status="processing" text="처리 중" />;
      case 'completed':
        return result && result.success ? 
          <Badge status="success" text="성공" /> : 
          <Badge status="error" text="실패" />;
      case 'failed':
        return <Badge status="error" text="처리 실패" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };
  
  // 상태 텍스트 변환
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '대기 중';
      case 'processing': return '처리 중';
      case 'completed': return '완료';
      case 'failed': return '실패';
      case 'cancelled': return '취소됨';
      case 'paused': return '일시정지';
      default: return status;
    }
  };
  
  // 작업 항목 결과에 상품 정보 표시
  const renderItemResult = (item) => {
    // 작업 타입별 결과 표시
    if (job && job.type) {
      switch (job.type) {
        case 'product_price_update':
          if (item.result && item.result.data) {
            return (
              <Space direction="vertical" size="small">
                <div>
                  변경 전: <Text strong>{item.result.data.oldPrice?.toLocaleString()}원</Text>
                </div>
                <div>
                  변경 후: <Text strong type="success">{item.result.data.newPrice?.toLocaleString()}원</Text>
                </div>
              </Space>
            );
          }
          break;
          
        case 'product_stock_update':
          if (item.result && item.result.data) {
            return (
              <Space direction="vertical" size="small">
                <div>
                  변경 전: <Text strong>{item.result.data.oldStock}</Text>
                </div>
                <div>
                  변경 후: <Text strong type="success">{item.result.data.newStock}</Text>
                </div>
              </Space>
            );
          }
          break;
          
        case 'product_status_update':
          if (item.result && item.result.data) {
            return (
              <Space direction="vertical" size="small">
                <div>
                  변경 전: <Tag>{getStatusText(item.result.data.oldStatus)}</Tag>
                </div>
                <div>
                  변경 후: <Tag color="success">{getStatusText(item.result.data.newStatus)}</Tag>
                </div>
              </Space>
            );
          }
          break;
          
        case 'product_marketplace_sync':
          if (item.result && item.result.data) {
            return (
              <Space direction="vertical" size="small">
                <div>마켓: {item.result.data.marketplaceName}</div>
                {item.result.data.externalProductId && (
                  <div>상품 ID: {item.result.data.externalProductId}</div>
                )}
                <div>
                  상태: {getStatusTag(item.result.data.status)}
                </div>
              </Space>
            );
          }
          break;
          
        default:
          if (item.result && item.result.message) {
            return <div>{item.result.message}</div>;
          }
      }
    }
    
    // 기본 결과 메시지
    return item.result?.message || '-';
  };
  
  // 작업 항목 테이블 컬럼
  const itemColumns = [
    {
      title: '상품',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        record.name ? (
          <Link to={`/admin/product/${record.itemId}`}>
            <Space>
              {record.image && (
                <img 
                  src={record.image} 
                  alt={record.name}
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
              )}
              <span>{record.name}</span>
            </Space>
          </Link>
        ) : (
          <span>{record.itemId}</span>
        )
      )
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => getItemStatusTag(status, record.result)
    },
    {
      title: '결과',
      dataIndex: 'result',
      key: 'result',
      render: (result, record) => renderItemResult(record)
    },
    {
      title: '오류',
      dataIndex: 'errors',
      key: 'errors',
      width: 150,
      render: (errors) => errors && errors.length > 0 ? (
        <Tooltip title={errors.join('\n')}>
          <Tag color="error">
            {errors[0].substring(0, 20)}{errors[0].length > 20 ? '...' : ''}
          </Tag>
        </Tooltip>
      ) : null
    },
    {
      title: '처리 시간',
      dataIndex: 'processingTime',
      key: 'processingTime',
      width: 100,
      render: (time) => time ? `${(time / 1000).toFixed(2)}초` : '-'
    },
    {
      title: '마지막 처리',
      dataIndex: 'lastProcessedAt',
      key: 'lastProcessedAt',
      width: 150,
      render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '-'
    }
  ];
  
  // 로그 레벨별 아이콘
  const getLogIcon = (level) => {
    switch (level) {
      case 'info':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'debug':
        return <InfoCircleOutlined style={{ color: '#b7b7b7' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };
  
  // 로그 레벨별 색상
  const getLogColor = (level) => {
    switch (level) {
      case 'info': return 'blue';
      case 'warning': return 'orange';
      case 'error': return 'red';
      case 'debug': return 'gray';
      default: return 'blue';
    }
  };
  
  return (
    <div className="batch-job-detail-page">
      <PageHeader
        onBack={() => navigate('/admin/batch-jobs')}
        title="배치 작업 상세"
        subTitle={job?.name}
        extra={[
          <Button 
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          >
            새로고침
          </Button>
        ]}
      />
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Result
          status="error"
          title="작업 조회 오류"
          subTitle={error}
          extra={[
            <Button 
              type="primary" 
              key="back" 
              onClick={() => navigate('/admin/batch-jobs')}
            >
              목록으로 돌아가기
            </Button>
          ]}
        />
      ) : job ? (
        <>
          <Card>
            <Row gutter={16}>
              <Col xs={24} lg={16}>
                <Descriptions 
                  title={
                    <Space>
                      <Tag color={getJobTypeInfo(job.type).color}>
                        {getJobTypeInfo(job.type).text}
                      </Tag>
                      <span>{job.name}</span>
                    </Space>
                  }
                  bordered
                  column={{ xxl: 3, xl: 3, lg: 2, md: 1, sm: 1, xs: 1 }}
                >
                  <Descriptions.Item label="상태">
                    {getStatusTag(job.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="생성일">
                    {moment(job.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                  <Descriptions.Item label="생성자">
                    {job.createdBy?.name || job.createdBy}
                  </Descriptions.Item>
                  <Descriptions.Item label="시작일">
                    {job.startedAt ? moment(job.startedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="완료일">
                    {job.completedAt ? moment(job.completedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="작업 시간">
                    {job.startedAt ? (
                      (() => {
                        const start = moment(job.startedAt);
                        const end = job.completedAt ? moment(job.completedAt) : moment();
                        const duration = moment.duration(end.diff(start));
                        
                        const hours = Math.floor(duration.asHours());
                        const minutes = duration.minutes();
                        const seconds = duration.seconds();
                        
                        return `${hours}시간 ${minutes}분 ${seconds}초`;
                      })()
                    ) : '-'}
                  </Descriptions.Item>
                  
                  {job.description && (
                    <Descriptions.Item label="설명" span={3}>
                      {job.description}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Col>
              
              <Col xs={24} lg={8}>
                <Card title="작업 진행 상황" bordered={false}>
                  <Progress 
                    type="circle" 
                    percent={job.progress?.total ? Math.round((job.progress.processed / job.progress.total) * 100) : 0}
                    status={
                      job.status === 'failed' ? 'exception' :
                      job.status === 'completed' ? 'success' :
                      job.status === 'processing' ? 'active' :
                      job.status === 'cancelled' ? 'exception' :
                      'normal'
                    }
                    style={{ marginBottom: '20px' }}
                  />
                  
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="총 항목"
                        value={job.progress?.total || 0}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="처리됨"
                        value={job.progress?.processed || 0}
                        valueStyle={{ color: '#52c41a' }}
                        suffix={`/ ${job.progress?.total || 0}`}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="성공"
                        value={job.progress?.succeeded || 0}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="실패"
                        value={job.progress?.failed || 0}
                        valueStyle={{ color: '#ff4d4f' }}
                      />
                    </Col>
                  </Row>
                  
                  <Divider />
                  
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {errorStatusUpdate && (
                      <Alert 
                        message="상태 변경 오류" 
                        description={errorStatusUpdate}
                        type="error" 
                        showIcon
                        style={{ marginBottom: '10px' }} 
                      />
                    )}
                    
                    {/* 작업 상태별 사용 가능한 액션 버튼 */}
                    {job.status === 'pending' && (
                      <Button 
                        block 
                        type="primary" 
                        icon={<PlayCircleOutlined />}
                        onClick={() => handleStatusUpdate('processing')}
                        loading={loadingStatusUpdate}
                      >
                        작업 시작
                      </Button>
                    )}
                    
                    {job.status === 'processing' && (
                      <Space style={{ width: '100%' }}>
                        <Button 
                          style={{ flex: 1 }}
                          icon={<PauseCircleOutlined />}
                          onClick={() => handleStatusUpdate('paused')}
                          loading={loadingStatusUpdate}
                        >
                          일시정지
                        </Button>
                        <Button 
                          danger
                          style={{ flex: 1 }}
                          icon={<StopOutlined />}
                          onClick={() => handleStatusUpdate('cancelled')}
                          loading={loadingStatusUpdate}
                        >
                          취소
                        </Button>
                      </Space>
                    )}
                    
                    {job.status === 'paused' && (
                      <Space style={{ width: '100%' }}>
                        <Button 
                          type="primary"
                          style={{ flex: 1 }}
                          icon={<PlayCircleOutlined />}
                          onClick={() => handleStatusUpdate('processing')}
                          loading={loadingStatusUpdate}
                        >
                          재개
                        </Button>
                        <Button 
                          danger
                          style={{ flex: 1 }}
                          icon={<StopOutlined />}
                          onClick={() => handleStatusUpdate('cancelled')}
                          loading={loadingStatusUpdate}
                        >
                          취소
                        </Button>
                      </Space>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
          
          <Tabs 
            defaultActiveKey="overview" 
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginTop: '20px' }}
          >
            <TabPane tab="항목 목록" key="items">
              <Card>
                <div style={{ marginBottom: '16px' }}>
                  <Space>
                    <Select
                      placeholder="상태 필터"
                      style={{ width: '150px' }}
                      value={itemsStatus}
                      onChange={(value) => setItemsStatus(value)}
                      allowClear
                    >
                      <Option value="pending">대기 중</Option>
                      <Option value="processing">처리 중</Option>
                      <Option value="completed">완료됨</Option>
                      <Option value="failed">실패</Option>
                    </Select>
                    
                    <Button 
                      type="primary" 
                      ghost
                      onClick={() => {
                        setItemsPage(1);
                        fetchJobItems();
                      }}
                    >
                      필터 적용
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        setItemsStatus('');
                        setItemsPage(1);
                        fetchJobItems();
                      }}
                    >
                      초기화
                    </Button>
                  </Space>
                </div>
                
                {loadingItems ? (
                  <Loader />
                ) : errorItems ? (
                  <Alert message={errorItems} type="error" showIcon />
                ) : (
                  <Table
                    columns={itemColumns}
                    dataSource={items || []}
                    rowKey="_id"
                    pagination={{
                      current: itemsCurrentPage,
                      pageSize: itemsPageSize,
                      total: itemsTotal,
                      onChange: (page, pageSize) => {
                        setItemsPage(page);
                        setItemsPageSize(pageSize);
                      },
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `총 ${total}개 항목`
                    }}
                    scroll={{ x: 'max-content' }}
                  />
                )}
              </Card>
            </TabPane>
            
            <TabPane tab="작업 로그" key="logs">
              <Card>
                {loadingLogs ? (
                  <Loader />
                ) : errorLogs ? (
                  <Alert message={errorLogs} type="error" showIcon />
                ) : logs && logs.length > 0 ? (
                  <Timeline mode="left">
                    {logs.map((log, index) => (
                      <Timeline.Item 
                        key={index}
                        color={getLogColor(log.level)}
                        dot={getLogIcon(log.level)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>{log.message}</div>
                          <div style={{ color: '#999', minWidth: '150px', textAlign: 'right' }}>
                            {moment(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                          </div>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px' }}>
                    <p>작업 로그가 없습니다</p>
                  </div>
                )}
              </Card>
            </TabPane>
            
            <TabPane tab="작업 파라미터" key="params">
              <Card>
                <Descriptions 
                  title="작업 파라미터" 
                  bordered
                  column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                >
                  {job.params && Object.entries(job.params).map(([key, value]) => {
                    // 배열 값을 문자열로 변환
                    let displayValue = value;
                    
                    if (Array.isArray(value)) {
                      displayValue = `[${value.length}개 항목]`;
                    } else if (typeof value === 'object' && value !== null) {
                      displayValue = JSON.stringify(value);
                    }
                    
                    return (
                      <Descriptions.Item key={key} label={key}>
                        {displayValue}
                      </Descriptions.Item>
                    );
                  })}
                  
                  {(!job.params || Object.keys(job.params).length === 0) && (
                    <Descriptions.Item span={2}>
                      파라미터 없음
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </TabPane>
          </Tabs>
        </>
      ) : (
        <Result
          status="info"
          title="작업 정보 없음"
          subTitle="요청한 배치 작업 정보를 찾을 수 없습니다"
          extra={[
            <Button 
              type="primary" 
              key="back" 
              onClick={() => navigate('/admin/batch-jobs')}
            >
              목록으로 돌아가기
            </Button>
          ]}
        />
      )}
    </div>
  );
};

export default BatchJobDetailPage;