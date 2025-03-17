// src/pages/CategoryEditPage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Form, Input, Button, Card, Select, Switch, 
  InputNumber, Upload, message, PageHeader, Alert 
} from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { 
  getCategoryDetails, 
  createCategory, 
  updateCategory,
  listCategories
} from '../actions/categoryActions';
import { 
  CATEGORY_CREATE_RESET,
  CATEGORY_UPDATE_RESET
} from '../constants/categoryConstants';
import Loader from '../components/common/Loader';

const { Option } = Select;
const { TextArea } = Input;

const CategoryEditPage = ({ match, history }) => {
  const categoryId = match.params.id;
  const isEditMode = Boolean(categoryId);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  
  // Redux 상태
  const categoryDetails = useSelector(state => state.categoryDetails);
  const { loading, error, category } = categoryDetails;
  
  const categoryList = useSelector(state => state.categoryList);
  const { categories } = categoryList;
  
  const categoryCreate = useSelector(state => state.categoryCreate);
  const { 
    loading: loadingCreate, 
    success: successCreate, 
    error: errorCreate 
  } = categoryCreate;
  
  const categoryUpdate = useSelector(state => state.categoryUpdate);
  const { 
    loading: loadingUpdate, 
    success: successUpdate, 
    error: errorUpdate 
  } = categoryUpdate;
  
  // 페이지 로드 시 카테고리 목록과 상세 정보 조회
  useEffect(() => {
    dispatch(listCategories());
    
    if (isEditMode) {
      dispatch(getCategoryDetails(categoryId));
    } else {
      dispatch({ type: CATEGORY_CREATE_RESET });
    }
    
    return () => {
      // 컴포넌트 언마운트 시 상태 초기화
      dispatch({ type: CATEGORY_CREATE_RESET });
      dispatch({ type: CATEGORY_UPDATE_RESET });
    };
  }, [dispatch, categoryId, isEditMode]);
  
  // 카테고리 정보가 로드되면 폼 필드 설정
  useEffect(() => {
    if (isEditMode && category && category._id === categoryId) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
        parent: category.parent || null,
        isActive: category.isActive !== undefined ? category.isActive : true,
        displayOrder: category.displayOrder || 0
      });
      
      // 이미지가 있는 경우 파일 리스트 설정
      if (category.image) {
        setFileList([
          {
            uid: '-1',
            name: 'category-image',
            status: 'done',
            url: category.image
          }
        ]);
      }
    }
  }, [form, category, categoryId, isEditMode]);
  
  // 생성/수정 성공 시 리디렉션
  useEffect(() => {
    if (successCreate || successUpdate) {
      message.success(
        isEditMode 
          ? '카테고리가 성공적으로 수정되었습니다' 
          : '카테고리가 성공적으로 생성되었습니다'
      );
      history.push('/admin/categories');
    }
  }, [successCreate, successUpdate, history, isEditMode]);
  
  // 이미지 업로드 처리
  const handleImageUpload = info => {
    let fileList = [...info.fileList];
    
    // 최대 1개 이미지만 허용
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
  
  // 폼 제출 처리
  const onFinish = values => {
    // FormData 준비
    const formData = new FormData();
    
    // 폼 필드 추가
    Object.keys(values).forEach(key => {
      if (values[key] !== undefined && values[key] !== null) {
        formData.append(key, values[key]);
      }
    });
    
    // 이미지 추가
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('image', fileList[0].originFileObj);
    }
    
    // API 요청
    if (isEditMode) {
      dispatch(updateCategory(categoryId, formData));
    } else {
      dispatch(createCategory(formData));
    }
  };
  
  // 상위 카테고리 선택 옵션 필터링 (자기 자신은 선택 불가)
  const parentOptions = categories?.filter(cat => 
    !isEditMode || cat._id !== categoryId
  );
  
  return (
    <div className="category-edit-page">
      <PageHeader
        onBack={() => history.push('/admin/categories')}
        title={isEditMode ? '카테고리 수정' : '카테고리 추가'}
        subTitle={isEditMode ? category?.name : '새 카테고리 정보 입력'}
      />
      
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
            onFinish={onFinish}
            initialValues={{
              isActive: true,
              displayOrder: 0
            }}
          >
            <Form.Item
              name="name"
              label="카테고리명"
              rules={[{ required: true, message: '카테고리명을 입력해주세요' }]}
            >
              <Input placeholder="카테고리명" />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="설명"
            >
              <TextArea 
                rows={4} 
                placeholder="카테고리 설명 (선택사항)" 
              />
            </Form.Item>
            
            <Form.Item
              name="parent"
              label="상위 카테고리"
            >
              <Select 
                placeholder="상위 카테고리 선택 (선택사항)" 
                allowClear
                loading={categoryList.loading}
              >
                {parentOptions?.map(category => (
                  <Option key={category._id} value={category._id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="isActive"
              label="활성화 상태"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="displayOrder"
              label="표시 순서"
            >
              <InputNumber min={0} />
            </Form.Item>
            
            <Form.Item
              label="카테고리 이미지"
            >
              <Upload
                name="image"
                listType="picture"
                fileList={fileList}
                onChange={handleImageUpload}
                beforeUpload={() => false} // 자동 업로드 방지
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>이미지 업로드</Button>
              </Upload>
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={loadingCreate || loadingUpdate}
                style={{ marginRight: '10px' }}
              >
                {isEditMode ? '카테고리 수정' : '카테고리 추가'}
              </Button>
              <Button 
                onClick={() => history.push('/admin/categories')}
              >
                취소
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default CategoryEditPage;