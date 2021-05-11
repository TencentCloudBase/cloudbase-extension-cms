import React from 'react'
import styled from 'styled-components'
import { MessageOutlined, CodeSandboxOutlined } from '@ant-design/icons'
import { Layout, Space, Button, Skeleton, Tooltip, Popover } from 'antd'
import AvatarDropdown from '@/components/AvatarDropdown'
import { getCmsConfig } from '@/utils'
import Notice from './Notice'
import pkg from '../../../package.json'
import './index.less'

const { Header, Content, Footer } = Layout

const HelpButton = styled.div`
  position: fixed;
  bottom: 40px;
  right: 40px;
`

const IconStyle: React.CSSProperties = {
  fontSize: '1.8em',
  fontWeight: 'bold',
  color: '#fff',
}

const HomePageContainer: React.FC<{ loading: boolean; isMobile?: boolean }> = ({
  children,
  loading,
  isMobile,
}) => {
  return (
    <Layout className="home">
      <Header className="header">
        <div className="left">
          <img className="logo" src={getCmsConfig('cmsLogo')} alt="logo" />
          <h1 className="title">{getCmsConfig('cmsTitle')}</h1>
        </div>
        <div className="right">
          {SERVER_MODE && !isMobile && (
            <Tooltip title="当前 CMS 以容器服务模式运行">
              <CodeSandboxOutlined
                style={{
                  ...IconStyle,
                  marginTop: '3px',
                  marginRight: '10px',
                }}
              />
            </Tooltip>
          )}
          {window.TcbCmsConfig.disableNotice ? null : <Notice />}
          <AvatarDropdown />
        </div>
      </Header>

      <Content className="content">
        {loading ? (
          <div style={{ minWidth: '600px' }}>
            <Skeleton active />
          </div>
        ) : (
          children
        )}
      </Content>
      <Footer className="text-center">
        {getCmsConfig('cmsTitle')}&nbsp;
        {pkg.version}
        {SERVER_MODE && ` - Stone`}
      </Footer>

      {/* 悬浮按钮 */}
      <HelpButton>
        {window.TcbCmsConfig.disableHelpButton ? null : (
          <Popover
            placement="topLeft"
            title="帮助"
            content={
              <Space>
                <Button type="primary">
                  <a href={getCmsConfig('cmsDocLink')} target="_blank">
                    文档
                  </a>
                </Button>
                <Button type="primary">
                  <a href={getCmsConfig('cmsHelpLink')} target="_blank">
                    反馈
                  </a>
                </Button>
              </Space>
            }
            trigger="click"
          >
            <Button size="large" type="primary" shape="circle" icon={<MessageOutlined />} />
          </Popover>
        )}
      </HelpButton>
    </Layout>
  )
}

export default HomePageContainer
