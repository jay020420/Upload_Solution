// src/components/products/ProductForm.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Form, Input, Button, Select, InputNumber, 
  Upload, Switch, Card, Divider, Table, 
  message, Row, Col, Tabs, Modal
} from 'antd';
import { 
  UploadOutlined, PlusOutlined, 
  DeleteOutlined, DragOutlined
} from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { 
  createProduct, 
  updateProduct, 
  uploadProductImage 
} from '../../actions/productActions';
import { listCategories } from '../../actions/categoryActions';

const { TabPane } = Tabs;
const { Option } = Select;

const ProductForm = ({ product, isEdit = false, history }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  
  // Redux 상태
  const categoryList = useSelector(state => state.categoryList);
  const { loading: loadingCategories, categories } = categoryList;
  
  const productCreate = useSelector(state => state.productCreate);
  const { loading: loadingCreate, success: successCreate, error: errorCreate } = productCreate;
  
  const productUpdate = useSelector(state => state.productUpdate);
  const { loading: loadingUpdate, success: successUpdate, error: errorUpdate } = productUpdate;
  
  // 로컬 상태
  const [fileList, setFileList] = useState([]);
  const [description, setDescription] = useState('');
  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState([{ name: '', values: [{ name: '', additionalPrice: 0 }] }]);
  const [variants, setVariants] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  
  // 상품 수정 시 데이터 로드
  useEffect(() => {
    dispatch(listCategories());
    
    if (isEdit && product) {
      form.setFieldsValue({
        name: product.name,
        shortDescription: product.shortDescription,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        costPrice: product.costPrice,
        categories: product.categories?.map(c => c._id),
        brand: product.brand,
        status: product.status,
        weight: product.weight,
        shippingClass: product.shippingClass,
        dimensions: product.dimensions || {},
        stock: product.stock || 0
      });
      
      setDescription(product.description || '');
      setHasVariants(product.hasVariants || false);
      
      if (product.options && product.options.length > 0) {
        setOptions(product.options);
      }
      
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
      }
      
      // 이미지 설정
      if (product.images && product.images.length > 0) {
        const images = product.images.map((img, index) => ({
          uid: img._id || `-${index}`,
          name: `Image ${index + 1}`,
          status: 'done',
          url: img.url,
          isMain: img.isMain,
          order: img.order
        }));
        setFileList(images);
      }
    }
  }, [dispatch, isEdit, product, form]);

  // 성공 처리
  useEffect(() => {
    if (successCreate || successUpdate) {
      message.success(isEdit ? '상품이 수정되었습니다.' : '상품이 등록되었습니다.');
      
      if (successCreate) {
        // 상품 목록으로 이동
        history.push('/admin/products');
      }
    }
  }, [successCreate, successUpdate, history, isEdit]);

  // 에러 처리
  useEffect(() => {
    if (errorCreate) {
      message.error(`상품 등록 오류: ${errorCreate}`);
    }
    if (errorUpdate) {
      message.error(`상품 수정 오류: ${errorUpdate}`);
    }
  }, [errorCreate, errorUpdate]);
  
  // 옵션 관리 함수들
  const addOption = () => {
    setOptions([...options, { name: '', values: [{ name: '', additionalPrice: 0 }] }]);
  };
  
  const removeOption = (optionIndex) => {
    const newOptions = [...options];
    newOptions.splice(optionIndex, 1);
    setOptions(newOptions);
    // 옵션이 변경되면 조합 재생성
    if (newOptions.length > 0) {
      generateVariants(newOptions);
    } else {
      setVariants([]);
    }
  };
  
  const updateOptionName = (index, value) => {
    const newOptions = [...options];
    newOptions[index].name = value;
    setOptions(newOptions);
  };
  
  const addOptionValue = (optionIndex) => {
    const newOptions = [...options];
    newOptions[optionIndex].values.push({ name: '', additionalPrice: 0 });
    setOptions(newOptions);
  };
  
  const removeOptionValue = (optionIndex, valueIndex) => {
    const newOptions = [...options];
    newOptions[optionIndex].values.splice(valueIndex, 1);
    setOptions(newOptions);
    // 옵션 값이 변경되면 조합 재생성
    generateVariants(newOptions);
  };
  
  const updateOptionValue = (optionIndex, valueIndex, field, value) => {
    const newOptions = [...options];
    newOptions[optionIndex].values[valueIndex][field] = value;
    setOptions(newOptions);
    
    // 옵션 값 이름이 변경되면 조합 재생성
    if (field === 'name') {
      generateVariants(newOptions);
    }
  };
  
  // 조합(Variants) 생성 함수
  const generateVariants = (currentOptions) => {
    // 옵션 값들의 모든 조합 생성
    const generateCombinations = (options, current = [], index = 0) => {
      if (index === options.length) {
        return [current];
      }
      
      const results = [];
      for (const value of options[index].values) {
        results.push(
          ...generateCombinations(
            options, 
            [...current, { option: options[index].name, value: value.name, additionalPrice: value.additionalPrice }], 
            index + 1
          )
        );
      }
      return results;
    };
    
    // 옵션이 없거나 값이 없으면 조합 생성 안함
    if (!currentOptions || currentOptions.length === 0 || 
        currentOptions.some(opt => !opt.name || opt.values.length === 0 || 
                           opt.values.some(v => !v.name))) {
      return;
    }
    
    // 조합 생성
    const combinations = generateCombinations(currentOptions);
    
    // 기존 조합과 비교하여 가격 정보 유지
    const basePrice = form.getFieldValue('regularPrice') || 0;
    
    const newVariants = combinations.map(combo => {
      // 조합 이름 생성 (예: "Red / Large")
      const combinationName = combo.map(c => c.value).join(' / ');
      
      // 기존 조합에서 동일한 조합 찾기
      const existingVariant = variants.find(v => v.optionCombination === combinationName);
      
      // 추가 가격 계산
      const additionalPrice = combo.reduce((sum, item) => sum + (item.additionalPrice || 0), 0);
      
      return {
        optionCombination: combinationName,
        combinationDetails: combo,
        price: existingVariant ? existingVariant.price : (basePrice + additionalPrice),
        stock: existingVariant ? existingVariant.stock : 0,
        sku: existingVariant ? existingVariant.sku : '',
        isActive: existingVariant ? existingVariant.isActive : true
      };
    });
    
    setVariants(newVariants);
  };
  
  // 이미지 관리 함수들
  const handleImagePreview = (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewVisible(true);
  };
  
  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };
  
  const handleImageUpload = async (options) => {
    const { onSuccess, onError, file } = options;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const result = await dispatch(uploadProductImage(formData));
      onSuccess(result, file);
    } catch (error) {
      onError(error);
    }
  };
  
  const setMainImage = (uid) => {
    // 모든 이미지의 isMain을 false로 설정 후 선택한 이미지만 true로
    const updatedFileList = fileList.map(file => ({
      ...file,
      isMain: file.uid === uid
    }));
    setFileList(updatedFileList);
  };
  
  // 미리보기 모달 닫기
  const handlePreviewCancel = () => {
    setPreviewVisible(false);
  };
  
  // 폼 제출 처리
  const onFinish = (values) => {
    // 상품 데이터 구성
    const productData = {
      ...values,
      description,
      hasVariants,
      options: hasVariants ? options : [],
      variants: hasVariants ? variants : [],
      images: fileList.map((file, index) => ({
        url: file.url || (file.response && file.response.url),
        order: index,
        isMain: file.isMain || index === 0
      })).filter(img => img.url) // URL이 있는 이미지만 포함
    };
    
    if (isEdit) {
      dispatch(updateProduct(product._id, productData));
    } else {
      dispatch(createProduct(productData));
    }
  };
  
  // 폼 취소 처리
  const handleCancel = () => {
    if (isEdit) {
      // 수정 취소 시 상품 상세 페이지로 이동
      history.push(`/admin/product/${product._id}`);
    } else {
      // 등록 취소 시 상품 목록으로 이동
      history.push('/admin/products');
    }
  };
  
  // 폼 렌더링
  return (
    <DndProvider backend={HTML5Backend}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: 'draft',
          regularPrice: 0,
          salePrice: 0,
          costPrice: 0,
          stock: 0
        }}
      >
        <Tabs defaultActiveKey="basic">
          <TabPane tab="기본 정보" key="basic">
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item 
                  name="name" 
                  label="상품명"
                  rules={[{ required: true, message: '상품명을 입력해주세요' }]}
                >
                  <Input placeholder="상품명을 입력하세요" />
                </Form.Item>
                
                <Form.Item name="shortDescription" label="간단 설명">
                  <Input.TextArea rows={2} placeholder="상품에 대한 간단한 설명을 입력하세요" />
                </Form.Item>
                
                <Form.Item label="상세 설명">
                  <ReactQuill
                    theme="snow"
                    value={description}
                    onChange={setDescription}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        [{ color: [] }, { background: [] }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Card title="상품 상태">
                  <Form.Item name="status" label="판매 상태">
                    <Select>
                      <Option value="draft">임시 저장</Option>
                      <Option value="active">판매 중</Option>
                      <Option value="inactive">판매 중지</Option>
                      <Option value="out_of_stock">품절</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item name="categories" label="카테고리">
                    <Select
                      mode="multiple"
                      placeholder="카테고리 선택"
                      loading={loadingCategories}
                    >
                      {categories?.map(category => (
                        <Option key={category._id} value={category._id}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
                  <Form.Item name="brand" label="브랜드">
                    <Input placeholder="브랜드명" />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
            
            <Card title="가격 정보">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item 
                    name="regularPrice" 
                    label="정상가"
                    rules={[{ required: true, message: '정상가를 입력해주세요' }]}
                  >
                    <InputNumber 
                      style={{ width: '100%' }} 
                      min={0} 
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item name="salePrice" label="판매가">
                    <InputNumber 
                      style={{ width: '100%' }} 
                      min={0} 
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item name="costPrice" label="원가">
                    <InputNumber 
                      style={{ width: '100%' }} 
                      min={0} 
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
            
            <Card title="상품 이미지" style={{ marginTop: '20px' }}>
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleImageChange}
                onPreview={handleImagePreview}
                customRequest={handleImageUpload}
                multiple
              >
                {fileList.length >= 10 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>이미지 업로드</div>
                  </div>
                )}
              </Upload>
              {fileList.length > 0 && (
                <Table
                  rowKey="uid"
                  dataSource={fileList}
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: '이미지',
                      dataIndex: 'url',
                      key: 'image',
                      render: (_, record) => (
                        <img 
                          src={record.url || record.thumbUrl} 
                          alt="preview" 
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                        />
                      ),
                    },
                    {
                      title: '대표 이미지',
                      dataIndex: 'isMain',
                      key: 'isMain',
                      render: (isMain, record) => (
                        <Switch 
                          checked={isMain} 
                          onChange={() => setMainImage(record.uid)}
                        />
                      ),
                    },
                    {
                      title: '작업',
                      key: 'actions',
                      render: (_, record, index) => (
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            const newFileList = [...fileList];
                            newFileList.splice(index, 1);
                            setFileList(newFileList);
                          }}
                        >
                          삭제
                        </Button>
                      ),
                    },
                  ]}
                />
              )}
              
              <Modal visible={previewVisible} footer={null} onCancel={handlePreviewCancel}>
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
              </Modal>
            </Card>
          </TabPane>
          
          <TabPane tab="옵션 및 재고" key="options">
            <Card title="상품 옵션">
              <Form.Item label="옵션 사용">
                <Switch 
                  checked={hasVariants} 
                  onChange={checked => {
                    setHasVariants(checked);
                    if (!checked) {
                      setOptions([]);
                      setVariants([]);
                    } else if (options.length === 0) {
                      setOptions([{ name: '', values: [{ name: '', additionalPrice: 0 }] }]);
                    }
                  }} 
                />
                <span style={{ marginLeft: '10px' }}>
                  {hasVariants ? '옵션 사용 중' : '단일 상품 (옵션 없음)'}
                </span>
              </Form.Item>
              
              {!hasVariants && (
                <Form.Item name="stock" label="재고 수량">
                  <InputNumber min={0} style={{ width: '200px' }} />
                </Form.Item>
              )}
              
              {hasVariants && (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <h3>옵션 설정</h3>
                    <p>색상, 사이즈 등의 옵션을 설정해 주세요. (예: 색상: 빨강, 파랑, 검정)</p>
                    
                    {options.map((option, optionIndex) => (
                      <Card 
                        key={optionIndex} 
                        size="small" 
                        title={`옵션 ${optionIndex + 1}`}
                        style={{ marginBottom: '10px' }}
                        extra={
                          options.length > 1 && (
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => removeOption(optionIndex)}
                            />
                          )
                        }
                      >
                        <Row gutter={16}>
                          <Col span={8}>
                            <Input 
                              placeholder="옵션명 (예: 색상, 사이즈)" 
                              value={option.name}
                              onChange={e => updateOptionName(optionIndex, e.target.value)}
                              style={{ marginBottom: '10px' }}
                            />
                          </Col>
                        </Row>
                        
                        <div style={{ marginBottom: '10px' }}>
                          <h4>옵션 값</h4>
                          {option.values.map((value, valueIndex) => (
                            <Row key={valueIndex} gutter={16} style={{ marginBottom: '5px' }}>
                              <Col span={8}>
                                <Input 
                                  placeholder="옵션값 (예: 빨강, XL)" 
                                  value={value.name}
                                  onChange={e => updateOptionValue(optionIndex, valueIndex, 'name', e.target.value)}
                                />
                              </Col>
                              <Col span={6}>
                                <InputNumber 
                                  placeholder="추가 금액" 
                                  value={value.additionalPrice}
                                  onChange={val => updateOptionValue(optionIndex, valueIndex, 'additionalPrice', val)}
                                  style={{ width: '100%' }}
                                  min={0}
                                />
                              </Col>
                              <Col span={2}>
                                {option.values.length > 1 && (
                                  <Button 
                                    type="text" 
                                    danger 
                                    icon={<DeleteOutlined />} 
                                    onClick={() => removeOptionValue(optionIndex, valueIndex)}
                                  />
                                )}
                              </Col>
                            </Row>
                          ))}
                          
                          <Button 
                            type="dashed" 
                            icon={<PlusOutlined />} 
                            onClick={() => addOptionValue(optionIndex)}
                            style={{ marginTop: '5px' }}
                          >
                            옵션 값 추가
                          </Button>
                        </div>
                      </Card>
                    ))}
                    
                    <Button 
                      type="dashed" 
                      icon={<PlusOutlined />} 
                      onClick={addOption}
                      style={{ marginTop: '10px' }}
                    >
                      옵션 추가
                    </Button>
                  </div>
                  
                  {variants.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <h3>옵션 조합 관리</h3>
                      <p>생성된 옵션 조합의 가격, 재고 등을 관리할 수 있습니다.</p>
                      
                      <Table
                        rowKey="optionCombination"
                        dataSource={variants}
                        size="small"
                        pagination={false}
                        columns={[
                          {
                            title: '옵션 조합',
                            dataIndex: 'optionCombination',
                            key: 'optionCombination',
                          },
                          {
                            title: '판매가',
                            dataIndex: 'price',
                            key: 'price',
                            render: (text, record) => (
                              <InputNumber
                                value={record.price}
                                onChange={value => {
                                  const newVariants = [...variants];
                                  const index = newVariants.findIndex(v => v.optionCombination === record.optionCombination);
                                  newVariants[index].price = value;
                                  setVariants(newVariants);
                                }}
                                min={0}
                                style={{ width: '100%' }}
                              />
                            ),
                          },
                          {
                            title: '재고',
                            dataIndex: 'stock',
                            key: 'stock',
                            render: (text, record) => (
                              <InputNumber
                                value={record.stock}
                                onChange={value => {
                                  const newVariants = [...variants];
                                  const index = newVariants.findIndex(v => v.optionCombination === record.optionCombination);
                                  newVariants[index].stock = value;
                                  setVariants(newVariants);
                                }}
                                min={0}
                                style={{ width: '100%' }}
                              />
                            ),
                          },
                          {
                            title: 'SKU',
                            dataIndex: 'sku',
                            key: 'sku',
                            render: (text, record) => (
                              <Input
                                value={record.sku}
                                onChange={e => {
                                  const newVariants = [...variants];
                                  const index = newVariants.findIndex(v => v.optionCombination === record.optionCombination);
                                  newVariants[index].sku = e.target.value;
                                  setVariants(newVariants);
                                }}
                              />
                            ),
                          },
                          {
                            title: '사용 여부',
                            dataIndex: 'isActive',
                            key: 'isActive',
                            render: (text, record) => (
                              <Switch
                                checked={record.isActive}
                                onChange={checked => {
                                  const newVariants = [...variants];
                                  const index = newVariants.findIndex(v => v.optionCombination === record.optionCombination);
                                  newVariants[index].isActive = checked;
                                  setVariants(newVariants);
                                }}
                              />
                            ),
                          },
                        ]}
                      />
                    </div>
                  )}
                </>
              )}
            </Card>
          </TabPane>
          
          <TabPane tab="배송 정보" key="shipping">
            <Card title="배송 정보">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="weight" label="무게 (g)">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Row gutter={8}>
                    <Col span={8}>
                      <Form.Item name={['dimensions', 'length']} label="길이 (cm)">
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['dimensions', 'width']} label="너비 (cm)">
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['dimensions', 'height']} label="높이 (cm)">
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              
              <Form.Item name="shippingClass" label="배송 분류">
                <Select placeholder="배송 분류 선택">
                  <Option value="free">무료 배송</Option>
                  <Option value="standard">일반 배송</Option>
                  <Option value="express">특급 배송</Option>
                </Select>
              </Form.Item>
            </Card>
          </TabPane>
        </Tabs>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large"
            loading={loadingCreate || loadingUpdate}
            style={{ marginRight: '10px' }}
          >
            {isEdit ? '상품 수정' : '상품 등록'}
          </Button>
          
          <Button size="large" onClick={handleCancel}>
            취소
          </Button>
        </div>
      </Form>
    </DndProvider>
  );
};

export default ProductForm;