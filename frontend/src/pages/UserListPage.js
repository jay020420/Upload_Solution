// src/pages/UserListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Table, Button, Card, Input, Space, Modal, Tag, 
  PageHeader, Tooltip, Popconfirm, message, Alert 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, ExclamationCircleOutlined, UserOutlined 
} from '@ant-design/icons';
import { listUsers, deleteUser } from '../actions/userActions';
import Loader from '../components/common/Loader';

const { Search } = Input;
const { confirm } = Modal;

const UserListPage = ({ history }) => {
  const dispatch = useDispatch();
  
  // Redux 상태
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  
  const userList = useSelector(state => state.userList);
  const { loading, error, users, page, pages, total } = userList;
  
  const userDelete = useSelector(state => state.userDelete);
  const { loading: loadingDelete, success: successDelete, error: errorDelete } = userDelete;
  
  // 로컬 상태
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 페이지 로드 시 사용자 목록 조회
  useEffect(() => {
    // 관리자 권한 체크
    if (userInfo && userInfo.isAdmin) {
      fetchUsers();
    } else {
      history.push('/login');
    }
  }, [dispatch, history, userInfo, successDelete, currentPage, pageSize]);
  
  // 사용자 조회 함수
  const fetchUsers = () => {
    const params = {
      page: currentPage,
      pageSize,
      keyword: keyword || undefined
    };
    
    dispatch(listUsers(params));
  };
  
  // 키워드 검색 처리
  const handleSearch = value => {
    setKeyword(value);
    setCurrentPage(1);
    dispatch(listUsers({ page: 1, pageSize, keyword: value }));
  };
  
  // 테이블 변경 처리
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };
  
  // 사용자 삭제 확인 모달
  const showDeleteConfirm = (id, name) => {
    confirm({
      title: '사용자 삭제',
      icon: <ExclamationCircleOutlined />,
      content: `"${name}" 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk() {
        dispatch(deleteUser(id));
      }
    });
  };
  
  // 사용자 테이블 컬럼
  const columns = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <Link to={`/admin/user/${record._id}/edit`}>{text}</Link>
        </Space>
      ),
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '권한',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      width: 100,
      render: isAdmin => (
        isAdmin ? 
          <Tag color="blue">관리자</Tag> : 
          <Tag>일반 사용자</Tag>
      ),
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: date => new Date(date).toLocaleString()
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
            onClick={() => history.push(`/admin/user/${record._id}/edit`)}
          >
            수정
          </Button>
          
          {record._id !== userInfo._id && ( // 자기 자신은 삭제 불가능
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record._id, record.name)}
            >
              삭제
            </Button>
          )}
        </Space>
      ),
    },
  ];
  
  return (
    <div className="user-list-page">
      <PageHeader
        title="사용자 관리"
        subTitle="사용자 목록"
      />
      
      <Card style={{ marginBottom: '20px' }}>
        <Space>
          <Search
            placeholder="이름 또는 이메일 검색"
            allowClear
            enterButton
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              setKeyword('');
              setCurrentPage(1);
              dispatch(listUsers({ page: 1, pageSize }));
            }}
          >
            초기화
          </Button>
        </Space>
      </Card>
      
      <Card>
        {errorDelete && (
          <Alert
            message="사용자 삭제 오류"
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
            message="사용자 조회 오류"
            description={error}
            type="error"
            showIcon
          />
        ) : (
          <Table
            columns={columns}
            dataSource={users || []}
            rowKey="_id"
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `총 ${total}명의 사용자`
            }}
            onChange={handleTableChange}
          />
        )}
      </Card>
    </div>
  );
};

export default UserListPage;