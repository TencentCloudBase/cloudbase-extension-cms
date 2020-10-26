import React, { useCallback, useMemo, useState } from 'react'
import { useRequest, useParams, history } from 'umi'
import { getProject, updateProject, deleteProject } from '@/services/project'
import {
  Divider,
  Button,
  Space,
  Typography,
  Form,
  Input,
  message,
  Switch,
  Skeleton,
  Alert,
  Checkbox,
} from 'antd'
import { getSchemas } from '@/services/schema'
import { schema } from '@/models'

const ApiAccessPath: React.FC<{ project: Project }> = ({ project }) => {
  const { projectId } = useParams<any>()
  const accessDomain = window.TcbCmsConfig.cloudAccessPath.replace('tcb-ext-cms-service', '')
  const initialValues = useMemo(
    () => ({
      path: project.apiAccessPath,
    }),
    [project]
  )

  // 开启/关闭 API 访问
  const { loading, run: changeApiPath } = useRequest(
    async (v: { path: string }) => {
      try {
        await updateProject(projectId, {
          apiAccessPath: v?.path,
        })
        message.success('API 访问路径设置成功！')
      } catch (e) {
        message.error(`更新失败 ${e.message}`)
      }
    },
    {
      manual: true,
      refreshDeps: [projectId],
    }
  )

  return (
    <>
      <Typography.Title level={3}>访问路径</Typography.Title>
      <Form
        name="basic"
        layout="vertical"
        labelAlign="left"
        initialValues={initialValues}
        onFinish={(v = {}) => {
          changeApiPath(v)
        }}
      >
        <Form.Item
          label="使用 RESTful API 时的基础访问路径"
          name="path"
          rules={[{ required: true, message: '请输入 API 访问的路径！' }]}
        >
          <Input
            addonBefore={`https://${accessDomain}`}
            placeholder="API 访问的路径，如 rest-api"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" loading={loading} htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

const ApiPermission: React.FC<{ project: Project }> = () => {
  const { projectId } = useParams<any>()
  const [modalVisible, setModalVisible] = useState(false)
  const [projectName, setProjectName] = useState('')
  const { data: schemas } = useRequest(() => getSchemas(projectId))

  // // 删除项目
  // const { run, loading } = useRequest(
  //   async () => {
  //     await deleteProject(projectId)
  //     setModalVisible(false)
  //     message.success('删除项目成功')
  //     setTimeout(() => {
  //       history.push('/home')
  //     }, 2000)
  //   },
  //   {
  //     manual: true,
  //   }
  // )

  return (
    <>
      <Typography.Title level={3}>访问权限</Typography.Title>
      {schemas?.map((schema, index) => (
        <div key={index} className="mb-5">
          <Space>
            <span>{schema.displayName}</span>
            <Checkbox onChange={() => {}}>允许访问</Checkbox>
            <Checkbox onChange={() => {}}>允许修改</Checkbox>
          </Space>
        </div>
      ))}

      <Button
        danger
        type="primary"
        onClick={() => {
          setModalVisible(true)
        }}
      >
        删除项目
      </Button>
      {/* <Modal
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
      </Modal> */}
    </>
  )
}

export default (): React.ReactElement => {
  const { projectId } = useParams<any>()
  const [reload, setReload] = useState(0)
  const { data: project, loading } = useRequest(() => getProject(projectId), {
    refreshDeps: [reload],
  })

  // 开启/关闭 API 访问
  const { loading: changeLoading, run: changeApiAccess } = useRequest(
    async (v: boolean) => {
      try {
        await updateProject(projectId, {
          enableApiAccess: v,
        })
        message.success(`${v ? '开启' : '关闭'} API 访问成功！`)
        setReload(reload + 1)
      } catch (e) {
        message.error(`更新失败 ${e.message}`)
      }
    },
    {
      manual: true,
      refreshDeps: [projectId],
    }
  )

  if (loading) {
    return <Skeleton active />
  }

  if (!project?.enableApiAccess) {
    return (
      <>
        <Alert type="info" message="此项目未开启 API 访问" className="mb-5" />
        <Space>
          <Switch
            loading={changeLoading}
            checked={project?.enableApiAccess}
            onChange={changeApiAccess}
          />
          <span>启用 API 访问</span>
        </Space>
      </>
    )
  }

  return (
    <>
      <Space>
        <Switch
          loading={changeLoading}
          checked={project?.enableApiAccess}
          onChange={changeApiAccess}
        />
        <span>启用 API 访问</span>
      </Space>
      <Divider />
      <ApiAccessPath project={project} />
      <Divider />
      <ApiPermission project={project} />
    </>
  )
}
