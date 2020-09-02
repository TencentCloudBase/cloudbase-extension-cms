# RESTful API

CloudBase CMS 2.0 版本起，CMS Service 提供了公开的 RESTful 接口，你可以通过 RESTful API 接口访问 CMS 服务，方便的获取内容数据。

## 请求路径

CloudBase CMS 的 RESTful API 请求路径由三部分组成：部署路径 + API 基础路径 + 服务路径。如

CMS 部署路径

```
https://envId.service.tcloudbaseapp.com/tcb-cms
```

API 基础路径

```
/api/v1.0
```

服务路径

```
/projects
```

则获取所有项目的信息的请求为

```
GET https://envId.service.tcloudbaseapp.com/tcb-cms/api/v1/projects
```

## 项目

### 获取项目列表

获取所有项目的信息

#### 请求路径

```
GET /projects
```

#### 响应

```json
{
  "data": [
    {
      "_id": "74b3e15b5f3e6f23000003f83901951d",
      "description": "我的博客",
      "name": "blog",
      "_createTime": 1597927203021
    },
    {
      "_id": "541b7e405f3f28d800000bff4f316a03",
      "description": "test",
      "name": "test",
      "_createTime": 1597974744631
    }
  ],
  "total": 2
}
```

## 内容

### 获取内容集合

获取某个项目下所有的内容集合列表

#### 请求路径

```
GET /projects/{project}/contents
```

#### 请求参数

| 参数    | 类型   | 说明                          |
| ------- | ------ | ----------------------------- |
| project | string | 项目 Id，可以在项目设置中查看 |

#### 响应

```json
{
  "data": [
    {
      "_id": "db4c0c995f3e7aa60000045b6caf4c1b",
      "collectionName": "test-1",
      "description": "测试一下",
      "displayName": "test",
      "projectId": "c12603415f3e6800000005b07a3d659d",
      "fields": [
        {
          "displayName": "test-array",
          "id": "lKtgRPMD5J7D2ZtekD8vUHbP5NfCRWe3",
          "name": "arr",
          "order": 1,
          "type": "Array"
        }
      ],
      "_createTime": 1597930149739,
      "_updateTime": 1597930811388
    }
  ],
  "requestId": "1742eaf287c_b"
}
```

### 获取内容文档

获取某个项目下，某内容类型的所有文档

#### 请求路径

```
GET /projects/{project}/contents/{resource}/docs?query
```

#### 请求参数

| 参数 / GET Query 参数 | 类型   | 说明                          |
| --------------------- | ------ | ----------------------------- |
| project               | string | 项目 Id，可以在项目设置中查看 |
| resource              | string | 为你的内容数据表名称          |
| page                  | number | 分页，第 n 页                 |
| pageSize              | number | 分页大小                      |
| filter.key=value      | string | 查询匹配参数，精确匹配        |
| fuzzyFilter.key=value | string | 模糊搜索，仅支持字符串        |

#### 响应

```json
{
  "data": [
    {
      "_id": "ecdacfc05f3f28a800000bf51126de2f",
      "name": "test",
      "arr": ["sss", "sss", "ssss"],
      "markdown": "markdown 文本",
      "textarea": "ssssssssssssssssssssssssssssss",
      "_createTime": 1597974695982,
      "_updateTime": 1597974695982
    }
  ],
  "requestId": "1742eb3145c_11",
  "total": 1
}
```

### 获取指定内容文档

获取某个项目下，某内容类型的指定文档

#### 请求路径

```
GET /projects/{project}/contents/{resource}/docs/{docId}
```

#### 请求参数

| 参数     | 类型   | 说明                          |
| -------- | ------ | ----------------------------- |
| project  | string | 项目 Id，可以在项目设置中查看 |
| resource | string | 为你的内容数据表名称          |
| docId    | string | 内容文档 Id                   |

#### 响应

```json
{
  "data": {
    "_id": "ecdacfc05f3f28a800000bf51126de2f",
    "name": "test",
    "arr": ["sss", "sss", "ssss"],
    "markdown": "markdown 文本",
    "textarea": "ssssssssssssssssssssssssssssss",
    "_createTime": 1597974695982,
    "_updateTime": 1597974695982
  }
}
```

### 创建内容文档

在某个项目下，创建某内容类型的文档

#### 请求路径

```
POST /projects/{project}/contents/{resource}/docs/{docId}
```

#### 请求参数

| 参数     | 类型   | 说明                          |
| -------- | ------ | ----------------------------- |
| project  | string | 项目 Id，可以在项目设置中查看 |
| resource | string | 为你的内容数据表名称          |
| docId    | string | 内容文档 Id                   |
| body     | string | 内容文档                      |

#### 响应

```json
{
  "id": "b5416b755f476d450088360c0054b6fb",
  "requestId": "1742f02d897_42"
}
```

### 更新内容文档

更新某个项目下某内容类型的指定文档

#### 请求路径

```
PATCH /projects/{project}/contents/{resource}/docs/{docId}
```

#### 请求参数

| 参数     | 类型   | 说明                          |
| -------- | ------ | ----------------------------- |
| project  | string | 项目 Id，可以在项目设置中查看 |
| resource | string | 为你的内容数据表名称          |
| docId    | string | 内容文档 Id                   |

#### 响应

```json
{
  "updated": 1,
  "requestId": "1742ef4477b_12"
}
```

### 删除内容文档

删除某个项目下某内容类型的指定文档

#### 请求路径

```
DELETE /projects/{project}/contents/{resource}/docs/{docId}
```

#### 请求参数

| 参数     | 类型   | 说明                          |
| -------- | ------ | ----------------------------- |
| project  | string | 项目 Id，可以在项目设置中查看 |
| resource | string | 为你的内容数据表名称          |
| docId    | string | 内容文档 Id                   |

获取某个内容类型下的所有数据列表

#### 响应

```json
{
  "deleted": 1,
  "requestId": "1742f1465ec_80"
}
```
