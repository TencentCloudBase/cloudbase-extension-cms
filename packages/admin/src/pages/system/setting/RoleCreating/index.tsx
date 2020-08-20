import React, { useState } from 'react'
import { history, useRequest } from 'umi'
import { LeftCircleTwoTone } from '@ant-design/icons'
import { createUserRole } from '@/services/role'
import { Row, Col, Space, Typography, Steps, message, Card } from 'antd'
import RolePermission from './RolePermission'
import RoleInfo from './RoleInfo'
import './index.less'

const { Step } = Steps

export default (): React.ReactNode => {
  const [formValue, setFormValue] = useState<any>({})
  const [currentStep, setCurrentStep] = useState(0)

  const { run, loading } = useRequest(
    async (role: any) => {
      await createUserRole(role)
      history.push('/settings?tab=role')
    },
    {
      manual: true,
      onError: () => message.error('创建角色失败'),
      onSuccess: () => message.success('创建角色成功'),
    }
  )

  return (
    <Row className="role-create">
      <Col flex="1 1 auto" />
      <Col flex="0 0 1000px">
        <div className="back" onClick={() => history.goBack()}>
          <Space align="center" style={{ marginBottom: '20px' }}>
            <LeftCircleTwoTone style={{ fontSize: '20px' }} />
            <h3 style={{ marginBottom: '0.2rem' }}>返回</h3>
          </Space>
        </div>
        <Typography.Title level={3}>创建角色</Typography.Title>
        <Card style={{ minHeight: '480px' }}>
          <Steps current={currentStep}>
            <Step title="角色信息" />
            <Step title="角色权限" />
            {/* <Step title="审阅" /> */}
          </Steps>

          <div style={{ paddingTop: '20px' }}>
            {currentStep === 0 && (
              <RoleInfo
                initialValues={formValue}
                onConfrim={(v) => {
                  setFormValue({
                    ...formValue,
                    ...v,
                  })
                  setCurrentStep(currentStep + 1)
                }}
              />
            )}

            {currentStep === 1 && (
              <RolePermission
                creating={loading}
                initialValues={formValue}
                onConfirm={(v) => {
                  run({
                    ...formValue,
                    ...v,
                  })
                }}
                onPrevious={() => {
                  setCurrentStep(0)
                }}
              />
            )}
          </div>
        </Card>
      </Col>
      <Col flex="1 1 auto" />
    </Row>
  )
}
