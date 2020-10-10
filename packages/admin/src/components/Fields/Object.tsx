import React, { useState } from 'react'
import { Button, Modal, Space, Switch } from 'antd'
import ReactJson from 'react-json-view'

export const IObjectEditor: React.FC<{
  value?: any
  onChange?: (v: any) => void
}> = (props) => {
  const { value = {}, onChange = (v: any) => {} } = props

  return (
    <>
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
      />
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
      <Modal title="JSON 对象" visible={visible} onCancel={() => setVisible(false)}>
        <ReactJson
          name={false}
          src={value}
          style={{
            padding: '10px 0',
            borderRadius: '3px',
          }}
          collapsed={true}
          displayDataTypes={false}
        />
      </Modal>
    </>
  )
}
