// src/pages/CategoryListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Table, Button, Card, Input, Space, Modal, Tag, 
  Typography, Tooltip, Popconfirm, message 
} from 'antd';
import { PageHeader } from '@ant-design/pro-components';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, ReloadOutlined, ExclamationCircleOutlined 
} from '@ant-design/icons';
import { listCategories, deleteCategory } from '../actions/categoryActions';
import Loader from '../components/common/Loader';

const { Text } = Typography;
const { confirm } = Modal;

const CategoryListPage = ({ history }) => {
  const dispatch = useDispatch();
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Redux 상태
  const categoryList = useSelector(state => state.categoryList);
  const { loading, error, categories } = categoryList;
  
  const categoryDelete = useSelector(state => state.categoryDelete);
  const { 
    loading: loadingDelete, 
    success: successDelete, 
    error: errorDelete 
  } = categoryDelete;
  
  // 페이지 로드 시 카테고리 목록 조회
  useEffect(() => {
    dispatch(listCategories());
  }, [dispatch, successDelete]);
  
  // 삭제 오류 처리
  useEffect(() => {
    if (errorDelete) {
      message.error(errorDelete);
    }
  }, [errorDelete]);
  
  // 카테고리 삭제 확인 모달
  const showDeleteConfirm = (id, name) => {
    confirm({
      title: '카테고리 삭제',
      icon: <ExclamationCircleOutlined />,
      content: `"${name}" 카테고리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk() {
        dispatch(deleteCategory(id));
      }
    });
  };
  
  // 필터된 카테고리 목록
  const filteredCategories = categories?.filter(category => 
    category.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );
  
  // 카테고리 테이블 컬럼
  const columns = [
    {
      title: '카테고리명',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/admin/category/${record._id}/edit`}>{text}</Link>
      ),
    },
    {
      title: '경로',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: '레벨',
      dataIndex: 'level',
      key: 'level',
      width: 80,
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
      title: '작업',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="수정">
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => history.push(`/admin/category/${record._id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="삭제">
            <Button 
              type="danger" 
              size="small" 
              icon={<DeleteOutlined />} 
              onClick={() => showDeleteConfirm(record._id, record.name)}
              loading={loadingDelete}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  return (
    <div className="category-list-page">
      <PageHeader
        title="카테고리 관리"
        subTitle="카테고리 목록"
        extra={[
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => history.push('/admin/category/create')}
          >
            카테고리 추가
          </Button>
        ]}
      />
      
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <Input 
            placeholder="카테고리명 검색" 
            allowClear
            onChange={e => setSearchKeyword(e.target.value)}
            style={{ width: '300px' }}
            prefix={<SearchOutlined />}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => dispatch(listCategories())}
          >
            새로고침
          </Button>
        </div>
        
        {loading ? (
          <Loader />
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={filteredCategories || []} 
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  );
};

export default CategoryListPage;