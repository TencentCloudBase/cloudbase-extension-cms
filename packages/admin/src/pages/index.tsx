import React, { useState, useEffect } from 'react'
import {
  PlusSquareTwoTone,
  BellOutlined,
  MessageOutlined,
  setTwoToneColor,
  CodeSandboxOutlined,
} from '@ant-design/icons'
import {
  Card,
  Layout,
  Modal,
  Form,
  Input,
  Space,
  Button,
  message,
  Skeleton,
  Tooltip,
  Typography,
  Badge,
  Drawer,
  Switch,
  Timeline,
  Popover,
  Empty,
} from 'antd'
import { useConcent } from 'concent'
import { history, useRequest, useAccess } from 'umi'
import AvatarDropdown from '@/components/AvatarDropdown'
import { getProjects, createProject } from '@/services/project'
import { getCmsNotices } from '@/services/notice'
import { getCmsConfig, getFullDate } from '@/utils'
import './index.less'
import pkg from '../../package.json'

// 设置图标颜色
setTwoToneColor('#0052d9')

const { Header, Content, Footer } = Layout
const IconStyle: React.CSSProperties = {
  fontSize: '1.8em',
  fontWeight: 'bold',
  color: '#fff',
}

export default (): React.ReactNode => {
  const ctx = useConcent('$$global')
  const [reload, setReload] = useState(0)
  const { data = [], loading } = useRequest(() => getProjects(), {
    refreshDeps: [reload],
  })

  const { isAdmin } = useAccess()

  return (
    <HomePage loading={loading}>
      <Typography.Title level={3}>我的项目</Typography.Title>
      <div className="project-cards mt-10">
        {data?.length ? (
          <>
            {data.map((project: any, index: any) => (
              <Card
                hoverable
                key={index}
                bordered={false}
                onClick={() => {
                  ctx.setState({
                    currentProject: project,
                  })
                  history.push(`/${project._id}/home`)
                }}
                style={{ borderRadius: '5px' }}
              >
                <div
                  className="w-full flex flex-col items-center mt-12"
                  onClick={() => {
                    history.push('/home')
                  }}
                >
                  <div className="project-logo">{project.name.slice(0, 2)}</div>
                  <Tooltip title={project.description}>
                    <Typography.Title
                      level={4}
                      ellipsis={{ rows: 2, expandable: false }}
                      className="mt-4 max-w-80 text-center"
                    >
                      {project.name}
                    </Typography.Title>
                  </Tooltip>
                </div>
              </Card>
            ))}
          </>
        ) : (
          <div className="empty-tip">
            <Empty description="项目为空，请先创建项目后再操作" />
          </div>
        )}
      </div>

      {/* 新项目创建 */}
      {isAdmin && <ProjectCreateSection onReload={() => setReload(reload + 1)} />}
    </HomePage>
  )
}

