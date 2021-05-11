import { useConcent } from 'concent'
import { RoleCtx } from 'typings/store'
import React, { useState } from 'react'
import { history, useRequest } from 'umi'
import { LeftCircleTwoTone } from '@ant-design/icons'
import { createUserRole, updateUserRole } from '@/services/role'
import { Row, Col, Space, Typography, Steps, message, Card } from 'antd'
import RolePermission from './RolePermission'
import RoleInfo from './RoleInfo'

const { Step } = Steps

export default (): React.ReactNode => {
  const ctx = useConcent<{}, RoleCtx>('role')
  const { selectedRole, roleAction } = ctx.state
  const [currentStep, setCurrentStep] = useState(0)
  const [formValue, setFormValue] = useState<any>()

  const actionText = roleAction === 'edit' ? '更新' : '新建'

  const { run, loading } = useRequest(
    async (role: any) => {
      if (roleAction === 'edit') {
        await updateUserRole(selectedRole?._id, role)
      } else {
        await createUserRole(role)
      }

      history.push('/settings?tab=role')
    },
    {
      manual: true,
      onError: () => message.error(`${actionText}角色失败`),
      onSuccess: () => message.success(`${actionText}角色成功`),
    }
  )

  return (
    <Row className="pt-20">
      <Col flex="1 1 auto" />
      <Col flex="0 0 1080px">
        <div className="cursor-pointer" onClick={() => history.goBack()}>
          <Space align="center" style={{ marginBottom: '20px' }}>
            <LeftCircleTwoTone style={{ fontSize: '20px' }} />
            <h3 style={{ marginBottom: '0.2rem' }}>返回</h3>
          </Space>
        </div>
        <Typography.Title level={3}>{actionText}角色</Typography.Title>
        <Card style={{ minHeight: '480px' }}>
          <Steps current={currentStep}>
            <Step title="角色信息" />
            <Step title="角色权限" />
            {/* <Step title="审阅" /> */}
          </Steps>

          <div style={{ paddingTop: '20px' }}>
            {currentStep === 0 && (
              <RoleInfo
                initialValues={roleAction === 'edit' ? selectedRole : formValue}
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
                actionText={actionText}
                initialValues={roleAction === 'edit' ? selectedRole : formValue}
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
