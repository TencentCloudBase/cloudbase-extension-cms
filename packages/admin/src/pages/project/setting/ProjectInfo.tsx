import React, { useState } from 'react'
import { useRequest, history } from 'umi'
import { getProject, updateProject, deleteProject } from '@/services/project'
import { Divider, Button, Space, Typography, Form, Input, Skeleton, Modal, message } from 'antd'
import { getProjectId } from '@/utils'

const ProjectDangerAction: React.FC<{ project: Project }> = ({ project }) => {
  const projectId = getProjectId()
  const [modalVisible, setModalVisible] = useState(false)
  const [projectName, setProjectName] = useState('')

  // 删除项目
  const { run, loading } = useRequest(
    async () => {
      await deleteProject(projectId)
      setModalVisible(false)
      message.success('删除项目成功')
      setTimeout(() => {
        history.push('/home')
      }, 2000)
    },
    {
      manual: true,
    }
  )

  return (
    <>
      <Typography.Title level={3}>危险操作</Typography.Title>
      <Divider />
      <Button
        danger
        type="primary"
        onClick={() => {
          setModalVisible(true)
        }}
      >
        删除项目
      </Button>
      <Modal
        centered
        title="删除项目"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => run()}
        okButtonProps={{
          loading,
          disabled: projectName !== project.name,
        }}
      >
        <Space direction="vertical">
          <Typography.Paragraph strong>
            删除项目会删除项目中的内容模型及 Webhooks 等数据
          </Typography.Paragraph>
          <Typography.Paragraph strong>
            删除项目是不能恢复的，您确定要删除此项目吗？
            如果您想继续，请在下面的方框中输入此项目的名称：
            <Typography.Text strong mark>
              {project.name}
            </Typography.Text>
          </Typography.Paragraph>
          <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        </Space>
      </Modal>
    </>
  )
}

export default (): React.ReactElement => {
  const projectId = getProjectId()
  const [reload, setReload] = useState(0)
  const [changed, setChanged] = useState(false)
  const { data: project, loading } = useRequest<{ data: Project }>(() => getProject(projectId), {
    refreshDeps: [reload],
  })

  const { run, loading: updateLoading } = useRequest(
    async (payload: Partial<Project>) => {
      await updateProject(projectId, payload)
      setChanged(false)
      setReload(reload + 1)
      message.success('项目更新成功！')
    },
    {
      manual: true,
    }
  )

  if (loading || !project) {
    return <Skeleton />
  }

  return (
    <>
      <Typography.Title level={3}>项目信息</Typography.Title>
      <Divider />
      <Form
        name="basic"
        layout="vertical"
        labelAlign="left"
        initialValues={project}
        onFinish={(v = {}) => {
          run(v)
        }}
        onValuesChange={(_, v: Partial<Project>) => {
          if (v.name !== project?.name || v.description !== project.description) {
            setChanged(true)
          } else {
            setChanged(false)
          }
        }}
      >
        <Form.Item label="项目 ID">
          <Typography.Paragraph copyable>{project?._id}</Typography.Paragraph>
        </Form.Item>
        <Form.Item
          label="项目名"
          name="name"
          rules={[{ required: true, message: '请输入项目名！' }]}
        >
          <Input placeholder="项目名，如官网" />
        </Form.Item>

        <Form.Item label="项目介绍" name="description">
          <Input placeholder="项目介绍，如官网内容管理" />
        </Form.Item>

        <Form.Item>
          <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" htmlType="submit" disabled={!changed} loading={updateLoading}>
              保存
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <ProjectDangerAction project={project} />
    </>
  )
}
