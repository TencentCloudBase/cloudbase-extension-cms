import { getChildFields } from './child-field'

const contentsCollectionName = 'tcb-ext-cms-contents'
const userCollectionName = 'tcb-ext-cms-users'
const webhooksCollectionName = 'tcb-ext-cms-webhooks'

export default [
  {
    collectionName: contentsCollectionName,
    label: '内容设置',
    icon: 'settings',
    group: '管理',
    description:
      '开发者可以根据数据库字段进行内容设置，并自动生成管理界面，修改内容设置后，需刷新页面查看最新的管理界面',
    fields: [
      {
        fieldName: 'label',
        fieldLabel: '内容类型',
        fieldType: 'String',
        isRequired: true
      },
      {
        fieldName: 'collectionName',
        fieldLabel: '数据库集合名',
        fieldType: 'String',
        isRequired: true,
        helpText: '内容对应的数据库集合名，可填写现有集合名，如集合不存在则会自动创建'
      },
      {
        fieldName: 'icon',
        fieldLabel: '图标',
        fieldType: 'Icon'
      },
      {
        fieldName: 'order',
        fieldLabel: '排序（值越大越靠前）',
        fieldType: 'Number'
      },
      {
        fieldName: 'description',
        fieldLabel: '描述信息',
        fieldType: 'String',
        isRequired: false,
        helpText: '会展示在对应内容的管理页面顶部'
      },
      getChildFields()
    ]
  },
  {
    collectionName: userCollectionName,
    label: '用户管理',
    icon: 'people',
    group: '管理',
    description: '管理可以访问 CMS 系统的用户',
    fields: [
      {
        fieldName: 'userName',
        fieldLabel: '用户名',
        fieldType: 'String',
        isRequired: true,
        stringMinLength: 4
      },
      {
        fieldName: 'role',
        fieldLabel: '角色',
        fieldType: 'Select',
        defaultValue: 'other',
        options: [
          {
            id: 'administrator',
            name: '管理员'
          },
          {
            id: 'operator',
            name: '运营人员'
          },
          {
            id: 'other',
            name: '其他人员'
          }
        ],
        isRequired: true
      },
      {
        fieldName: 'password',
        fieldLabel: '密码',
        fieldType: 'String',
        hidden: true
      },
      {
        fieldName: 'createTime',
        fieldLabel: '创建时间',
        fieldType: 'DateTime'
      },
      {
        fieldName: 'collections',
        fieldLabel: '资源权限',
        fieldType: 'Array',
        helpText: '内容对应的数据库集合名'
      },
      {
        fieldName: 'actions',
        fieldLabel: '操作权限',
        fieldType: 'SelectArray',
        defaultValue: ['get'],
        helpText: '授予更新、删除权限时需要同时授予查询权限',
        options: [
          {
            id: 'get',
            name: '查询'
          },
          {
            id: 'create',
            name: '新建'
          },
          {
            id: 'update',
            name: '更新'
          },
          {
            id: 'delete',
            name: '删除'
          }
        ]
      }
    ]
  },
  {
    collectionName: webhooksCollectionName,
    label: 'Webhook',
    description:
      '实验室功能：Webhook 可以用于在运营人员修改内容数据后，自动回调外部系统，比如自动构建静态网站、发送通知等',
    icon: 'all_inclusive',
    group: '管理',
    fields: [
      {
        fieldName: 'name',
        fieldLabel: 'Webhook 名称',
        fieldType: 'String',
        isRequired: true
      },
      {
        fieldName: 'method',
        fieldLabel: 'HTTP method',
        fieldType: 'Select',
        isRequired: true,
        options: [
          {
            id: 'POST',
            name: 'POST'
          },
          {
            id: 'GET',
            name: 'GET'
          },
          {
            id: 'PUT',
            name: 'PUT'
          },
          {
            id: 'PATCH',
            name: 'PATCH'
          },
          {
            id: 'DELETE',
            name: 'DELETE'
          }
        ],
        defaultValue: 'POST'
      },
      {
        fieldName: 'url',
        fieldLabel: 'Webhook地址',
        fieldType: 'Url',
        isRequired: true
      },
      {
        fieldName: 'triggerType',
        fieldLabel: '触发类型',
        fieldType: 'Select',
        isRequired: true,
        defaultValue: 'all',
        options: [
          {
            id: 'all',
            name: '所有内容事件都触发'
          },
          {
            id: 'filter',
            name: '只有指定内容事件才触发'
          }
        ]
      },
      {
        fieldName: 'event',
        fieldLabel: '触发类型',
        fieldType: 'SelectArray',
        expectField: 'triggerType',
        expectValue: 'filter',
        defaultValue: ['create', 'update', 'updateMany', 'delete', 'deleteMany'],
        options: [
          {
            id: 'create',
            name: 'create'
          },
          {
            id: 'update',
            name: 'update'
          },
          {
            id: 'updateMany',
            name: 'updateMany'
          },
          {
            id: 'delete',
            name: 'delete'
          },
          {
            id: 'deleteMany',
            name: 'deleteMany'
          }
        ]
      },
      {
        fieldName: 'collections',
        fieldLabel: '监听指定内容',
        fieldType: 'Connect',
        connectResource: 'tcb-ext-cms-contents',
        connectMany: true,
        connectField: 'label',
        helpText: '仅在指定集合变化时触发'
      },
      {
        fieldName: 'headers',
        fieldLabel: 'HTTP Headers',
        fieldType: 'Array',
        childFields: [
          {
            fieldName: 'key',
            fieldLabel: 'Key',
            fieldType: 'String',
            isRequired: true
          },
          {
            fieldName: 'value',
            fieldLabel: 'Value',
            fieldType: 'String',
            isRequired: true
          }
        ]
      }
    ]
  }
]
