import React from 'react'
import { history } from 'umi'
import ProCard from '@ant-design/pro-card'
import { LeftCircleTwoTone } from '@ant-design/icons'
import { Tabs, Row, Col, Space, Typography } from 'antd'
import UserManagement from './UserManagement'
import PolicyManagement from './PolicyManagement'
import styles from './index.less'

const { TabPane } = Tabs

export default (): React.ReactNode => {
    return (
        <Row className={styles.settings}>
            <Col flex="1 1 auto" />
            <Col flex="0 0 900px">
                <div className={styles.back} onClick={() => history.push('/home')}>
                    <Space align="center" style={{ marginBottom: '10px' }}>
                        <LeftCircleTwoTone style={{ fontSize: '20px' }} />
                        <h3 style={{ marginBottom: '0.2rem' }}>返回主页</h3>
                    </Space>
                </div>
                <Typography.Title level={3}>系统设置</Typography.Title>
                <ProCard>
                    <Tabs tabBarStyle={{ padding: '0 24px' }}>
                        <TabPane tab="用户" key="1">
                            <UserManagement />
                        </TabPane>
                        <TabPane tab="策略" key="2">
                            <PolicyManagement />
                        </TabPane>
                    </Tabs>
                </ProCard>
            </Col>
            <Col flex="1 1 auto" />
        </Row>
    )
}
