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
        <ProductBatchActionButton 
          selectedProducts={selectedRowKeys} 
          refreshProducts={fetchProducts} 
        />
      </Space>
    </div>
  )}

  import { 
    PlusOutlined, SearchOutlined, FilterOutlined, 
    SyncOutlined, MoreOutlined, DownloadOutlined,
    DeleteOutlined, EditOutlined, ExportOutlined,
    EyeOutlined, LinkOutlined, FileExcelOutlined,
    DatabaseOutlined, TagOutlined
  } from '@ant-design/icons';
  import ProductBatchActionButton from '../components/products/ProductBatchActionButton';