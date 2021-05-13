import React, { useState } from 'react'
import { Alert, Button, Col, Form, Input, Modal, Row, Space, Switch } from 'antd'
import ReactJson from 'react-json-view'

export const IObjectEditor: React.FC<{
  value?: any
  onChange?: (v: any) => void
}> = (props) => {
  const { value = {}, onChange = (v: any) => {} } = props
  const [visible, setVisible] = useState(false)

  return (
    <>
      <Row justify="space-between">
        <Col>
          <h4 className="mb-0">点击下方对象进行编辑</h4>
        </Col>
        <Col>
          <Space size="large">
            <Space>
              <Switch
                onChange={(v) => {
                  if (v) {
                    onChange([value])
                  } else {
                    const json = Array.isArray(value) ? value[0] || {} : value
                    onChange(json)
                  }
                }}
              />
              JSON 数组
            </Space>
            <Button size="small" type="primary" onClick={() => setVisible(true)}>
              JSON 字符串
            </Button>
          </Space>
        </Col>
      </Row>

      <ReactJson
        name={false}
        src={value}
        style={{
          padding: '10px 0',
          borderRadius: '3px',
        }}
        collapsed={true}
        displayDataTypes={false}
        onEdit={(e) => {
          onChange(e.updated_src)
        }}
        onDelete={(e) => {
          onChange(e.updated_src)
        }}
        onAdd={(e) => {
          onChange(e.updated_src)
        }}
        collapseStringsAfterLength={64}
      />

      <Modal
        centered
        footer={null}
        title="JSON 对象快捷输入"
        visible={visible}
        onCancel={() => setVisible(false)}
      >
        <Alert message="输入的字符串将被格式化后，替换当前值" />
        <br />
        <Form
          onFinish={({ json }) => {
            setVisible(false)
            onChange(JSON.parse(json))
          }}
        >
          <Form.Item
            name="json"
            label="JSON 字符串"
            rules={[
              {
                required: true,
                message: '输入 JSON 字符串',
              },
              {
                validator: (_, value) => {
                  try {
                    const json = JSON.parse(value)
                    if (typeof json !== 'object') {
                      return Promise.reject('非法的 JSON 字符串')
                    }
                    return Promise.resolve()
                  } catch (error) {
                    return Promise.reject('非法的 JSON 字符串')
                  }
                },
              },
            ]}
          >
            <Input.TextArea autoSize={{ minRows: 5 }} placeholder="输入合法 JSON 对象字符串" />
          </Form.Item>
          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                确认
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export const IObjectRender: React.FC<{
  value?: any
}> = (props) => {
  const { value } = props
  const [visible, setVisible] = useState(false)

  if (typeof value === 'undefined' || value === null) {
    return <span>空</span>
  }

  return (
    <>
      <Space>
        <Button type="link" onClick={() => setVisible(true)}>
          查看
        </Button>
      </Space>
      <Modal centered title="JSON 对象" visible={visible} onCancel={() => setVisible(false)}>
        <ReactJson
          name={false}
          src={value}
          style={{
            padding: '10px 0',
            borderRadius: '3px',
          }}
          collapsed={true}
          displayDataTypes={false}
          collapseStringsAfterLength={32}
        />
      </Modal>
    </>
  )
}
