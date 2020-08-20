import React, { useState, useEffect, Suspense } from 'react'
import {
  Typography,
  Space,
  Tag,
  Empty,
  Spin,
  Form,
  Input,
  Switch,
  InputNumber,
  DatePicker,
  Upload,
  Button,
  Col,
  Select,
  message,
  Progress,
} from 'antd'
import moment from 'moment'
import { useParams, useRequest } from 'umi'
import { Rule } from 'antd/es/form'
import { getSchema } from '@/services/schema'
import { getContents } from '@/services/content'
import { getTempFileURL, uploadFile, downloadFile } from '@/utils'
import { InboxOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import RichTextEditor from './RichText'

const MarkdownEditor = React.lazy(() => import('./Markdown'))

const { Dragger } = Upload
const { TextArea } = Input
const { Option } = Select

const LazyMarkdownEditor: React.FC = (props: any) => (
  <Suspense fallback={<Spin />}>
    <MarkdownEditor {...props} />
  </Suspense>
)

/**
 * 图片懒加载
 */
export const LazyImage: React.FC<{ src: string }> = ({ src }) => {
  if (!src)
    return <Empty image="/img/empty.svg" imageStyle={{ height: '60px' }} description="未设定图片" />

  if (!/^cloud:\/\/\S+/.test(src)) {
    return <img style={{ height: '100px' }} src={src} />
  }

  const [imgUrl, setImgUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTempFileURL(src)
      .then((url) => {
        console.log(url)
        setLoading(false)
        setImgUrl(url)
      })
      .catch((e) => {
        console.log(e)
        console.log(e.message)
        message.error(`获取图片链接失败 ${e.message}`)
        setLoading(false)
      })
  }, [])

  return loading ? (
    <Spin />
  ) : (
    <Space direction="vertical">
      <img style={{ height: '120px' }} src={imgUrl} />
      {imgUrl && (
        <Button
          size="small"
          onClick={() => {
            downloadFile(src)
          }}
        >
          下载图片
        </Button>
      )}
    </Space>
  )
}

