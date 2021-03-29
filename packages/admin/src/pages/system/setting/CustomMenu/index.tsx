import { useConcent } from 'concent'
import React, { MutableRefObject, useRef } from 'react'
import { useSetState } from 'react-use'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Modal, message } from 'antd'
import { GlobalCtx } from 'typings/store'
import ProTable, { ProColumns } from '@ant-design/pro-table'
import { BoldText } from '@/components/Typography'
import { RefModalForm, ModalRefType } from '@/components/Modal'
import { ProFormDependency, ProFormSelect, ProFormText } from '@ant-design/pro-form'
import { getSetting } from '@/services/global'
import { random } from '@/utils'
import useRequest from '@umijs/use-request'

const columns: ProColumns[] = [
  {
    title: '菜单标题',
    dataIndex: 'title',
    key: 'title',
    width: 150,
    align: 'center',
  },
  {
    title: '微应用',
    dataIndex: 'microAppID',
    key: 'microAppID',
    align: 'center',
  },
  {
    title: '菜单链接',
    dataIndex: 'link',
    key: 'link',
    align: 'center',
  },
]

export default (): React.ReactElement => {
  const ctx = useConcent<{}, GlobalCtx>('global')

  const modalRef = useRef<ModalRefType>()
  const [{ configAction, parentNode }, setState] = useSetState<any>({
    configAction: 'create',
    parentNode: null,
  })

  const { data: customMenus, loading, run: reloadData } = useRequest(async () => {
    const { data: setting } = await getSetting()
    const customMenus = setting?.customMenus || []
    return customMenus
  }, {})

  return (
    <>
      <ProTable
        rowKey="id"
        search={false}
        options={false}
        loading={loading}
        dataSource={customMenus}
        columns={[
          ...columns,
          {
            title: '操作',
            width: 200,
            align: 'center',
            valueType: 'option',
            render: (text: any, row: any, i: number) => [
              <Button
                size="small"
                type="link"
                key="edit"
                onClick={() => {
                  setState({
                    parentNode: row,
                    configAction: 'create',
                  })
                  modalRef.current?.show?.()
                }}
              >
                <BoldText>新增</BoldText>
              </Button>,
              <Button
                size="small"
                type="link"
                key="edit"
                onClick={() => {
                  setState({
                    parentNode: row,
                    configAction: 'edit',
                  })
                  modalRef.current?.show?.()
                }}
              >
                <BoldText>编辑</BoldText>
              </Button>,
              <Button
                danger
                size="small"
                key="delete"
                type="text"
                onClick={() => {
                  const modal = Modal.confirm({
                    title: '确认删除此菜单？',
                    onCancel: () => {
                      modal.destroy()
                    },
                    onOk: async () => {
                      try {
                        deleteMenuItem(customMenus || [], row)
                        await ctx.mr.updateSetting({
                          customMenus,
                        })
                        message.success('删除菜单成功')
                      } catch (error) {
                        message.error('删除菜单失败')
                      }

                      reloadData()
                    },
                  })
                }}
              >
                <BoldText>删除</BoldText>
              </Button>,
            ],
          },
        ]}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setState({
                parentNode: null,
                configAction: 'create',
              })

              modalRef.current?.show?.()
            }}
          >
            新建
          </Button>,
        ]}
      />

      <MenuConfigModal
        modalRef={modalRef}
        action={configAction}
        parentNode={parentNode}
        onFinish={() => {
          // 刷新、重新加载菜单配置
          window.location.reload()
        }}
      />
    </>
  )
}

/**
 * 菜单配置弹窗
 */
