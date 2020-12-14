import React from 'react'
import { useParams, useRequest, history } from 'umi'
import { useConcent } from 'concent'
import { Form, message, Space, Button, Row, Col, Input } from 'antd'
import { createContent, setContent } from '@/services/content'
import { getFieldFormItem } from '@/components/Fields'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import { LeftCircleTwoTone } from '@ant-design/icons'

const ContentEditor: React.FC = () => {
  const { schemaId, projectId } = useParams<any>()
  const ctx = useConcent('content')
  const { selectedContent, contentAction } = ctx.state
  const {
    state: { schemas },
  } = ctx

  const schema: Schema = schemas?.find((item: Schema) => item._id === schemaId)

  // 表单初始值
  const initialValues = getInitialValues(contentAction, schema, selectedContent)

  // 创建/更新内容
  const { run, loading } = useRequest(
    async (payload: any) => {
      if (contentAction === 'create') {
        await createContent(projectId, schema?.collectionName, payload)
      }

      if (contentAction === 'edit') {
        await setContent(projectId, schema?.collectionName, selectedContent._id, payload)
      }
    },
    {
      manual: true,
      onError: () => {
        message.error(`${contentAction === 'create' ? '新建' : '更新'}内容失败`)
      },
      onSuccess: () => {
        message.success(`${contentAction === 'create' ? '新建' : '更新'}内容成功`)
        // 返回
        history.goBack()
      },
    }
  )

  return (
    <PageContainer
      title={`${contentAction === 'create' ? '创建' : '更新'}【${schema?.displayName}】内容`}
    >
      <Row>
        <Col
          md={{ span: 24, offset: 0 }}
          lg={{ span: 20, offset: 2 }}
          xl={{ span: 18, offset: 3 }}
          xxl={{ span: 16, offset: 4 }}
        >
          <div style={{ cursor: 'pointer' }} onClick={() => history.goBack()}>
            <Space align="center" style={{ marginBottom: '10px' }}>
              <LeftCircleTwoTone style={{ fontSize: '20px' }} />
              <h3 style={{ marginBottom: '0.25rem' }}>返回</h3>
            </Space>
          </div>
          <ProCard>
            <Form
              name="basic"
              layout="vertical"
              initialValues={initialValues}
              onFinish={(v = {}) => run(v)}
            >
              {contentAction === 'edit' && (
                <Form.Item label="文档 Id" name="_id">
                  <Input type="text" disabled />
                </Form.Item>
              )}

              {schema?.fields
                ?.filter((_) => !_.isSystem && !_.isHidden)
                .map((filed, index) => getFieldFormItem(filed, index))}

              <Form.Item>
                <Row>
                  <Col flex="1 1 auto" style={{ textAlign: 'right' }}>
                    <Space size="large">
                      <Button
                        onClick={() => {
                          history.goBack()
                        }}
                      >
                        取消
                      </Button>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        {contentAction === 'create' ? '创建' : '更新'}
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  )
}

const getInitialValues = (action: string, schema: Schema, selectedContent: any) => {
  const initialValues =
    action === 'create'
      ? schema?.fields?.reduce((prev, field) => {
          let { type, defaultValue } = field
          // 布尔值默认为 false
          if (type === 'Boolean' && typeof defaultValue !== 'boolean') {
            defaultValue = false
          }
          return {
            ...prev,
            [field.name]: defaultValue,
          }
        }, {})
      : selectedContent

  if (action === 'edit') {
    schema?.fields?.forEach((field) => {
      let { type, name, isMultiple } = field

      const fieldValue = selectedContent[name]

      // 布尔值默认为 false
      if (type === 'Boolean' && typeof fieldValue !== 'boolean') {
        selectedContent[name] = false
      }

      // 如果字段是 multiple 类型，将异常的字符串值，转换为正常的数组
      if (isMultiple && typeof fieldValue === 'string') {
        selectedContent[name] = [fieldValue]
      }
    })
  }
  return initialValues
}

export default ContentEditor
