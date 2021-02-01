import React from 'react'
import { Tabs, Row, Col } from 'antd'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import ProjectInfo from './ProjectInfo'
import ApiAccess from './ApiAccess'

const { TabPane } = Tabs

const TabPaneContent: React.FC = ({ children }) => (
  <Row>
    <Col flex="1 1 auto" />
    <Col flex="0 0 600px">{children}</Col>
    <Col flex="1 1 auto" />
  </Row>
)

export default (): React.ReactNode => {
  return (
    <PageContainer>
      <ProCard>
        <Tabs tabPosition="left" defaultActiveKey="1">
          <TabPane tab="项目" key="1">
            <TabPaneContent>
              <ProjectInfo />
            </TabPaneContent>
          </TabPane>

          <TabPane tab="API 访问" key="2">
            <TabPaneContent>
              <ApiAccess />
            </TabPaneContent>
          </TabPane>
        </Tabs>
      </ProCard>
    </PageContainer>
  )
}
