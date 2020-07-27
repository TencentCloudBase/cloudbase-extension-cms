export function getBasicFieldtype() {
  return [
    {
      id: 'String',
      name: '字符串'
    },
    {
      id: 'DateTime',
      name: '时间'
    },
    {
      id: 'Boolean',
      name: '布尔值'
    },
    {
      id: 'Number',
      name: '数字'
    },
    {
      id: 'Image',
      name: '图片'
    },
    {
      id: 'File',
      name: '文件'
    },
    {
      id: 'Email',
      name: '邮箱地址'
    },
    {
      id: 'Tel',
      name: '电话号码'
    },
    {
      id: 'Url',
      name: '网址'
    },
    {
      id: 'RichText',
      name: '富文本'
    },
    {
      id: 'Markdown',
      name: 'Markdown'
    },
    {
      id: 'Array',
      name: '数组'
    }
  ]
}

export function getChildFields(basic) {
  const supportArray = false
  return {
    fieldName: basic ? 'childFields' : 'fields',
    fieldLabel: basic ? '子字段列表（只有数组类型时才需要填写）' : '字段列表',
    fieldType: 'Array',
    isRequired: true,
    defaultValue: basic
      ? []
      : [
          {
            fieldName: 'name',
            fieldLabel: '名称',
            fieldType: 'String'
          },
          {
            fieldName: 'order',
            fieldLabel: '排序',
            helpText: '值越大在 CMS 列表中越靠前',
            fieldType: 'Number'
          },
          {
            fieldName: 'createTime',
            fieldLabel: '创建时间',
            fieldType: 'DateTime',
            helpText: '留空时会在服务端自动写入创建时间'
          },
          {
            fieldName: 'updateTime',
            fieldLabel: '修改时间',
            fieldType: 'DateTime',
            helpText: '留空时会在服务端自动写入修改时间'
          }
        ],
    ...(basic
      ? {
          expectField: 'fieldType',
          expectValue: 'Array'
        }
      : {}),
    childFields: [
      {
        fieldName: 'fieldLabel',
        fieldLabel: '字段名称',
        helpText: '字段中文显示名称',
        fieldType: 'String',
        isRequired: true
      },
      {
        fieldName: 'fieldName',
        fieldLabel: '数据库字段名',
        fieldType: 'String',
        helpText: '该字段在数据库中保存的名称',
        isRequired: true
      },
      {
        fieldName: 'fieldType',
        fieldLabel: '字段类型',
        fieldType: 'Select',
        isRequired: true,
        options: [
          ...getBasicFieldtype(),
          ...(basic
            ? []
            : [
                {
                  id: 'Connect',
                  name: '关联'
                },
                ...(supportArray
                  ? [
                      {
                        id: 'Array',
                        name: '数组'
                      }
                    ]
                  : [])
              ])
        ]
      },
      {
        fieldName: 'stringMinLength',
        fieldLabel: '最小长度',
        fieldType: 'Number',
        hidden: true,
        expectField: 'fieldType',
        expectValue: 'String'
      },
      {
        fieldName: 'stringMaxLength',
        fieldLabel: '最大长度',
        fieldType: 'Number',
        hidden: true,
        expectField: 'fieldType',
        expectValue: 'String'
      },
      ...(basic
        ? []
        : [
            {
              fieldName: 'connectResource',
              fieldLabel: '关联的内容',
              fieldType: 'Connect',
              connectResource: 'tcb-ext-cms-contents',
              connectField: 'label',
              helpText: '这个字段引用了一个或者多个关联内容',
              expectField: 'fieldType',
              expectValue: 'Connect'
            },
            {
              fieldName: 'connectField',
              fieldLabel: '显示关联的内容中的哪个字段',
              fieldType: 'String',
              hidden: true,
              helpText: '在编辑时，会显示引用的关联内容的某个字段',
              expectField: 'fieldType',
              expectValue: 'Connect'
            },
            {
              fieldName: 'connectMany',
              fieldLabel: '是否关联多项',
              fieldType: 'Boolean',
              hidden: true,
              helpText: '是否引用多个',
              expectField: 'fieldType',
              expectValue: 'Connect'
            }
          ]),
      {
        fieldName: 'defaultValue',
        fieldLabel: '默认值',
        fieldType: 'Text',
        hidden: true
      },
      {
        fieldName: 'helpText',
        fieldLabel: '字段说明',
        fieldType: 'Text',
        helpText: '说明文字会展示在输入框下方',
        hidden: true
      },
      {
        fieldName: 'isRequired',
        fieldLabel: '是否必填',
        fieldType: 'Boolean',
        hidden: true
      },
      {
        fieldName: 'hidden',
        fieldLabel: '是否隐藏该列',
        fieldType: 'Boolean',
        helpText: '在PC端表格视图是否隐藏该列',
        hidden: true,
        isRequired: false,
        defaultValue: false
      },
      ...(basic ? [] : supportArray ? [getChildFields(true)] : [])
    ]
  }
}
