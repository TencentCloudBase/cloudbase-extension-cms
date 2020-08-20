import React, { useState } from 'react'
import {
  Row,
  Col,
  Divider,
  List,
  Skeleton,
  Button,
  Tag,
  Space,
  message,
  Modal,
  Form,
  Input,
  Typography,
  Select,
} from 'antd'
import { useRequest, useParams } from 'umi'
import { getUsers, createUser, deleteUser, updateUser } from '@/services/user'
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons'
import { getSchemas } from '@/services/schema'
import { CmsRole, CmsRoleMap } from '@/constants'

const ActionMap = {
  get: '查询',
  update: '更新',
  delete: '删除',
  create: '创建',
  '*': '全部',
}

export default (): React.ReactElement => {
  const { projectId } = useParams()
  const [reload, setReload] = useState(0)
  const [selectedUser, setSelectedUser] = useState()
  const [modalVisible, setModalVisible] = useState(false)
  const [userAction, setUserAction] = useState<'create' | 'edit'>('create')
  // 获取用户列表
  const { data, loading } = useRequest(() => getUsers(projectId), {
    refreshDeps: [reload],
  })

  // 加载数据库集合
  const { data: schmeas = [], loading: schemaLoading } = useRequest<{
    data: SchemaV2[]
  }>(() => getSchemas(projectId))

  if (loading || schemaLoading) {
    return <Skeleton active />
  }

  return (
    <>
      <Typography.Title level={3}>成员管理</Typography.Title>
      <Divider />
      <List
        itemLayout="horizontal"
        locale={{
          emptyText: '项目成员为空',
        }}
        dataSource={data}
        renderItem={(item: any) => (
          <>
            <Row align="middle">
              <Col flex="1 1 auto">
                <Space direction="vertical">
                  <Typography.Title level={4}>{item.username}</Typography.Title>
                  <Tag color="#006eff">{CmsRoleMap[item.role]}</Tag>
                </Space>
                {item.collections?.length && (
                  <div style={{ marginTop: '15px' }}>
                    数据集合：
                    {item.collections?.map((collectionName: string) => {
                      if (collectionName === '*') {
                        return <Tag key={collectionName}>全部</Tag>
                      }
                      const schema = schmeas.find(
                        (schema) => schema.collectionName === collectionName
                      )

                      return <Tag key={collectionName}>{schema?.displayName || collectionName}</Tag>
                    })}
                    | 操作权限：
                    {item.actions?.map((_: string) => (
                      <Tag key={_}>{ActionMap[_]} </Tag>
                    ))}
                  </div>
                )}
              </Col>
              <Col span={4}>
                <Space>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      setUserAction('edit')
                      setSelectedUser(item)
                      setModalVisible(true)
                    }}
                  >
                    编辑
                  </Button>
                  <Button
                    danger
                    size="small"
                    type="primary"
                    onClick={() => {
                      Modal.confirm({
                        title: `确认删除用户 ${item.username} ？`,
                        onOk: async () => {
                          await deleteUser(item._id)
                          setReload(reload + 1)
                        },
                      })
                    }}
                  >
                    删除
                  </Button>
                </Space>
              </Col>
            </Row>
            <Divider style={{ margin: '15px 0' }} />
          </>
        )}
      />
      <Button
        type="primary"
        onClick={() => {
          setUserAction('create')
          setSelectedUser(undefined)
          setModalVisible(true)
        }}
      >
        添加
      </Button>
      <AddMemberModal
        action={userAction}
        visible={modalVisible}
        selectedUser={selectedUser}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false)
          setReload(reload + 1)
        }}
      />
    </>
  )
}