const MenuConfigModal: React.FC<{
  action: 'create' | 'edit'
  modalRef: MutableRefObject<ModalRefType>
  parentNode: CustomMenuItem
  onFinish: () => void
}> = ({ modalRef, action, parentNode, onFinish }) => {
  const ctx = useConcent<{}, GlobalCtx>('global')
  const { setting } = ctx.state
  const customMenus = setting?.customMenus || []
  const microApps = setting?.microApps || []

  const title = `${action === 'create' ? '添加' : '编辑'}菜单`
  const initialValues: any = action === 'edit' ? parentNode : {}
  initialValues.menuType = initialValues.menuType || 'microApp'

  return (
    <RefModalForm
      title={title}
      modalRef={modalRef}
      initialValues={initialValues}
      onFinish={async (formData: any) => {
        formData.id = initialValues.id || random(8)
        // parentNode，只可能为添加根节点
        if (!parentNode) {
          customMenus.push({
            ...formData,
            root: formData.id,
            order: customMenus.length,
          })
        } else if (action === 'edit') {
          // 添加非根节点、或者编辑节点
          updateMenuItem(customMenus, parentNode, formData)
        } else if (action === 'create') {
          addMenuItem(customMenus, parentNode, formData)
        } else {
          message.error('异常行为')
        }

        await ctx.mr.updateSetting({
          customMenus,
        })

        onFinish()
        modalRef.current?.hide?.()
      }}
    >
      <ProFormText
        name="title"
        label="菜单标题"
        placeholder="请输入菜单标题"
        rules={[
          {
            required: true,
            message: '请输入菜单标题',
          },
        ]}
      />
      <ProFormSelect
        required
        name="menuType"
        label="菜单类型"
        options={[
          {
            value: 'microApp',
            label: (
              <>
                <h4>微应用菜单</h4>
                <p>加载微应用的菜单</p>
              </>
            ),
          },
          {
            value: 'link',
            label: (
              <>
                <h4>外链菜单</h4>
                <p>跳转到外链的菜单</p>
              </>
            ),
          },
        ]}
      />
      <ProFormDependency name={['menuType']}>
        {({ menuType }) => {
          return menuType === 'microApp' ? (
            <ProFormSelect
              label="微应用名"
              name="microAppID"
              options={microApps?.map((app) => ({
                value: app.id,
                label: app.title,
              }))}
              rules={[
                {
                  required: true,
                  message: '请选择微应用',
                },
              ]}
            />
          ) : (
            <ProFormText
              name="link"
              label="跳转链接"
              placeholder="请输入完整的跳转链接，如 https://tencent.com"
              rules={[
                {
                  required: true,
                  message: '请输入跳转链接',
                },
                {
                  type: 'url',
                  message: '请输入正确跳转链接',
                },
              ]}
            />
          )
        }}
      </ProFormDependency>
    </RefModalForm>
  )
}

/**
 * 添加菜单
 */
const addMenuItem = (menus: CustomMenuItem[], targetNode: CustomMenuItem, data: CustomMenuItem) => {
  let queue: CustomMenuItem[] = []

  menus.forEach((node) => queue.push(node))

  while (queue.length) {
    const node = queue.shift()
    if (!node) return

    if (node.id === targetNode.id) {
      // 添加节点
      if (node.children) {
        node.children.push({
          ...data,
          order: node.children.length,
        })
      } else {
        node.children = [
          {
            ...data,
            order: 0,
          },
        ]
      }
    } else {
      node.children?.forEach((node) => queue.push(node))
    }
  }
}

/**
 * 更新菜单信息
 */
const updateMenuItem = (
  menus: CustomMenuItem[],
  targetNode: CustomMenuItem,
  data: CustomMenuItem
) => {
  let queue: CustomMenuItem[] = []

  const index = menus.findIndex((_) => _.id === targetNode.id)
  if (index > -1) {
    const menu = menus[index]
    menus.splice(index, 1, {
      ...menu,
      ...data,
    })
    return
  }

  menus.forEach((_) => queue.push(_))

  while (queue.length) {
    const node = queue.shift()
    if (!node) return

    if (node.children?.length) {
      const index = node.children.findIndex((_) => _.id === targetNode.id)
      const menu = node.children[index]

      if (index > -1) {
        node.children.splice(index, 1, { ...menu, ...data })
        return
      } else {
        node.children.forEach((_) => queue.push(_))
      }
    }
  }
}

/**
 * 更新菜单信息
 */
const deleteMenuItem = (menus: CustomMenuItem[], targetNode: CustomMenuItem) => {
  let queue: CustomMenuItem[] = []

  const index = menus.findIndex((_) => _.id === targetNode.id)
  if (index > -1) {
    menus.splice(index, 1)
    return
  }

  menus.forEach((_) => queue.push(_))

  while (queue.length) {
    const node = queue.shift()
    if (!node) return

    if (node.children?.length) {
      const index = node.children.findIndex((_) => _.id === targetNode.id)
      if (index > -1) {
        node.children.splice(index, 1)
        return
      } else {
        node.children.forEach((_) => queue.push(_))
      }
    }
  }
}
