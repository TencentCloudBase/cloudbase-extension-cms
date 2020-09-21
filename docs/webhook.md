# Webhooks

通过使用 Webhooks，你可以将 CloudBase CMS 与其他的系统进行集成，订阅 CloudBase CMS 上的特定事件。当其中一个事件被触发时，我们将发送一个 HTTP 请求到 Webhook 配置的 URL。Webhook 可用于通知内容更新，触发网站构建，备份内容等，只受你的想象力的限制。

目前，CloudBase CMS Webhook 仅支持监听项目中内容数据的变更，包含新增、更新、删除等操作，未来将会扩展更多类型的 Webhook。

## 配置 Webhook

- Webhook 名称
- 触发 URL：特定事件发生时回调的 URL 地址
- 监听内容：指定全部内容集合
- HTTP 方法：支持 `POST`，`UPDATE`，`DELETE`，`PATCH` 等方法，建议使用 `POST` 方法
- HTTP Headers：支持配置请求 URL 时的 HTTP Header

## 触发

Webhook 触发时携带的 Body，即使你使用了 `GET` 方法，也会发送携带 Body 的请求

- collection: 触发事件的数据库集合名
- action: 触发事件
  - createOne：创建内容
  - updateOne：更新内容
  - deleteOne：删除内容
- actionRes: 数据库操作的响应
- actionFilter: 请求操作的过滤条件

如

```
{
  collection: '',
  action: '',
  actionRes: '',
  actionFilter: {},
}
```
