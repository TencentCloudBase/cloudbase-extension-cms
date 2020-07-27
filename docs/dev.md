# 开发

参考 [React-Admin](https://marmelab.com/react-admin/Tutorial.html) 文档

## 扩展默认内容

在 `tcb-ext-cms-admin/datamodel/index.js` 的默认导出中增加描述信息：

```js
[
  {
    // 数据库集合名称
    collectionName: 'tcb-ext-cms-xxx',
    label: '名称',
    icon: 'people',
    group: '分组名称',
    description: '描述',
    // 数据类型的字段描述
    fields: []
  }
]
```
