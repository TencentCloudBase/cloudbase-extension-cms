# CloudBase CMS V2

👷 施工中 🚧

## 部署

### 配置

复制根目录下的 `.env.example` 为 `.env.local`，并填写相关的配置

```
# 您的云开发环境 Id
TCB_ENVID=
# 管理员账户名，账号名长度需要大于 4 位，支持字母和数字
administratorName=admin
# 管理员账号密码，密码支持字母、数字、字符、不能由纯字母或存数字组成
administratorPassword=
初始化，安装依赖

```

npm install && npm run setup

```

部署

```

npm run deploy

```

## Dev

配置 packages/service/.env.local

```

TCB_ENVID=xxx
SECRETID=xxx
SECRETKEY=xxx

````

```bash
yarn
npm run setup
npm run dev
````
