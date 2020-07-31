import React from 'react'
import { PoundCircleTwoTone } from '@ant-design/icons'
import { Card, Typography, Layout, Row, Col, Skeleton } from 'antd'
import { history, useRequest } from 'umi'

import { t } from '@lang'
import { getProjects } from '@/services/project'
import styles from './index.less'

const { Header, Content } = Layout

export default (): React.ReactNode => {
    const { data = [], loading } = useRequest(() => getProjects())

    if (loading) {
        return <Skeleton active />
    }

    return (
        <Layout className={styles.home}>
            <Header className={styles.header}>
                <img className={styles.logo} src="/img/logo.png" alt="logo" />
                <span>CloudBase CMS</span>
            </Header>
            <Content className={styles.content}>
                <Row gutter={[24, 40]}>
                    <Col offset={4}>
                        <Typography.Title level={4}>{t('project.my-project')}</Typography.Title>
                    </Col>
                </Row>
                <Row gutter={[24, 40]}>
                    {data.map((project, index) => (
                        <Col xs={{ span: 6, offset: 2 }} lg={{ span: 4, offset: 4 }} key={index}>
                            <Card
                                style={{
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    history.push(`/${project._id}/home`)
                                }}
                            >
                                <div
                                    className={styles.project}
                                    onClick={() => {
                                        history.push('/')
                                    }}
                                >
                                    <PoundCircleTwoTone style={{ fontSize: '60px' }} />
                                    <h4 className={styles.title}>{project.name}</h4>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Content>
        </Layout>
    )
}
