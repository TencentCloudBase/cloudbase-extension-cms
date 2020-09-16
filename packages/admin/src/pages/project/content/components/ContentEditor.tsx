import React from 'react'
import { useParams, useRequest, history } from 'umi'
import { useConcent } from 'concent'
import { Form, message, Space, Button, Row, Col, Input } from 'antd'
import { createContent, updateContent } from '@/services/content'
import { getFieldFormItem } from './FieldComponents'
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

  const schema: SchemaV2 = schemas?.find((item: SchemaV2) => item._id === schemaId)

  // 表单初始值
  const initialValues = getInitialValues(contentAction, schema, selectedContent)
  // 创建/更新内容
  const { run, loading } = useRequest(
    async (payload: any) => {
      if (contentAction === 'create') {
        await createContent(projectId, schema?.collectionName, payload)
      }

      if (contentAction === 'edit') {
        await updateContent(projectId, schema?.collectionName, selectedContent._id, payload)
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
          <Row gutter={[24, 24]}>
            {contentAction === 'edit' && (
              <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <Form.Item label="文档 Id" name="_id">
                  <Input type="text" disabled />
                </Form.Item>
              </Col>
            )}
            {schema?.fields?.map((filed, index) => getFieldFormItem(filed, index))}
          </Row>

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
    </PageContainer>
  )
}

const getInitialValues = (action: string, schema: SchemaV2, selectedContent: any) => {
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
      let { type, name } = field
      // 布尔值默认为 false
      if (type === 'Boolean' && typeof selectedContent[name] !== 'boolean') {
        selectedContent[name] = false
      }
    })
  }
  return initialValues
}

export default ContentEditor
