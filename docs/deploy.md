# 手动部署

## 部署详情

### 云函数部署

- **云函数**
  - tcb-ext-cms-service
    该函数提供登录鉴权功能，用户在 CMS 管理界面通过通过用户名和密码来进行登录时，会通过 HTTP 来请求该函数；提供 API 接口功能，所有对内容的操作和管理都会经过此函数调用，内容操作会根据用户权限来进行数据库操作
  - tcb-ext-cms-init
    提供初始化应用功能，安装扩展后，会通过该函数来进行静态资源的部署和密码的生成和设置，修改账号密码或者部署路径等扩展参数都会再次执行该函数来进行更新
- **云数据库**

  - tcb-ext-cms-projects 集合：CMS 系统项目数据
  - tcb-ext-cms-schemas 集合：CMS 系统内容配置数据，CMS 所有的系统内容类型配置、字段配置等信息都存储在该集合内
  - tcb-ext-cms-users 集合：CMS 系统用户数据，存储 CMS 的用户信息，包括管理员和运营者的账号信息，包括角色信息等
  - tcb-ext-cms-webhooks 集合：
    CMS 系统 webhook 集合，存储 CMS 系统的回调接口配置，CMS 系统数据的变更可以通过回调来进行同步。
  - tcb-ext-cms-user-roles 集合：CMS 系统用户角色配置集合，存储 CMS 系统的自定义用户角色信息
  - tcb-ext-cms-settings 集合：CMS 系统配置集合，存储 CMS 系统的设置

- **云存储**：存储图片、文件等 CMS 系统上传的文件。
- **静态网站托管**：CMS 系统前端界面，基于 React 开发，通过 CloudBase JS SDK 访问 CMS 的函数、数据库和存储等资源。

## 部署指南

你可以通过下面的方式快速部署 CloudBase CMS

### 扩展安装

在[云开发控制台](https://console.cloud.tencent.com/tcb/cms)安装

### 手动部署

我们提供了一键部署到云开发环境的脚本，你可以按照下面的流程操作，使用 **[CloudBase Framework](https://github.com/TencentCloudBase/cloudbase-framework)** 框架将 CloudBase CMS 一键部署到云开发环境

#### 0️⃣ 前置依赖

1. 安装 [Node.js LTS 版本](https://nodejs.org/zh-cn/)
2. 使用 Node 包管理器 NPM 安装最新版本的 CloudBase CLI 工具（0.9.1+）

   `npm install -g @cloudbase/cli@latest`

3. 开通云开发服务，并创建按量计费环境（如果您已拥有云开发按量计费的环境，可跳过此步骤）

   登录[腾讯云-云开发控制台](https://console.cloud.tencent.com/tcb/env/index?from=cli&source=cloudbase-cms&action=CreateEnv)，根据弹窗提示，开通服务，并创建按量计费环境。

#### 1️⃣ 配置

复制项目根目录下的 `.env.example` 为 `.env.local`，并填写相关的配置

```bash
# 您的云开发环境 Id
TCB_ENVID=envId
# 管理员账户名，账号名长度需要大于 4 位，支持字母和数字
administratorName=admin
# 管理员账号密码，8~32位，密码支持字母、数字、字符、不能由纯字母或存数字组成
administratorPassword=82902Jkl
# CMS 控制台路径，如 /tcb-cms/，建议使用根路径 /
deployPath=/
```

#### 2️⃣ 安装依赖

在项目根目录下运行下面的命令：

```
npm install && npm run setup
```

#### 3️⃣ 部署

在项目根目录下运行下面的命令，会将 CloudBase CMS 的管理控制台部署到静态网站，Node 服务部署到云函数中

```
npm run deploy:fn
```