// custom file/image uploader
export const CustomUploader: React.FC<{
  type?: 'file' | 'image'
  value?: string
  onChange?: (v: string) => void
}> = (props) => {
  let { value: fileId, type, onChange = () => {} } = props
  const [fileList, setFileList] = useState<any[]>()
  const [percent, setPercent] = useState(0)
  const [uploading, setUploading] = useState(false)

  // 加载图片预览
  useEffect(() => {
    if (!fileId || type === 'file') return
    getTempFileURL(fileId)
      .then((url: string) => {
        setFileList([
          {
            url,
            uid: fileId,
            name: `已上传${type === 'file' ? '文件' : '图片'}`,
            status: 'done',
          },
        ])
      })
      .catch((e) => {
        message.error(`加载图片失败 ${e.message}`)
      })
  }, [fileId])

  return (
    <>
      <Dragger
        fileList={fileList}
        listType={type === 'image' ? 'picture' : 'text'}
        beforeUpload={async (file) => {
          setUploading(true)
          setPercent(0)
          // 上传文件
          fileId = await uploadFile(file, (percent) => {
            setPercent(percent)
          })
          onChange(fileId)
          setFileList([
            {
              uid: fileId,
              name: file.name,
              status: 'done',
            },
          ])
          message.success(`上传${type === 'file' ? '文件' : '图片'}成功`)
          return Promise.reject()
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽{type === 'file' ? '文件' : '图片'}上传</p>
      </Dragger>
      {uploading && <Progress style={{ paddingTop: '10px' }} percent={percent} />}
    </>
  )
}

export const CustomDatePicker: React.FC<{
  type?: string
  value?: string
  onChange?: (v: string) => void
}> = (props) => {
  let { type, value, onChange = () => {} } = props

  return (
    <DatePicker
      showTime={type === 'DateTime'}
      value={moment(value)}
      format={type === 'DateTime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
      onChange={(_, v) => onChange(v)}
    />
  )
}

/**
 * 关联渲染
 */
export const ConnectRender: React.FC<{
  value?: Record<string, any>
  field: SchemaFieldV2
}> = (props) => {
  const { value, field } = props
  const { connectField, connectMany } = field

  if (!value || typeof value === 'string' || typeof value?.[0] === 'string') return '-'

  if (!connectMany) {
    return <Typography.Text>{value[connectField]}</Typography.Text>
  }

  return value.map((record: any, index: number) => <Tag key={index}>{record[connectField]}</Tag>)
}

/**
 * 关联类型，编辑
 */
export const ConnectEditor: React.FC<{
  value?: Record<string, any>
  field: SchemaFieldV2
  onChange?: (v: string) => void
}> = (props) => {
  const { projectId } = useParams()
  const { value, onChange, field } = props
  const { connectField, connectResource, connectMany } = field
  const [records, setRecords] = useState<Record<string, any>>([])
  const [loading, setLoading] = useState(true)

  useRequest(
    async () => {
      const { data: schema } = await getSchema(projectId, connectResource)
      const { data } = await getContents(projectId, schema.collectionName, {
        page: 1,
        pageSize: 1000,
      })

      setRecords(data)
      setLoading(false)
    },
    {
      // 根据连接的 schemaId 缓存
      cacheKey: connectResource,
      onError: (e) => {
        message.error(e.message || '获取数据错误')
        setLoading(false)
      },
    }
  )

  return (
    <Select
      loading={loading}
      mode={connectMany ? 'multiple' : undefined}
      style={{ width: 200 }}
      placeholder="关联字段"
      value={value?._id}
      onChange={onChange}
    >
      {loading ? (
        <Option value={value?._id}>{value?.[connectField]}</Option>
      ) : records?.length ? (
        records?.map((record: Record<string, any>) => (
          <Option value={record._id} key={record._id}>
            {record[connectField]}
          </Option>
        ))
      ) : (
        <Option value="">空</Option>
      )}
    </Select>
  )
}

/**
 * 根据类型获取展示字段组件
 */
export function getFieldRender(field: SchemaFieldV2) {
  const { name, type } = field

  switch (type) {
    case 'String':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => text
    case 'Text':
    case 'MultiLineString':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <Typography.Text ellipsis style={{ width: '120px' }}>
          {text}
        </Typography.Text>
      )
    case 'Boolean':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => {
        return <Typography.Text>{text ? 'True' : 'False'}</Typography.Text>
      }
    case 'Number':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => <Typography.Text>{text}</Typography.Text>
    case 'Url':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <Typography.Link href={record[name]} target="_blank">
          {text}
        </Typography.Link>
      )
    case 'Email':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => <Typography.Text>{text}</Typography.Text>
    case 'Tel':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => <Typography.Text>{text}</Typography.Text>
    case 'Date':
      return undefined
    case 'DateTime':
      return undefined
    case 'Image':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => {
        const data = record[name]
        return <LazyImage src={data} />
      }
    case 'File':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => <Typography.Link>{text}</Typography.Link>
    case 'Array':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => {
        if (!record[name]) {
          return text
        }

        return (
          <Space direction="vertical">
            {record[name]?.map((val: string, index: number) => (
              <Tag key={index}>{val}</Tag>
            ))}
          </Space>
        )
      }
    case 'Markdown':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <Typography.Text ellipsis style={{ width: '200px' }}>
          {text}
        </Typography.Text>
      )

    case 'RichText':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <Typography.Text ellipsis style={{ width: '200px' }}>
          {text}
        </Typography.Text>
      )

    case 'Connect':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => <ConnectRender value={record[name]} field={field} />
    default:
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => text
  }
}

/**
 * 根据类型获取验证规则
 */
function getValidateRule(type: string) {
  let rule: Rule | null

  switch (type) {
    case 'Url':
      rule = { type: 'url', message: '请输入正确的网址' }
      break
    case 'Email':
      rule = {
        type: 'email',
        message: '请输入正确的邮箱',
      }
      break
    case 'Number':
      rule = { type: 'number', message: '请输入正确的数字' }
      break
    case 'Tel':
      rule = {
        pattern: /^\d+$/,
        message: '请输入正确的电话号码',
      }
      break
    default:
      rule = null
  }

  return rule
}

