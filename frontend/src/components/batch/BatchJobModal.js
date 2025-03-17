// src/components/batch/BatchJobModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Modal, Form, Input, Select, InputNumber, Radio, 
  Switch, Tabs, Alert, Divider, Checkbox, Button, 
  Spin, Typography, Row, Col, Space
} from 'antd';
import { 
  InfoCircleOutlined, DatabaseOutlined, 
  DollarOutlined, PercentageOutlined,
  SyncOutlined, TagOutlined, DeleteOutlined 
} from '@ant-design/icons';
import { createBatchJob } from '../../actions/batchJobActions';
import { listMarketplaces } from '../../actions/marketplaceActions';
import { BATCH_JOB_CREATE_RESET } from '../../constants/batchJobConstants';

const { TabPane } = Tabs;
const { Text } = Typography;
const { Option } = Select;

const BatchJobModal = ({ visible, onCancel, selectedProducts = [], refreshProducts }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  
  // 모달 상태
  const [jobType, setJobType] = useState('product_price_update');
  const [actionType, setActionType] = useState('set');
  const [usePercentage, setUsePercentage] = useState(false);
  const [startImmediately, setStartImmediately] = useState(true);
  
  // Redux 상태
  const marketplaceList = useSelector(state => state.marketplaceList);
  const { marketplaces } = marketplaceList;
  
  const batchJobCreate = useSelector(state => state.batchJobCreate);
  const { loading, success, error, job } = batchJobCreate;
  
  // 페이지 로드 시 마켓플레이스 목록 조회
  useEffect(() => {
    dispatch(listMarketplaces({ active: true }));
  }, [dispatch]);
  
  // 작업 생성 성공 시 모달 닫기
  useEffect(() => {
    if (success) {
      // 작업 생성 상태 초기화
      dispatch({ type: BATCH_JOB_CREATE_RESET });
      
      // 모달 초기화 및 닫기
      resetForm();
      onCancel();
      
      // 상품 목록 갱신 (필요한 경우)
      if (refreshProducts) {
        refreshProducts();
      }
    }
  }, [success, dispatch, onCancel, refreshProducts]);
  
  // 폼 초기화 함수
  const resetForm = () => {
    form.resetFields();
    setJobType('product_price_update');
    setActionType('set');
    setUsePercentage(false);
    setStartImmediately(true);
  };
  
  // 작업 생성 처리
  const handleSubmit = async (values) => {
    // 선택된 상품 확인
    if (selectedProducts.length === 0) {
      Modal.error({
        title: '선택된 상품 없음',
        content: '하나 이상의 상품을 선택해주세요.'
      });
      return;
    }
    
    // 작업 타입별 파라미터 구성
    let params = {};
    
    switch (jobType) {
      case 'product_price_update':
        params = {
          priceType: values.priceType,
          action: actionType,
          value: actionType !== 'set' && usePercentage ? 0 : values.priceValue,
          percentValue: actionType !== 'set' && usePercentage ? values.percentValue : 0
        };
        break;
        
      case 'product_stock_update':
        params = {
          action: actionType,
          value: actionType !== 'set' && usePercentage ? 0 : values.stockValue,
          percentValue: actionType !== 'set' && usePercentage ? values.percentValue : 0
        };
        break;
        
      case 'product_status_update':
        params = {
          status: values.status
        };
        break;
        
      case 'product_marketplace_sync':
        params = {
          marketplaceId: values.marketplaceId,
          accountId: values.accountId
        };
        break;
        
      case 'product_category_update':
        params = {
          categoryIds: values.categoryIds,
          action: values.categoryAction || 'replace'
        };
        break;
        
      case 'product_delete':
        // 추가 파라미터 없음
        break;
    }
    
    // 작업 이름 자동 생성 (직접 입력한 경우 사용자 입력값 사용)
    let jobName = values.name;
    if (!jobName) {
      // 작업 타입별 기본 이름 구성
      switch (jobType) {
        case 'product_price_update':
          jobName = `${values.priceType === 'regularPrice' ? '정상가' : '판매가'} ${getActionText(actionType, usePercentage)} (${selectedProducts.length}개 상품)`;
          break;
          
        case 'product_stock_update':
          jobName = `재고 ${getActionText(actionType, usePercentage)} (${selectedProducts.length}개 상품)`;
          break;
          
        case 'product_status_update':
          jobName = `상태 ${getStatusText(values.status)}(으)로 변경 (${selectedProducts.length}개 상품)`;
          break;
          
        case 'product_marketplace_sync':
          const marketplace = marketplaces.find(m => m._id === values.marketplaceId);
          jobName = `${marketplace ? marketplace.name : '마켓플레이스'} 연동 (${selectedProducts.length}개 상품)`;
          break;
          
        case 'product_category_update':
          jobName = `카테고리 ${values.categoryAction === 'add' ? '추가' : values.categoryAction === 'remove' ? '제거' : '변경'} (${selectedProducts.length}개 상품)`;
          break;
          
        case 'product_delete':
          jobName = `상품 일괄 삭제 (${selectedProducts.length}개 상품)`;
          break;
      }
    }
    
    // 배치 작업 생성 요청 파라미터
    const jobData = {
      name: jobName,
      type: jobType,
      description: values.description,
      params: {
        ...params,
        productIds: selectedProducts
      },
      startImmediately
    };
    
    try {
      // 삭제 작업인 경우 확인 프롬프트 표시
      if (jobType === 'product_delete') {
        Modal.confirm({
          title: '상품 일괄 삭제',
          content: `선택한 ${selectedProducts.length}개 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
          okText: '삭제',
          okType: 'danger',
          cancelText: '취소',
          onOk: () => {
            dispatch(createBatchJob(jobData));
          }
        });
      } else {
        // 삭제 외 다른 작업은 바로 실행
        dispatch(createBatchJob(jobData));
      }
    } catch (error) {
      console.error('배치 작업 생성 오류:', error);
    }
  };
  
  // 작업 유형 변경 처리
  const handleJobTypeChange = (type) => {
    setJobType(type);
    
    // 작업 유형별 기본 액션 설정
    switch (type) {
      case 'product_price_update':
      case 'product_stock_update':
        setActionType('set');
        break;
      case 'product_category_update':
        form.setFieldsValue({ categoryAction: 'replace' });
        break;
    }
    
    // 퍼센트 옵션 초기화
    setUsePercentage(false);
  };
  
  // 액션 이름 반환 함수
  const getActionText = (action, isPercent) => {
    switch (action) {
      case 'set': return '직접 설정';
      case 'increase': return isPercent ? '% 증가' : '증가';
      case 'decrease': return isPercent ? '% 감소' : '감소';
      default: return action;
    }
  };
  
  // 상태 이름 반환 함수
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '판매 중';
      case 'inactive': return '판매 중지';
      case 'draft': return '임시 저장';
      case 'out_of_stock': return '품절';
      default: return status;
    }
  };
  
  return (
    <Modal
      title="배치 작업 생성"
      visible={visible}
      onCancel={onCancel}
      width={720}
      footer={null}
      destroyOnClose
    >
      {error && (
        <Alert
          message="배치 작업 생성 오류"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          priceType: 'regularPrice',
          action: 'set',
          status: 'active',
          categoryAction: 'replace'
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Text strong>선택된 상품 수: {selectedProducts.length}개</Text>
        </div>
        
        <Tabs activeKey={jobType} onChange={handleJobTypeChange}>
          <TabPane 
            tab={<span><DollarOutlined /> 가격 수정</span>} 
            key="product_price_update"
          >
            <Form.Item label="가격 유형" name="priceType">
              <Radio.Group>
                <Radio value="regularPrice">정상가</Radio>
                <Radio value="salePrice">판매가</Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item label="변경 방식">
              <Radio.Group value={actionType} onChange={e => setActionType(e.target.value)}>
                <Radio value="set">직접 설정</Radio>
                <Radio value="increase">증가</Radio>
                <Radio value="decrease">감소</Radio>
              </Radio.Group>
            </Form.Item>
            
            {actionType !== 'set' && (
              <Form.Item label="변경 단위">
                <Radio.Group value={usePercentage} onChange={e => setUsePercentage(e.target.value)}>
                  <Radio value={false}>고정 금액</Radio>
                  <Radio value={true}>퍼센트 (%)</Radio>
                </Radio.Group>
              </Form.Item>
            )}
            
            {actionType === 'set' && (
              <Form.Item 
                name="priceValue" 
                label="가격 설정" 
                rules={[{ required: true, message: '가격을 입력해주세요' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="설정할 가격"
                />
              </Form.Item>
            )}
            
            {actionType !== 'set' && !usePercentage && (
              <Form.Item 
                name="priceValue" 
                label={`${actionType === 'increase' ? '증가' : '감소'}할 금액`} 
                rules={[{ required: true, message: '금액을 입력해주세요' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder={`${actionType === 'increase' ? '증가' : '감소'}할 금액`}
                />
              </Form.Item>
            )}
            
            {actionType !== 'set' && usePercentage && (
              <Form.Item 
                name="percentValue" 
                label={`${actionType === 'increase' ? '증가' : '감소'} 비율 (%)`} 
                rules={[{ required: true, message: '비율을 입력해주세요' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                  placeholder={`${actionType === 'increase' ? '증가' : '감소'} 비율`}
                />
              </Form.Item>
            )}
          </TabPane>
          
          <TabPane 
            tab={<span><DatabaseOutlined /> 재고 수정</span>} 
            key="product_stock_update"
          >
            <Form.Item label="변경 방식">
              <Radio.Group value={actionType} onChange={e => setActionType(e.target.value)}>
                <Radio value="set">직접 설정</Radio>
                <Radio value="increase">증가</Radio>
                <Radio value="decrease">감소</Radio>
              </Radio.Group>
            </Form.Item>
            
            {actionType !== 'set' && (
              <Form.Item label="변경 단위">
                <Radio.Group value={usePercentage} onChange={e => setUsePercentage(e.target.value)}>
                  <Radio value={false}>고정 수량</Radio>
                  <Radio value={true}>퍼센트 (%)</Radio>
                </Radio.Group>
              </Form.Item>
            )}
            
            {actionType === 'set' && (
              <Form.Item 
                name="stockValue" 
                label="재고 설정" 
                rules={[{ required: true, message: '재고를 입력해주세요' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  placeholder="설정할 재고"
                />
              </Form.Item>
            )}
            
            {actionType !== 'set' && !usePercentage && (
              <Form.Item 
                name="stockValue" 
                label={`${actionType === 'increase' ? '증가' : '감소'}할 수량`} 
                rules={[{ required: true, message: '수량을 입력해주세요' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  placeholder={`${actionType === 'increase' ? '증가' : '감소'}할 수량`}
                />
              </Form.Item>
            )}
            
            {actionType !== 'set' && usePercentage && (
              <Form.Item 
                name="percentValue" 
                label={`${actionType === 'increase' ? '증가' : '감소'} 비율 (%)`} 
                rules={[{ required: true, message: '비율을 입력해주세요' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                  placeholder={`${actionType === 'increase' ? '증가' : '감소'} 비율`}
                />
              </Form.Item>
            )}
          </TabPane>
          
          <TabPane 
            tab={<span><TagOutlined /> 상태 변경</span>} 
            key="product_status_update"
          >
            <Form.Item
              name="status"
              label="변경할 상태"
              rules={[{ required: true, message: '상태를 선택해주세요' }]}
            >
              <Select placeholder="상태 선택">
                <Option value="active">판매 중</Option>
                <Option value="inactive">판매 중지</Option>
                <Option value="draft">임시 저장</Option>
                <Option value="out_of_stock">품절</Option>
              </Select>
            </Form.Item>
          </TabPane>
          
          <TabPane 
            tab={<span><SyncOutlined /> 마켓 연동</span>} 
            key="product_marketplace_sync"
          >
            <Form.Item
              name="marketplaceId"
              label="마켓플레이스"
              rules={[{ required: true, message: '마켓플레이스를 선택해주세요' }]}
            >
              <Select placeholder="마켓플레이스 선택">
                {marketplaces?.map(marketplace => (
                  <Option key={marketplace._id} value={marketplace._id}>
                    {marketplace.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="accountId"
              label="계정"
              dependencies={['marketplaceId']}
              rules={[{ required: true, message: '계정을 선택해주세요' }]}
            >
              <Select placeholder="계정 선택">
                {form.getFieldValue('marketplaceId') && marketplaces
                  .find(m => m._id === form.getFieldValue('marketplaceId'))
                  ?.accounts
                  .filter(acc => acc.isActive)
                  .map(account => (
                    <Option key={account._id} value={account._id}>
                      {account.name}{account.isDefault ? ' (기본)' : ''}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </TabPane>
          
          <TabPane 
            tab={<span><DeleteOutlined /> 삭제</span>} 
            key="product_delete"
          >
            <Alert
              message="주의: 이 작업은 되돌릴 수 없습니다"
              description="선택한 상품들이 영구적으로 삭제됩니다. 삭제 전에 충분히 검토해주세요."
              type="warning"
              showIcon
            />
          </TabPane>
        </Tabs>
        
        <Divider />
        
        <Form.Item name="name" label="작업 이름">
          <Input placeholder="작업 이름 (미입력 시 자동 생성)" />
        </Form.Item>
        
        <Form.Item name="description" label="작업 설명">
          <Input.TextArea 
            placeholder="작업에 대한 설명 (선택 사항)" 
            rows={2}
          />
        </Form.Item>
        
        <Form.Item>
          <Checkbox 
            checked={startImmediately} 
            onChange={e => setStartImmediately(e.target.checked)}
          >
            작업 생성 후 즉시 시작
          </Checkbox>
        </Form.Item>
        
        <Form.Item>
          <Row gutter={16} justify="end">
            <Col>
              <Button onClick={onCancel}>취소</Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                disabled={selectedProducts.length === 0}
              >
                작업 생성
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BatchJobModal;