import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRequest, useParams } from 'umi'
import { getProject, updateProject } from '@/services/project'
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

const ApiAccessPath: React.FC<{ project: Project; onReload: Function }> = ({
  project,
  onReload,
}) => {
  const { projectId } = useParams<any>()
  const accessDomain = window.TcbCmsConfig.cloudAccessPath.replace('tcb-ext-cms-service', '')
  const initialValues = useMemo(
    () => ({
      path: project.apiAccessPath,
    }),
    [project]
  )

  // 设置 API 访问路径
  const { loading, run: changeApiPath } = useRequest(
    async (v: { path: string }) => {
      try {
        await updateProject(projectId, {
          apiAccessPath: v?.path,
        })
        message.success('API 访问路径设置成功！')
        onReload()
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
        {!initialValues.path && (
          <Alert
            type="warning"
            message="请设定 API 访问路径，否则无法使用 API 访问"
            style={{ marginBottom: '10px' }}
          />
        )}
        <Form.Item
          label="使用 RESTful API 时的基础访问路径"
          name="path"
          rules={[
            { required: true, message: '请输入 API 访问的路径！' },
            {
              pattern: /^(?!\/).*$/,
              message: '路径无需以 / 开头',
            },
          ]}
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

const modifyArray = (collections: string[] = [], collection: string, add: boolean) => {
  // 过滤空集合
  const ret = collections.filter((_) => _ && _ !== collection)
  console.log(collection)
  add ? ret.push(collection) : _.remove(ret, (_) => _ === collection)
  console.log(ret)
  return ret
}

const ApiPermission: React.FC<{ project: Project; onReload: Function }> = ({
  project,
  onReload,
}) => {
  const { projectId } = useParams<any>()
  const { data: schemas } = useRequest(() => getSchemas(projectId))
  const [readableCollections, setReadableCollections] = useState<string[]>([])
  const [modifiableCollections, setModifiableCollections] = useState<string[]>([])

  const { run: changePermission, loading } = useRequest(
    async () => {
      await updateProject(projectId, {
        readableCollections,
        modifiableCollections,
      })
      onReload()
    },
    {
      manual: true,
      onSuccess: () => message.success('保存成功'),
      onError: (e) => message.error(`保存失败: ${e.message}`),
    }
  )

  useEffect(() => {
    if (project?._id) {
      setReadableCollections(project.readableCollections || [])
      setModifiableCollections(project.modifiableCollections || [])
    }
  }, [project])

  return (
    <>
      <Typography.Title level={3}>访问权限</Typography.Title>
      {schemas?.map((schema, index) => (
        <div key={index} className="mb-5">
          <Space>
            <span>{schema.displayName}</span>
            <Checkbox
              checked={readableCollections?.includes(schema.collectionName)}
              onChange={(e) => {
                setReadableCollections(
                  modifyArray(readableCollections, schema.collectionName, e.target.checked)
                )
              }}
            >
              允许访问
            </Checkbox>
            <Checkbox
              checked={modifiableCollections?.includes(schema.collectionName)}
              onChange={(e) =>
                setModifiableCollections(
                  modifyArray(modifiableCollections, schema.collectionName, e.target.checked)
                )
              }
            >
              允许修改
            </Checkbox>
          </Space>
        </div>
      ))}

      <Button type="primary" loading={loading} onClick={changePermission}>
        保存
      </Button>
    </>
  )
}

export default (): React.ReactElement => {
  const { projectId } = useParams<any>()
  const [reloadFlag, setReloadFlag] = useState(0)
  // 重新加载 project 信息
  const reload = useCallback(() => setReloadFlag(reloadFlag + 1), [reloadFlag])

  // 重新获取数据
  const { data: project, loading } = useRequest(() => getProject(projectId), {
    refreshDeps: [reloadFlag],
  })

  // 开启/关闭 API 访问
  const { loading: changeLoading, run: changeApiAccess } = useRequest(
    async (v: boolean) => {
      try {
        await updateProject(projectId, {
          enableApiAccess: v,
        })
        message.success(`${v ? '开启' : '关闭'} API 访问成功！`)
        reload()
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
        <Alert type="info" message="此项目未开启 API 访问" style={{ marginBottom: '10px' }} />
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
      <ApiAccessPath project={project} onReload={reload} />
      <Divider />
      <ApiPermission project={project} onReload={reload} />
    </>
  )
}