const getRules = (field: SchemaFieldV2): Rule[] => {
  const { isRequired, displayName, min, max, type } = field

  const rules: Rule[] = []

  if (isRequired) {
    rules.push({ required: isRequired, message: `${displayName} 字段是必须要的` })
  }

  if (min) {
    const validType = type === 'String' || type === 'MultiLineString' ? 'string' : 'number'
    rules.push({
      min,
      type: validType,
      message: validType === 'string' ? `不能小于最小长度 ${min}` : `不能小于最小值 ${min}`,
    })
  }

  if (max) {
    const validType = type === 'String' || type === 'MultiLineString' ? 'string' : 'number'
    rules.push({
      max,
      type: validType,
      message: validType === 'string' ? `不能大于最大长度 ${max}` : `不能大于最大值 ${max}`,
    })
  }

  const rule = getValidateRule(field.type)

  rule && rules.push(rule)

  return rules
}

/**
 * 字段编辑
 */
export function getFieldFormItem(field: SchemaFieldV2, key: number) {
  const rules = getRules(field)
  const { name, type, min, max, description, displayName, enumElements } = field

  let FormItem

  switch (type) {
    case 'String':
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          <Input type="text" />
        </Form.Item>
      )
      break
    case 'MultiLineString':
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          <TextArea />
        </Form.Item>
      )
      break
    case 'Boolean':
      FormItem = (
        <Form.Item
          key={key}
          name={name}
          rules={rules}
          label={displayName}
          extra={description}
          valuePropName="checked"
        >
          <Switch checkedChildren="True" unCheckedChildren="False" />
        </Form.Item>
      )
      break
    case 'Number':
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          <InputNumber style={{ width: '100%' }} min={min} max={max} />
        </Form.Item>
      )
      break
    case 'Url':
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          <Input />
        </Form.Item>
      )
      break
    case 'Email':
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          <Input />
        </Form.Item>
      )
      break
    case 'Tel':
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName}>
          <Input style={{ width: '100%' }} />
        </Form.Item>
      )
      break
    case 'Date':
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          <CustomDatePicker type="Date" />
        </Form.Item>
      )
      break
    case 'DateTime':
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          <CustomDatePicker type="DateTime" />
        </Form.Item>
      )
      break
    case 'Image':
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          <CustomUploader type="image" />
        </Form.Item>
      )
      break
    case 'File':
      FormItem = (
        <Form.Item
          key={key}
          name={name}
          rules={rules}
          label={displayName}
          extra={description}
          valuePropName="fileList"
        >
          <CustomUploader type="file" />
        </Form.Item>
      )
      break
    case 'Enum':
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          <Select>
            {enumElements?.length ? (
              enumElements?.map((ele, index) => (
                <Option value={ele.value} key={index}>
                  {ele.label}
                </Option>
              ))
            ) : (
              <Option value="">空</Option>
            )}
          </Select>
        </Form.Item>
      )
      break
    case 'Array':
      FormItem = (
        <Form.Item key={key} rules={rules} label={displayName} extra={description}>
          <Form.List name={name}>
            {(fields, { add, remove }) => {
              return (
                <div>
                  {fields?.map((field, index) => {
                    return (
                      <Form.Item key={index}>
                        <Form.Item {...field} noStyle validateTrigger={['onChange', 'onBlur']}>
                          <Input style={{ width: '60%' }} />
                        </Form.Item>
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          style={{ margin: '0 8px' }}
                          onClick={() => {
                            remove(field.name)
                          }}
                        />
                      </Form.Item>
                    )
                  })}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => {
                        add()
                      }}
                      style={{ width: '60%' }}
                    >
                      <PlusOutlined /> 添加字段
                    </Button>
                  </Form.Item>
                </div>
              )
            }}
          </Form.List>
        </Form.Item>
      )
      break
    case 'Markdown':
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          <LazyMarkdownEditor key={key} />
        </Form.Item>
      )
      break
    case 'RichText':
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          <RichTextEditor key={String(key)} />
        </Form.Item>
      )
      break
    case 'Connect':
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          <ConnectEditor field={field} />
        </Form.Item>
      )
      break
    default:
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          <Input />
        </Form.Item>
      )
  }

  if (type === 'Markdown' || type === 'RichText') {
    return (
      <Col xs={24} sm={24} md={24} lg={24} xl={24} key={key}>
        {FormItem}
      </Col>
    )
  }

  return (
    <Col xs={24} sm={24} md={12} lg={12} xl={12} key={key}>
      {FormItem}
    </Col>
  )
}
