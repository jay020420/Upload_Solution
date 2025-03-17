// src/components/products/BulkUploadModal.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Modal, Upload, Button, Steps, Alert, 
  Progress, Typography, Table, Space 
} from 'antd';
import { 
  InboxOutlined, 
  FileExcelOutlined, 
  CheckCircleOutlined, 
  WarningOutlined 
} from '@ant-design/icons';
import { bulkUploadProducts } from '../../actions/productActions';

const { Dragger } = Upload;
const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;

const BulkUploadModal = ({ visible, onCancel }) => {
  const dispatch = useDispatch();
  
  // Redux 상태
  const productBulkUpload = useSelector(state => state.productBulkUpload);
  const { loading, success, error, result } = productBulkUpload;
  
  // 로컬 상태
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // 파일 업로드 설정
  const uploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    accept: '.xlsx,.xls,.csv',
    beforeUpload: file => {
      setUploadFile(file);
      return false; // 자동 업로드 방지
    },
    onRemove: () => {
      setUploadFile(null);
    },
    fileList: uploadFile ? [uploadFile] : []
  };
  
  // 업로드 진행 시뮬레이션 (실제 구현에서는 서버의 진행률을 받아야 함)
  const simulateProgress = () => {
    let progress = 0;
    const timer = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(timer);
      }
      setUploadProgress(progress);
    }, 200);
    
    return timer;
  };
  
  // 업로드 처리
  const handleUpload = async () => {
    if (!uploadFile) return;
    
    setCurrentStep(1);
    const progressTimer = simulateProgress();
    
    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      // 대량 업로드 액션 디스패치
      await dispatch(bulkUploadProducts(formData));
      
      clearInterval(progressTimer);
      setUploadProgress(100);
      setCurrentStep(2);
    } catch (error) {
      clearInterval(progressTimer);
      
      // 유효성 검사 오류 파싱 (실제 구현에서는 서버 응답 형식에 맞게 조정)
      if (error.response && error.response.data) {
        if (error.response.data.validationErrors) {
          setValidationErrors(error.response.data.validationErrors);
        }
      }
      
      setCurrentStep(3);
    }
  };
  
  // 모달 닫기 처리
  const handleClose = () => {
    setCurrentStep(0);
    setUploadFile(null);
    setUploadProgress(0);
    setValidationErrors([]);
    onCancel();
  };
  
  // 다운로드 템플릿 버튼 클릭 처리
  const handleDownloadTemplate = () => {
    // 템플릿 다운로드 링크 (실제 구현에서는 서버 경로로 설정)
    const templateUrl = '/templates/product_upload_template.xlsx';
    
    // 링크 생성 및 클릭
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = 'product_upload_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Modal
      title="대량 상품 업로드"
      visible={visible}
      onCancel={handleClose}
      width={800}
      footer={[
        <Button key="close" onClick={handleClose}>
          닫기
        </Button>,
        currentStep === 0 && (
          <Button 
            key="upload" 
            type="primary" 
            disabled={!uploadFile} 
            onClick={handleUpload}
          >
            업로드 시작
          </Button>
        ),
        currentStep === 2 && (
          <Button 
            key="continue" 
            type="primary" 
            onClick={handleClose}
          >
            완료
          </Button>
        )
      ]}
    >
      <Steps current={currentStep} style={{ marginBottom: '20px' }}>
        <Step title="파일 선택" description="엑셀/CSV 파일 선택" />
        <Step title="처리 중" description="데이터 분석 및 처리" />
        <Step title="완료" description="업로드 결과 확인" />
      </Steps>
      
      {currentStep === 0 && (
        <>
          <Alert
            message="상품 대량 업로드 안내"
            description="Excel 또는 CSV 형식의 파일로 상품을 일괄 등록할 수 있습니다. 템플릿을 다운로드 받아 양식에 맞게 작성 후 업로드해 주세요."
            type="info"
            showIcon
            style={{ marginBottom: '15px' }}
          />
          
          <Button 
            type="link" 
            icon={<FileExcelOutlined />} 
            onClick={handleDownloadTemplate}
            style={{ marginBottom: '15px' }}
          >
            템플릿 다운로드
          </Button>
          
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              이 영역을 클릭하거나 파일을 끌어다 놓으세요
            </p>
            <p className="ant-upload-hint">
              XLSX, XLS, CSV 형식만 지원합니다. (최대 10MB)
            </p>
          </Dragger>
        </>
      )}
      
      {currentStep === 1 && (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <Progress type="circle" percent={uploadProgress} />
          <div style={{ marginTop: '20px' }}>
            <Title level={4}>파일 처리 중입니다</Title>
            <Paragraph>상품 데이터를 분석하고 시스템에 등록하는 중입니다.</Paragraph>
            <Paragraph>이 과정은 파일 크기에 따라 수 분이 소요될 수 있습니다.</Paragraph>
          </div>
        </div>
      )}
      
      {currentStep === 2 && (
        <div style={{ padding: '10px 0' }}>
          <Alert
            message="업로드 완료"
            description={`${result?.count || 0}개의 상품이 성공적으로 등록되었습니다.`}
            type="success"
            showIcon
            style={{ marginBottom: '20px' }}
          />
          
          <Table
            dataSource={result?.products || []}
            columns={[
              {
                title: '상품명',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: '상태',
                dataIndex: 'status',
                key: 'status',
                render: status => {
                  const statusMap = {
                    draft: '임시저장',
                    active: '판매중',
                    inactive: '판매중지',
                    out_of_stock: '품절'
                  };
                  return statusMap[status] || status;
                }
              },
              {
                title: '가격',
                dataIndex: 'regularPrice',
                key: 'regularPrice',
                render: price => `${price.toLocaleString()}원`
              }
            ]}
            size="small"
            pagination={{ pageSize: 5 }}
            rowKey="_id"
          />
        </div>
      )}
      
      {currentStep === 3 && (
        <div style={{ padding: '10px 0' }}>
          <Alert
            message="업로드 실패"
            description="파일 처리 중 오류가 발생했습니다. 아래의 오류를 확인하고 수정 후 다시 시도해 주세요."
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
          
          {validationErrors.length > 0 && (
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              <Title level={5}>유효성 검사 오류</Title>
              {validationErrors.map((error, index) => (
                <div key={index} style={{ marginBottom: '5px' }}>
                  <WarningOutlined style={{ color: '#ff4d4f', marginRight: '5px' }} />
                  <Text>{error}</Text>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default BulkUploadModal;