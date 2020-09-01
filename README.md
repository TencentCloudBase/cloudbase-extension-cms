# CloudBase CMS

<p align="center">
  <img src="./docs/assets/banner.png" alt="Logo">
  <h3 align="center">
    打造云端一体化数据运营平台
  </h3>
  <p align="center">
    <br />
    <a href="https://github.com/TencentCloudBase/cloudbase-extension-cms">
      <strong>文档»</strong>
    </a>
    <br />
    <br />
    <a href="https://cms-demo-1252710547.tcloudbaseapp.com/#/login" target="_blank">在线示例</a>
    ·
    <a href="https://github.com/TencentCloudBase/cloudbase-extension-cms/issues">报告 Bug</a>
    ·
    <a href="https://github.com/TencentCloudBase/cloudbase-extension-cms/issues">特性建议</a>
  </p>
</p>

CloudBase CMS 是云开发推出的开源的、综合性内容数据管理运营平台，提供了丰富的内容管理功能，可扩展性强，易于二次开发，并支持 API 访问。

## 功能特性

| 特性        | 介绍                                                                       |
| ----------- | -------------------------------------------------------------------------- |
| 免开发      | 基于模板配置生成内容管理界面，无须编写代码                                 |
| 功能丰富    | 支持文本、图片、文件、枚举等多种类型内容的可视化编辑，并且支持内容关联     |
| 权限控制    | 基于自定义角色的资源级权限管理，满足企业级需求                             |
| 系统集成    | 支持 Webhook 触发，可以方便的与外部系统集成                                |
| 数据源兼容  | 支持管理已有的云开发数据，也可以在 CMS 后台创建新的内容和数据集合          |
| 部署简单    | 可在云开发控制台扩展管理界面一键部署和升级，也可通过项目提供的脚本自动部署 |
| RESTful API | 支持通过 RESTful API 操作内容数据                                          |

## 技术栈

- ❤️ React
- ❤️ Node.js + Nest.js + CloudBase
- ❤️ TypeScript

## 快速开始

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

## 本地开发

参考[贡献指南](./CONTRIBUTING.md)

## RoadMap

🚀 表示已经实现的功能，👷 表示进行中的功能，⏳ 表示规划中的功能，🏹 表示技术方案设计中的功能。

| 功能                                                     | 状态      | 发布版本 |
| -------------------------------------------------------- | --------- | -------- |
| CMS 2.0 使用文档                                         | 👷 进行中 | V2.0     |
| 支持 RESTful API                                         | 👷 进行中 | V2.0     |
| 数据导入、导出：支持内容数据的导入、导出                 | 👷 进行中 |          |
| 支持云应用部署                                           | 🏹 设计中 |          |
| 提供更简单的部署方法：CI 部署                            | 🏹 设计中 |          |
| 提供项目模板，支持从模板创建项目                         | 🏹 设计中 |          |
| 支持复杂的对象，支持复杂数组类型，支持对象嵌套类型，JSON | 🏹 设计中 |          |
| 图片、文件数组支持                                       | 🏹 设计中 |          |
| 支持 GraphQL                                             | ⏳ 规划中 |          |
| 内容表字段索引支持                                       | ⏳ 规划中 |          |
| 定时任务 ⇒ 统计报表                                      | ⏳ 规划中 |          |
| 富文本编辑器优化，支持上传图片                           | 🚀 已完成 | V2.0     |
| 登录使用云开发账号密码登录                               | 🚀 已完成 | V2.0     |
| 支持枚举类型                                             | 🚀 已完成 | V2.0     |
| 细粒度角色权限管理权限控制                               | 🚀 已完成 | V2.0     |

## 贡献指南

欢迎大家参与到 CloudBase CMS 的开发工作，贡献一份力量

您可以选择如下的贡献方式：

- 贡献一篇技术文章
- 贡献代码，提交 Pull Request
- 反馈 bug，提交 Issue
- 在技术会议上发表技术演讲
- 贡献方式请参考 贡献指南 文档

## 更新日志

见[更新日志](./CHANGELOG.md)

## License

开源协议文档请参阅 [Apache License 2.0](./LICENSE)

## 在线交流

如果你有任何的使用问题、建议，都可以加入群聊，与我们交流

<img src="./docs/assets/group.jpg" width="200px" alt=""/>

## Contributors ✨

等待你的贡献
