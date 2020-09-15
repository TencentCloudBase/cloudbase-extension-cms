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
import 'moment/locale/zh-cn'
import locale from 'antd/es/date-picker/locale/zh_CN'
import { getSchema } from '@/services/schema'
import { getContents } from '@/services/content'
import { getTempFileURL, uploadFile, downloadFile, copyToClipboard } from '@/utils'
import { InboxOutlined, MinusCircleOutlined, PlusOutlined, CopyTwoTone } from '@ant-design/icons'

import RichTextEditor from './RichText'
import { useConcent } from 'concent'

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
  if (!src) {
    return <Empty image="/img/empty.svg" imageStyle={{ height: '60px' }} description="未设定图片" />
  }

  if (!/^cloud:\/\/\S+/.test(src)) {
    return <img style={{ height: '120px', maxWidth: '200px' }} src={src} />
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
      <img style={{ height: '120px', maxWidth: '200px' }} src={imgUrl} />
      {imgUrl && (
        <Space>
          <Button
            size="small"
            onClick={() => {
              downloadFile(src)
            }}
          >
            下载图片
          </Button>
          <Button
            size="small"
            onClick={() => {
              getTempFileURL(src)
                .then((url) => {
                  copyToClipboard(url)
                    .then(() => {
                      message.success('复制到剪切板成功')
                    })
                    .catch(() => {
                      message.error('复制到剪切板成功')
                    })
                })
                .catch((e) => {
                  console.log(e)
                  console.log(e.message)
                  message.error(`获取图片链接失败 ${e.message}`)
                })
            }}
          >
            访问链接
            <CopyTwoTone />
          </Button>
        </Space>
      )}
    </Space>
  )
}

/**
 * 文件、图片上传
 */
export const CustomUploader: React.FC<{
  type?: 'file' | 'image'
  value?: string
  onChange?: (v: string) => void
}> = (props) => {
  let { value: fileUrl, type, onChange = () => {} } = props

  if (fileUrl && !/^cloud:\/\/\S+/.test(fileUrl)) {
    return (
      <>
        <Input type="url" value={fileUrl} onChange={(e) => onChange(e.target.value)} />
        {type === 'image' && <img style={{ height: '120px', marginTop: '10px' }} src={fileUrl} />}
      </>
    )
  }

  const [fileList, setFileList] = useState<any[]>()
  const [percent, setPercent] = useState(0)
  const [uploading, setUploading] = useState(false)

  // 加载图片预览
  useEffect(() => {
    if (!fileUrl || type === 'file') return

    getTempFileURL(fileUrl)
      .then((url: string) => {
        setFileList([
          {
            url,
            uid: fileUrl,
            name: `已上传${type === 'file' ? '文件' : '图片'}`,
            status: 'done',
          },
        ])
      })
      .catch((e) => {
        message.error(`加载图片失败 ${e.message}`)
      })
  }, [fileUrl])

  return (
    <>
      <Dragger
        fileList={fileList}
        listType={type === 'image' ? 'picture' : 'text'}
        beforeUpload={async (file) => {
          setUploading(true)
          setPercent(0)
          // 上传文件
          fileUrl = await uploadFile(file, (percent) => {
            setPercent(percent)
          })
          onChange(fileUrl)
          setFileList([
            {
              uid: fileUrl,
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

/**
 * 时间选择器
 */
export const CustomDatePicker: React.FC<{
  type?: string
  value?: string
  onChange?: (v: string | number) => void
}> = (props) => {
  let { type, value, onChange = () => {} } = props

  return (
    <DatePicker
      locale={locale}
      value={value ? moment(value) : null}
      showTime={type === 'DateTime'}
      format={type === 'DateTime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
      onChange={(_, v) => onChange(moment(v).valueOf())}
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

  if (!value || typeof value === 'string' || typeof value?.[0] === 'string') return <span>-</span>

  if (!connectMany) {
    return <Typography.Text>{value[connectField]}</Typography.Text>
  }

  return (
    <Space>
      {value
        .filter((_: any) => _)
        .map((record: any, index: number) => (
          <Tag key={index}>{record?.[connectField]}</Tag>
        ))}
    </Space>
  )
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
  const ctx = useConcent('content')
  const { value, onChange, field } = props
  const { connectField, connectResource, connectMany } = field
  const [records, setRecords] = useState<Record<string, any>>([])
  const [loading, setLoading] = useState(true)

  useRequest(
    async () => {
      const { schemas } = ctx.state
      let schema = schemas.find((_: SchemaV2) => _._id === connectResource)

      // 后台获取 Schema
      if (!schema) {
        const { data } = await getSchema(projectId, connectResource)
        schema = data
      }

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
      // style={{ width: 300 }}
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
        <Option value="" disabled>
          空
        </Option>
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
        return <Typography.Text>{record[name] ? 'True' : 'False'}</Typography.Text>
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
 * 字段编辑器
 */
export function getFieldEditor(field: SchemaFieldV2, key: number) {
  const { name, type, min, max, enumElements } = field

  let FieldEditor: React.ReactNode

  switch (type) {
    case 'String':
      FieldEditor = <Input type="text" />
      break
    case 'MultiLineString':
      FieldEditor = <TextArea />
      break
    case 'Boolean':
      FieldEditor = <Switch checkedChildren="True" unCheckedChildren="False" />
      break
    case 'Number':
      FieldEditor = <InputNumber style={{ width: '100%' }} min={min} max={max} />
      break
    case 'Url':
      FieldEditor = <Input />
      break
    case 'Email':
      FieldEditor = <Input />
      break
    case 'Tel':
      FieldEditor = <Input style={{ width: '100%' }} />
      break
    case 'Date':
      FieldEditor = <CustomDatePicker type="Date" />
      break
    case 'DateTime':
      FieldEditor = <CustomDatePicker type="DateTime" />
      break
    case 'Image':
      FieldEditor = <CustomUploader type="image" />
      break
    case 'File':
      FieldEditor = <CustomUploader type="file" />
      break
    case 'Enum':
      FieldEditor = (
        <Select>
          {enumElements?.length ? (
            enumElements?.map((ele, index) => (
              <Option value={ele.value} key={index}>
                {ele.label}
              </Option>
            ))
          ) : (
            <Option value="" disabled>
              空
            </Option>
          )}
        </Select>
      )
      break
    case 'Array':
      FieldEditor = (
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
      )
      break
    case 'Markdown':
      FieldEditor = <LazyMarkdownEditor key={key} />
      break
    case 'RichText':
      FieldEditor = <RichTextEditor key={String(key)} />
      break
    case 'Connect':
      FieldEditor = <ConnectEditor field={field} />
      break
    default:
      FieldEditor = <Input />
  }

  return FieldEditor
}

/**
 * 字段编辑表单
 */
export function getFieldFormItem(field: SchemaFieldV2, key: number) {
  const rules = getRules(field)
  const { name, type, description, displayName } = field

  let FieldEditor: any = getFieldEditor(field, key)
  let FormItem

  switch (type) {
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
          {FieldEditor}
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
          {FieldEditor}
        </Form.Item>
      )
      break
    default:
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          {FieldEditor}
        </Form.Item>
      )
  }

  // 弹性布局
  if (type === 'Markdown' || type === 'RichText') {
    return (
      <Col xs={24} sm={24} md={24} lg={24} xl={24} key={key}>
        {FormItem}
      </Col>
    )
  }

  return (
    <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12} key={key}>
      {FormItem}
    </Col>
  )
}
