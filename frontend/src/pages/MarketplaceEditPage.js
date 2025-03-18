// src/pages/MarketplaceEditPage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Form, Input, Button, Card, Switch, Upload, Tabs,
  Select, Alert, Space, PageHeader, Divider, Typography,
  Table, Row, Col, Modal, message
} from 'antd';
import { 
  UploadOutlined, SaveOutlined, PlusOutlined, 
  DeleteOutlined, KeyOutlined
} from '@ant-design/icons';
import { 
  getMarketplaceDetails, 
  createMarketplace, 
  updateMarketplace,
  addMarketplaceAccount,
  updateMarketplaceAccount,
  deleteMarketplaceAccount
} from '../actions/marketplaceActions';
import { 
  MARKETPLACE_CREATE_RESET,
  MARKETPLACE_UPDATE_RESET,
  MARKETPLACE_ACCOUNT_CREATE_RESET,
  MARKETPLACE_ACCOUNT_UPDATE_RESET,
  MARKETPLACE_ACCOUNT_DELETE_RESET
} from '../constants/marketplaceConstants';
import Loader from '../components/common/Loader';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const MarketplaceEditPage = ({ match, history }) => {
  const marketplaceId = match.params.id;
  const isEditMode = Boolean(marketplaceId);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [accountForm] = Form.useForm();
  
  // 로컬 상태
  const [fileList, setFileList] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  
  // Redux 상태
  const marketplaceDetails = useSelector(state => state.marketplaceDetails);
  const { loading, error, marketplace } = marketplaceDetails;
  
  const marketplaceCreate = useSelector(state => state.marketplaceCreate);
  const { 
    loading: loadingCreate, 
    success: successCreate, 
    error: errorCreate 
  } = marketplaceCreate;
  
  const marketplaceUpdate = useSelector(state => state.marketplaceUpdate);
  const { 
    loading: loadingUpdate, 
    success: successUpdate, 
    error: errorUpdate 
  } = marketplaceUpdate;
  
  const marketplaceAccountCreate = useSelector(state => state.marketplaceAccountCreate);
  const {
    loading: loadingAccountCreate,
    success: successAccountCreate,
    error: errorAccountCreate
  } = marketplaceAccountCreate;
  
  const marketplaceAccountUpdate = useSelector(state => state.marketplaceAccountUpdate);
  const {
    loading: loadingAccountUpdate,
    success: successAccountUpdate,
    error: errorAccountUpdate
  } = marketplaceAccountUpdate;
  
  const marketplaceAccountDelete = useSelector(state => state.marketplaceAccountDelete);
  const {
    loading: loadingAccountDelete,
    success: successAccountDelete,
    error: errorAccountDelete
  } = marketplaceAccountDelete;
  
  // 페이지 로드 시 마켓플레이스 정보 조회
  useEffect(() => {
    if (isEditMode) {
      dispatch(getMarketplaceDetails(marketplaceId));
    } else {
      dispatch({ type: MARKETPLACE_CREATE_RESET });
    }
    
    return () => {
      // 컴포넌트 언마운트 시 리셋
      dispatch({ type: MARKETPLACE_CREATE_RESET });
      dispatch({ type: MARKETPLACE_UPDATE_RESET });
      dispatch({ type: MARKETPLACE_ACCOUNT_CREATE_RESET });
      dispatch({ type: MARKETPLACE_ACCOUNT_UPDATE_RESET });
      dispatch({ type: MARKETPLACE_ACCOUNT_DELETE_RESET });
    };
  }, [dispatch, marketplaceId, isEditMode]);
  
  // 마켓플레이스 정보 로드 시 폼 설정
  useEffect(() => {
    if (isEditMode && marketplace && marketplace._id === marketplaceId) {
      form.setFieldsValue({
        name: marketplace.name,
        code: marketplace.code,
        type: marketplace.type,
        description: marketplace.description,
        apiBaseUrl: marketplace.apiBaseUrl,
        isActive: marketplace.isActive ?? true
      });
      
      // 로고 이미지 설정
      if (marketplace.logo) {
        setFileList([
          {
            uid: '-1',
            name: 'marketplace-logo',
            status: 'done',
            url: marketplace.logo
          }
        ]);
      }
    }
  }, [form, marketplace, marketplaceId, isEditMode]);
  
  // 계정 관련 작업 성공 시 처리
  useEffect(() => {
    if (successAccountCreate || successAccountUpdate || successAccountDelete) {
      // 계정 관련 리덕스 상태 초기화
      dispatch({ type: MARKETPLACE_ACCOUNT_CREATE_RESET });
      dispatch({ type: MARKETPLACE_ACCOUNT_UPDATE_RESET });
      dispatch({ type: MARKETPLACE_ACCOUNT_DELETE_RESET });
      
      // 모달 닫기 및 상태 초기화
      setAccountModalVisible(false);
      setEditingAccount(null);
      accountForm.resetFields();
      
      // 마켓플레이스 정보 다시 로드
      dispatch(getMarketplaceDetails(marketplaceId));
      
      // 성공 메시지
      if (successAccountCreate) {
        message.success('계정이 추가되었습니다');
      } else if (successAccountUpdate) {
        message.success('계정이 수정되었습니다');
      } else if (successAccountDelete) {
        message.success('계정이 삭제되었습니다');
      }
    }
  }, [
    dispatch, marketplaceId, accountForm,
    successAccountCreate, successAccountUpdate, successAccountDelete
  ]);
  
  // 생성/수정 성공 시 리디렉션
  useEffect(() => {
    if (successCreate || successUpdate) {
      message.success(
        isEditMode 
          ? '마켓플레이스가 성공적으로 수정되었습니다' 
          : '마켓플레이스가 성공적으로 등록되었습니다'
      );
      history.push('/admin/marketplaces');
    }
  }, [successCreate, successUpdate, history, isEditMode]);
  
  // 로고 업로드 처리
  const handleLogoUpload = info => {
    let fileList = [...info.fileList];
    
    // 최대 1개 파일만 허용
    fileList = fileList.slice(-1);
    
    // 업로드 상태 설정
    fileList = fileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    
    setFileList(fileList);
  };
  
  // 마켓플레이스 폼 제출 처리
  const handleSubmit = values => {
    // FormData 준비
    const formData = new FormData();
    
    // 폼 필드 추가
    Object.keys(values).forEach(key => {
      if (values[key] !== undefined && values[key] !== null) {
        formData.append(key, values[key]);
      }
    });
    
    // 로고 파일 추가
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('logo', fileList[0].originFileObj);
    }
    
    // API 요청
    if (isEditMode) {
      dispatch(updateMarketplace(marketplaceId, formData));
    } else {
      dispatch(createMarketplace(formData));
    }
  };
  
  // 계정 추가/수정 모달 표시
  const showAccountModal = (account = null) => {
    setEditingAccount(account);
    
    if (account) {
      accountForm.setFieldsValue({
        name: account.name,
        apiKey: account.apiKey || '',
        apiSecret: account.apiSecret || '',
        accessToken: account.accessToken || '',
        refreshToken: account.refreshToken || '',
        sellerId: account.sellerId || '',
        isActive: account.isActive ?? true,
        isDefault: account.isDefault ?? false
      });
    } else {
      accountForm.resetFields();
      accountForm.setFieldsValue({
        isActive: true,
        isDefault: false
      });
    }
    
    setAccountModalVisible(true);
  };
  
  // 계정 폼 제출 처리
  const handleAccountSubmit = values => {
    if (editingAccount) {
      // 계정 수정
      dispatch(updateMarketplaceAccount(
        marketplaceId, 
        editingAccount._id, 
        values
      ));
    } else {
      // 계정 추가
      dispatch(addMarketplaceAccount(marketplaceId, values));
    }
  };
  
  // 계정 삭제 처리
  const handleDeleteAccount = accountId => {
    Modal.confirm({
      title: '계정 삭제',
      content: '이 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk() {
        dispatch(deleteMarketplaceAccount(marketplaceId, accountId));
      }
    });
  };
  
  // 계정 테이블 컬럼
  const accountColumns = [
    {
      title: '계정명',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '판매자 ID',
      dataIndex: 'sellerId',
      key: 'sellerId',
      render: text => text || '-'
    },
    {
      title: '기본 계정',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 100,
      render: isDefault => isDefault ? <Tag color="blue">기본</Tag> : '-'
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: isActive => (
        isActive ? 
          <Tag color="success">활성</Tag> : 
          <Tag color="error">비활성</Tag>
      )
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
            onClick={() => showAccountModal(record)}
          >
            수정
          </Button>
          
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAccount(record._id)}
          >
            삭제
          </Button>
        </Space>
      )
    }
  ];
  
  return (
    <div className="marketplace-edit-page">
      <PageHeader
        onBack={() => history.push('/admin/marketplaces')}
        title={isEditMode ? '마켓플레이스 수정' : '마켓플레이스 추가'}
        subTitle={isEditMode ? marketplace?.name : '새 마켓플레이스 정보 입력'}
      />
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="기본 정보" key="1">
          <Card>
            {(loadingCreate || loadingUpdate) && <Loader />}
            {error && <Alert message={error} type="error" showIcon style={{marginBottom: '15px'}} />}
            {errorCreate && <Alert message={errorCreate} type="error" showIcon style={{marginBottom: '15px'}} />}
            {errorUpdate && <Alert message={errorUpdate} type="error" showIcon style={{marginBottom: '15px'}} />}
            
            {loading ? (
              <Loader />
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  isActive: true,
                  type: 'openmarket'
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="name"
                      label="마켓플레이스 이름"
                      rules={[{ required: true, message: '마켓플레이스 이름을 입력해주세요' }]}
                    >
                      <Input placeholder="마켓플레이스 이름" />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="code"
                      label="마켓플레이스 코드"
                      rules={[{ required: true, message: '코드를 입력해주세요' }]}
                    >
                      <Input placeholder="마켓플레이스 코드 (영문, 소문자, 숫자, 하이픈만 허용)" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="type"
                      label="마켓플레이스 유형"
                      rules={[{ required: true, message: '유형을 선택해주세요' }]}
                    >
                      <Select placeholder="유형 선택">
                        <Option value="openmarket">오픈마켓</Option>
                        <Option value="socialcommerce">소셜커머스</Option>
                        <Option value="mall">종합몰</Option>
                        <Option value="other">기타</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="isActive"
                      label="활성화 상태"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item
                  name="description"
                  label="설명"
                >
                  <TextArea rows={4} placeholder="마켓플레이스 설명 (선택사항)" />
                </Form.Item>
                
                <Form.Item
                  name="apiBaseUrl"
                  label="API 기본 URL"
                >
                  <Input placeholder="API 기본 URL (예: https://api.example.com)" />
                </Form.Item>
                
                <Form.Item
                  label="마켓플레이스 로고"
                >
                  <Upload
                    name="logo"
                    listType="picture"
                    fileList={fileList}
                    onChange={handleLogoUpload}
                    beforeUpload={() => false} // 자동 업로드 방지
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>로고 업로드</Button>
                  </Upload>
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    loading={loadingCreate || loadingUpdate}
                  >
                    {isEditMode ? '마켓플레이스 수정' : '마켓플레이스 추가'}
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Card>
        </TabPane>
        
        {isEditMode && (
          <TabPane tab="계정 관리" key="2">
            <Card>
              {errorAccountCreate && <Alert message={errorAccountCreate} type="error" showIcon style={{marginBottom: '15px'}} />}
              {errorAccountUpdate && <Alert message={errorAccountUpdate} type="error" showIcon style={{marginBottom: '15px'}} />}
              {errorAccountDelete && <Alert message={errorAccountDelete} type="error" showIcon style={{marginBottom: '15px'}} />}
              
              <div style={{ marginBottom: '16px' }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showAccountModal()}
                >
                  계정 추가
                </Button>
              </div>
              
              {loading ? (
                <Loader />
              ) : (
                <Table
                  columns={accountColumns}
                  dataSource={marketplace?.accounts || []}
                  rowKey="_id"
                  pagination={false}
                />
              )}
              
              {/* 계정 추가/수정 모달 */}
              <Modal
                title={editingAccount ? '계정 수정' : '계정 추가'}
                visible={accountModalVisible}
                onCancel={() => {
                  setAccountModalVisible(false);
                  setEditingAccount(null);
                }}
                footer={null}
                destroyOnClose
              >
                <Form
                  form={accountForm}
                  layout="vertical"
                  onFinish={handleAccountSubmit}
                  initialValues={{
                    isActive: true,
                    isDefault: false
                  }}
                >
                  <Form.Item
                    name="name"
                    label="계정명"
                    rules={[{ required: true, message: '계정명을 입력해주세요' }]}
                  >
                    <Input placeholder="계정명" />
                  </Form.Item>
                  
                  <Form.Item
                    name="sellerId"
                    label="판매자 ID"
                  >
                    <Input placeholder="판매자 ID (선택사항)" />
                  </Form.Item>
                  
                  <Divider>API 인증 정보</Divider>
                  
                  <Form.Item
                    name="apiKey"
                    label="API 키"
                  >
                    <Input.Password
                      placeholder="API 키"
                      iconRender={visible => (visible ? <KeyOutlined /> : <KeyOutlined />)}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="apiSecret"
                    label="API 시크릿"
                  >
                    <Input.Password
                      placeholder="API 시크릿"
                      iconRender={visible => (visible ? <KeyOutlined /> : <KeyOutlined />)}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="accessToken"
                    label="액세스 토큰"
                  >
                    <Input.Password
                      placeholder="액세스 토큰"
                      iconRender={visible => (visible ? <KeyOutlined /> : <KeyOutlined />)}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="refreshToken"
                    label="리프레시 토큰"
                  >
                    <Input.Password
                      placeholder="리프레시 토큰"
                      iconRender={visible => (visible ? <KeyOutlined /> : <KeyOutlined />)}
                    />
                  </Form.Item>
                  
                  <Divider>설정</Divider>
                  
                  <Form.Item
                    name="isActive"
                    label="활성화 상태"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    name="isDefault"
                    label="기본 계정으로 설정"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item>
                    <Space>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loadingAccountCreate || loadingAccountUpdate}
                      >
                        {editingAccount ? '수정' : '추가'}
                      </Button>
                      <Button 
                        onClick={() => {
                          setAccountModalVisible(false);
                          setEditingAccount(null);
                        }}
                      >
                        취소
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Modal>
            </Card>
          </TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default MarketplaceEditPage;