import React from 'react'
import { useConcent } from 'concent'
import { useParams, useRequest, history } from 'umi'
import { Form, message, Space, Button, Row, Col, Input, Typography } from 'antd'
import { createContent, updateContent } from '@/services/content'
import { getFieldFormItem } from '@/components/Fields'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import { LeftCircleTwoTone } from '@ant-design/icons'
import {
  getDocInitialValues,
  getDocChangedValues,
  getProjectId,
  getSchemaCustomFields,
} from '@/utils'

const { Text } = Typography

const ContentEditor: React.FC = () => {
  const projectId = getProjectId()
  const { schemaId } = useParams<UrlParams>()
  const ctx = useConcent('content')
  const { selectedContent, contentAction } = ctx.state
  const {
    state: { schemas, currentSchema },
  } = ctx

  // 文档模型
  const schema: Schema = schemas?.find((item: Schema) => item._id === schemaId) || currentSchema

  // 表单初始值
  const initialValues = getDocInitialValues(contentAction, schema, selectedContent)

  // 创建/更新内容
  const { run, loading } = useRequest(
    async (payload: any) => {
      if (contentAction === 'create') {
        await createContent(projectId, schema?.collectionName, payload)
      }

      if (contentAction === 'edit') {
        // 只更新变更过的字段
        const updatedData = getDocChangedValues(initialValues, payload)
        await updateContent(projectId, schema?.collectionName, selectedContent._id, updatedData)
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
                <Form.Item label={<Text strong>文档 Id</Text>} name="_id">
                  <Input type="text" disabled />
                </Form.Item>
              )}

              {getSchemaCustomFields(schema).map((filed, index) => getFieldFormItem(filed, index))}

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

export default ContentEditor
