import React, { useState, useEffect } from 'react'
import {
  Button,
  Modal,
  Menu,
  Upload,
  Alert,
  Select,
  message,
  Dropdown,
  Progress,
  Typography,
} from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { createMigrateJobs } from '@/services/content'
import { getProjectId, random, redirectTo, uploadFile } from '@/utils'

const { Dragger } = Upload
const { Title } = Typography
const { Option } = Select

/**
 * 导入数据
 */
const DataImport: React.FC<{ collectionName: string }> = ({ collectionName }) => {
  const projectId = getProjectId()
  const [visible, setVisible] = useState(false)
  const [percent, setPercent] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dataType, setDataType] = useState<string>('')
  const [conflictMode, setConflictMode] = useState('insert')

  useEffect(() => {
    if (!visible) {
      setPercent(0)
    }
  }, [visible])

  return (
    <>
      <Dropdown
        overlay={
          <Menu
            onClick={({ key }) => {
              // 查看导出记录
              if (key === 'record') {
                redirectTo('content/migrate')
                return
              }

              // 导入数据
              setVisible(true)
              setDataType(key as string)
            }}
          >
            <Menu.Item key="csv">通过 CSV 导入</Menu.Item>
            <Menu.Item key="json">通过 JSON 导入</Menu.Item>
            <Menu.Item key="record">查看导入记录</Menu.Item>
          </Menu>
        }
        key="search"
      >
        <Button type="primary">导入数据</Button>
      </Dropdown>
      <Modal
        centered
        destroyOnClose
        width={600}
        title="导入数据"
        footer={null}
        closable={true}
        visible={visible}
        onCancel={() => setVisible(false)}
      >
        <Title level={4}>注意事项</Title>
        {dataType === 'json' && (
          <Alert
            message="JSON 数据不是数组，而是类似 JSON Lines，即各个记录对象之间使用 \n 分隔，而非逗号"
            style={{ marginBottom: '10px' }}
          />
        )}
        {dataType === 'csv' && (
          <Alert message="CSV 格式的数据默认以第一行作为导入后的所有键名，余下的每一行则是与首行键名一一对应的键值记录" />
        )}
        <br />
        <Title level={4}>冲突处理模式</Title>
        <Select
          defaultValue="insert"
          onChange={setConflictMode}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          <Option value="insert">Insert（会在导入时总是插入新记录，出现 _id 冲突时会报错）</Option>
          <Option value="upsert">
            Upsert（会判断有无该条记录，如果有则更新记录，否则就插入一条新记录）
          </Option>
        </Select>
        <Dragger
          accept=".csv,.json"
          listType="picture"
          beforeUpload={(file) => {
            setUploading(true)
            setPercent(0)
            // 文件路径
            const filePath = `cloudbase-cms/data-import/${random(32)}-${file.name}`
            // 上传文件
            uploadFile({
              file,
              filePath,
              onProgress: (percent) => {
                setPercent(percent)
              },
            })
              .then(() => createMigrateJobs(projectId, collectionName, filePath, conflictMode))
              .then(() => {
                setVisible(false)
                message.success('上传文件成功，数据导入中')
              })
              .catch((e) => {
                message.error(`导入文件失败：${e.message}`)
                setVisible(false)
              })
            return false
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p>点击或拖拽上传文件，开始导入数据</p>
        </Dragger>
        {uploading && <Progress style={{ paddingTop: '10px' }} percent={percent} />}
      </Modal>
    </>
  )
}

export default DataImport
