import React from 'react'
import styled from 'styled-components'
import { useSetState } from 'react-use'
import { useRequest, useAccess } from 'umi'
import { useLocalStorageState } from '@umijs/hooks'
import { setTwoToneColor, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { Modal, Form, Input, Space, Button, message, Tooltip, Typography, Empty } from 'antd'
import { getProjects, createProject } from '@/services/project'
import { getPageQuery } from '@/utils'
import ProjectListView from './ProjectListView'
import ProjectCardView from './ProjectCardView'
import HomePageContainer from './HomePageContainer'
import './index.less'

// 设置图标颜色
setTwoToneColor('#0052d9')

const toggleIconStyle: React.CSSProperties = {
  fontSize: '1.6em',
  fontWeight: 'bold',
  color: '#0052d9',
}

const ToggleIcon = styled.div`
  padding: 3px;
  border-radius: 3px;
  transition: background-color 0.3s;
  &:hover {
    background-color: #d9d9d9;
  }
`

export default (): React.ReactNode => {
  // 项目分组
  const { groups } = window.TcbCmsConfig
  const { group } = getPageQuery()
  const { isAdmin } = useAccess()
  // 布局设置持久化到本地
  const [currentLayout, setLocalLayout] = useLocalStorageState('TCB_CMS_PROJECT_LAYOUT', 'card')
  const [{ modalVisible, reload, currentGroup }, setState] = useSetState({
    reload: 0,
    modalVisible: false,
    currentGroup: group || groups?.[0]?.key,
  })

  // 请求数据
  let { data = [], loading } = useRequest(() => getProjects(), {
    refreshDeps: [reload],
  })

  // 展示创建项目的弹窗
  const showCreatingModal = () =>
    setState({
      modalVisible: true,
    })

  // 过滤分组，group 默认为 default
  data = groups?.length
    ? data.filter((_) => (_.group ? _.group?.includes(currentGroup) : currentGroup === 'default'))
    : data

  return (
    <HomePageContainer loading={loading}>
      <div className="flex items-center justify-between mb-10">
        <div className="flex flex-row items-center">
          {groups?.length ? (
            groups.map((group) => (
              <Typography.Title
                level={3}
                key={group.key}
                onClick={() =>
                  setState({
                    currentGroup: group.key,
                  })
                }
                className="mr-5 my-0 cursor-pointer"
                style={{
                  color: currentGroup === group.key ? '#0052d9' : '#9CA3AF',
                }}
              >
                {group.title}
              </Typography.Title>
            ))
          ) : (
            <Typography.Title level={3}>我的项目</Typography.Title>
          )}
        </div>
        <Tooltip title="切换布局">
          <ToggleIcon
            className="flex items-center justify-between cursor-pointer"
            onClick={() => {
              setLocalLayout(currentLayout === 'card' ? 'list' : 'card')
            }}
          >
            {currentLayout === 'card' ? (
              <UnorderedListOutlined style={toggleIconStyle} />
            ) : (
              <AppstoreOutlined style={toggleIconStyle} />
            )}
          </ToggleIcon>
        </Tooltip>
      </div>

      {!isAdmin && !data?.length && (
        <Empty description="项目为空，请联系您的管理员为您分配项目！" />
      )}

      {currentLayout === 'card' ? (
        <ProjectCardView projects={data} onCreateProject={showCreatingModal} />
      ) : (
        <ProjectListView projects={data} onCreateProject={showCreatingModal} />
      )}

      {/* 新项目创建 */}
      {isAdmin && (
        <ProjectCreateModal
          visible={modalVisible}
          onClose={() => setState({ modalVisible: false })}
          onSuccess={() => {
            setState({
              reload: reload + 1,
              modalVisible: false,
            })
          }}
        />
      )}
    </HomePageContainer>
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
          label="项目 ID"
          name="customId"
          rules={[
            { required: true, message: '请输入项目 ID！' },
            {
              pattern: /^[a-zA-Z0-9]{1,16}$/,
              message: '项目 ID 仅支持字母与数字，不大于 16 个字符',
            },
          ]}
        >
          <Input placeholder="项目 ID，如 website，仅支持字母与数字，不大于 16 个字符" />
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
