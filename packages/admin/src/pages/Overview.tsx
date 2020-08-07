import React from 'react'
import { Card } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import styles from './Overview.less'
import { useParams } from 'umi'

export default (): React.ReactNode => {
    const params = useParams()

    console.log(params)

    return (
        <PageContainer className={styles.container}>
            <Card>欢迎使用 CloudBase CMS</Card>
        </PageContainer>
    )
}
