import { Col, Row } from 'antd'
import React from 'react'

export interface IAppProps {
  className?: string
  children: React.ReactNode
}

export default function SettingContainer({ className, children }: IAppProps) {
  return (
    <Row className={className ? `p-20 ${className}` : 'p-20'}>
      <Col flex="1 1 auto" />
      <Col flex="0 0 1080px">{children}</Col>
      <Col flex="1 1 auto" />
    </Row>
  )
}
