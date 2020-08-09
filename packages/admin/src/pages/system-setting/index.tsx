import React from 'react'
import { Card, Row, Col, Divider, List, Button, Tag, Space, Typography } from 'antd'
import { history } from 'umi'
import { LeftCircleTwoTone } from '@ant-design/icons'
import UserManagement from './UserManagement'
import styles from './index.less'

export default (): React.ReactNode => {
    return (
        <Row className={styles.settings}>
            <Col flex="1 1 auto" />
            <Col flex="0 0 800px">
                <div className={styles.back} onClick={() => history.push('/home')}>
                    <Space align="center" style={{ marginBottom: '10px' }}>
                        <LeftCircleTwoTone style={{ fontSize: '20px' }} />
                        <h3 style={{ marginBottom: '0.2rem' }}>返回主页</h3>
                    </Space>
                </div>
                <Typography.Title level={3}>系统设置</Typography.Title>
                <Divider />
                <UserManagement />
            </Col>
            <Col flex="1 1 auto" />
        </Row>
    )
}