const HomePage: React.FC<{ loading: boolean }> = ({ children, loading }) => {
  return (
    <Layout className="home">
      <Header className="header">
        <div className="left">
          <img className="logo" src={getCmsConfig('cmsLogo')} alt="logo" />
          <h1 className="title">{getCmsConfig('cmsTitle')}</h1>
        </div>
        <div className="right">
          {SERVER_MODE && (
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
          {window.TcbCmsConfig.disableNotice ? null : <NoticeRender />}
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
      <div className="help-btn">
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
      </div>
    </Layout>
  )
}

const START_TIME_KEY = 'noticeStartTime'

export const NoticeRender: React.FC = () => {
  const [noticeVisible, setNoticeVisible] = useState(false)
  const [notices, setNotices] = useState<any>([])
  const [unReadNoticeCount, setUnreadNoticeCount] = useState(0)

  // 设置全部已读
  const readAllNotices = () => {
    // 全部已读后，不可回退
    if (unReadNoticeCount === 0) {
      return
    }
    // 更新未读消息数量
    setUnreadNoticeCount(0)
    // 使用最新消息的时间作为开始时间戳
    localStorage.setItem(START_TIME_KEY, new Date(notices[0]?.noticeTime).getTime().toString())
  }

  // 获取未读消息
  const getNotices = async () => {
    let startTime = parseInt(localStorage.getItem(START_TIME_KEY) || '0', 10)
    if (isNaN(startTime)) {
      // 默认拉取过去2个月的未读消息
      startTime = Date.now() - 1000 * 60 * 60 * 24 * 60
    }

    const { notices } = await getCmsNotices(startTime)
    setNotices(notices)
    setUnreadNoticeCount(notices.length)
  }

  useEffect(() => {
    getNotices()
  }, [])

  return (
    <>
      <Button
        style={{
          marginRight: '10px',
        }}
        type="text"
        onClick={() => {
          if (notices.length) {
            setNoticeVisible(true)
          } else {
            message.info('没有新消息')
          }
        }}
      >
        <Badge count={unReadNoticeCount} overflowCount={10}>
          <BellOutlined style={IconStyle} />
        </Badge>
      </Button>
      <Drawer
        width={550}
        title={
          <Switch
            checkedChildren="全部已读"
            unCheckedChildren="标记为已读"
            checked={unReadNoticeCount === 0}
            onChange={readAllNotices}
          />
        }
        placement="right"
        closable={true}
        onClose={() => setNoticeVisible(false)}
        visible={noticeVisible}
      >
        <Timeline mode="left">
          {notices.map((notice: any) => (
            <Timeline.Item key={notice._id} color="blue">
              <h3>{getFullDate(notice.noticeTime)}</h3>
              <h3>{notice.noticeTitle}</h3>
              <p>{notice.noticeContent}</p>
            </Timeline.Item>
          ))}
        </Timeline>
      </Drawer>
    </>
  )
}

export const ProjectCreateSection: React.FC<{
  onReload: () => void
}> = ({ onReload }) => {
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <>
      <Typography.Title level={3}>新建项目</Typography.Title>
      <div className="project-cards mt-10">
        <Card
          hoverable
          bordered={false}
          style={{ borderRadius: '5px' }}
          onClick={() => {
            setModalVisible(true)
          }}
        >
          <div className="w-full flex flex-col items-center justify-start mt-12" onClick={() => {}}>
            <PlusSquareTwoTone style={{ fontSize: '60px' }} />
            <Typography.Title level={4} className="mt-5">
              创建新项目
            </Typography.Title>
          </div>
        </Card>
      </div>
      <ProjectCreateModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false)
          onReload()
        }}
      />
    </>
  )
}

export const ProjectCreateModal: React.FC<{
  visible: boolean
  onSuccess: () => void
  onClose: () => void
}> = ({ visible, onClose, onSuccess }) => {
  const { run, loading } = useRequest(
    async (data: any) => {
      await createProject(data)
      onSuccess()
    },
    {
      manual: true,
      onError: () => message.error('创建项目失败'),
      onSuccess: () => message.success('创建项目成功'),
    }
  )

  return (
    <Modal
      centered
      title="创建项目"
      footer={null}
      visible={visible}
      onOk={() => onClose()}
      onCancel={() => onClose()}
    >
      <Form
        name="basic"
        layout="vertical"
        labelCol={{ span: 6 }}
        labelAlign="left"
        onFinish={(v = {}) => {
          run(v)
        }}
      >
        <Form.Item
          label="项目名"
          name="name"
          rules={[{ required: true, message: '请输入项目名！' }]}
        >
          <Input placeholder="项目名，如官网" />
        </Form.Item>

        <Form.Item
          label="项目 Id"
          name="customId"
          rules={[
            { required: true, message: '请输入项目 Id！' },
            {
              pattern: /^[a-zA-Z0-9]{1,16}$/,
              message: '项目 Id 仅支持字母与数字，不大于 16 个字符',
            },
          ]}
        >
          <Input placeholder="项目 Id，如 website，仅支持字母与数字，不大于 16 个字符" />
        </Form.Item>

        <Form.Item label="项目介绍" name="description">
          <Input placeholder="项目介绍，如官网内容管理" />
        </Form.Item>

        <Form.Item>
          <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => onClose()}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              创建
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
