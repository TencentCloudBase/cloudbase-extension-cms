# CloudBase CMS V2

👷 施工中 🚧

## 安装到 CloudBase

### 前置依赖

1. 安装最新版本 CloudBase CLI（0.9.1+）
   `npm install -g @cloudbase/cli`
2. 开通一个按量计费的环境，或使用已有的按量计费环境

### 配置

复制根目录下的 `.env.example` 为 `.env.local`，并填写相关的配置

```
# 您的云开发环境 Id
TCB_ENVID=envId
# 管理员账户名，账号名长度需要大于 4 位，支持字母和数字
administratorName=admin
# 管理员账号密码，密码支持字母、数字、字符、不能由纯字母或存数字组成
administratorPassword=82902Jkl
# CMS 控制台路径，如 /tcb-cms/
deployPath=/tcb-cms/
```

### 部署

初始化，安装依赖

```
npm install && npm run setup
```

部署到云函数

```
npm run deploy:fn
```

## 本地开发

配置 packages/service/.env.local

```
TCB_ENVID=xxx
SECRETID=xxx
SECRETKEY=xxx
```

配置 packages/admin/public/config.js

```js
window.TcbCmsConfig = {
    history: 'hash',
    // 环境 Id
    envId: 'envId',
    // 云接入默认域名/自定义域名，不带 https 协议符
    // https://console.cloud.tencent.com/tcb/env/access
    cloudAccessPath: 'xxx.xx.tcloudbase.com/tcb-ext-cms-service',
}
```

```bash
yarn
npm run setup
npm run dev
```