const AddMemberModal: React.FC<{
  visible: boolean
  action: 'create' | 'edit'
  selectedUser?: any
  onClose: () => void
  onSuccess: () => void
}> = ({ visible, onClose, onSuccess, action, selectedUser }) => {
  const { projectId } = useParams()
  const [formValue, setFormValue] = useState<any>({})

  // 创建成员
  const { run: addMember, loading } = useRequest(
    async (data: any) => {
      // 全部内容权限
      if (data.role === 'operator') {
        data.collections = ['*']
        data.actions = ['*']
      }

      if (action === 'create') {
        await createUser({
          ...data,
          projectId,
        })
      }

      if (action === 'edit') {
        const diffData = Object.keys(selectedUser)
          .filter((key) => selectedUser[key] !== data[key])
          .reduce(
            (ret, key) => ({
              ...ret,
              [key]: data[key],
            }),
            {}
          )

        await updateUser(selectedUser._id, { ...diffData, projectId })
      }

      onSuccess()
    },
    {
      manual: true,
      onError: () => message.error(`${action === 'create' ? '添加' : '更新'}用户失败`),
      onSuccess: () => message.success(`${action === 'create' ? '添加' : '更新'}用户成功`),
    }
  )

  // 加载数据库集合
  const { data: schmeas = [], loading: schemaLoading, run: loadSchemas } = useRequest(
    () => getSchemas(projectId),
    {
      manual: true,
    }
  )

  return (
    <Modal
      centered
      destroyOnClose
      footer={null}
      visible={visible}
      onOk={() => onClose()}
      onCancel={() => onClose()}
      title={`${action === 'create' ? '新建' : '编辑'}用户`}
    >
      <Form
        layout="vertical"
        labelAlign="left"
        labelCol={{ span: 6 }}
        initialValues={selectedUser}
        onFinish={(v = {}) => {
          addMember(v)
        }}
        onValuesChange={(_: any, v: any) => {
          setFormValue(v)

          if (v.role === 'other') {
            loadSchemas()
          }
        }}
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[
            {
              required: true,
              pattern: /^[a-zA-Z]{4,}$/,
              message: '用户名不符合规则！',
            },
          ]}
        >
          <Input placeholder="仅支持大小写字母，不能小于 4 位" />
        </Form.Item>

        <Form.Item
          label="用户密码"
          name="password"
          rules={[{ required: true, message: '请输入项目介绍！' }]}
        >
          <Input.Password
            placeholder="输入密码"
            visibilityToggle={action === 'create'}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Form.Item
          label="用户角色"
          name="role"
          rules={[{ required: true, message: '请选择用户角色！' }]}
        >
          <Select>
            <Select.Option value={CmsRole.ProjectAdmin}>项目管理员 - 此项目全部权限</Select.Option>
            <Select.Option value="">项目内容管理员 - 此项目全部【内容】操作权限</Select.Option>
            <Select.Option value={CmsRole.ProjectCustom}>
              项目自定义 - 此项目自定义【内容】操作权限
            </Select.Option>
          </Select>
        </Form.Item>

        {formValue?.role === 'other' && (
          <>
            <Form.Item
              label="内容集合"
              name="collections"
              rules={[{ required: true, message: '请选择内容集合！' }]}
            >
              <Select mode="multiple" loading={schemaLoading}>
                {schmeas?.map((schema: any) => (
                  <Select.Option key={schema._id} value={schema.collectionName}>
                    {schema.displayName}
                  </Select.Option>
                ))}
                <Select.Option key="*" value="*">
                  全部内容
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="操作权限"
              name="actions"
              rules={[{ required: true, message: '请选择操作权限！' }]}
            >
              <Select mode="multiple">
                <Select.Option value="*">全部操作</Select.Option>
                <Select.Option value="get">查询内容</Select.Option>
                <Select.Option value="create">创建内容</Select.Option>
                <Select.Option value="update">修改内容</Select.Option>
                <Select.Option value="delete">删除内容</Select.Option>
              </Select>
            </Form.Item>
          </>
        )}

        <Form.Item>
          <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => onClose()}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {`${action === 'create' ? '新建' : '更新'}`}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
