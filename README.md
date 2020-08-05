![](https://main.qcloudimg.com/raw/7d5d2ee87a7d4f1a81a803eff528545a/cms.png)

# 云开发扩展 - CMS 内容管理系统

## 功能特性

| 特性         | 介绍                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| 免开发       | 基于后台建模配置生成内容管理界面，无须编写代码                                                          |
| 多端适配     | 支持 PC/移动端访问和管理内容                                                                            |
| 功能丰富     | 支持文本、富文本、图片、文件 等多种类型内容的可视化编辑，并且支持内容关联                               |
| 权限控制     | 系统基于管理员/运营者两种身份角色的访问控制                                                             |
| 外部系统集成 | 支持 Webhook 接口，可以用于在运营修改修改内容后通知外部系统，比如自动构建静态网站、发送通知等           |
| 数据源兼容   | 支持管理小程序/ Web / 移动端的云开发数据，支持管理已有数据集合，也可以在 CMS 后台创建新的内容和数据集合 |
| 部署简单     | 可在云开发控制台扩展管理界面一键部署和升级                                                              |

## 安装部署

### 扩展安装方式

在[云开发控制台](https://console.cloud.tencent.com/tcb/cms)安装

### 本地部署方式

可以基于 **[CloudBase Framework](https://github.com/TencentCloudBase/cloudbase-framework)** 框架将项目一键部署到云开发环境

前置依赖

- 安装最新版本**CloudBase CLI（0.9.1+）** `npm install -g @cloudbase/cli`
- 开通一个按量计费的环境，或使用已有的按量计费环境
- 开通自定义登录，并复制自定义登录密钥 (https://console.cloud.tencent.com/tcb/env/setting?tab=loginConfig)

#### 配置

复制一份 `.env.example`，重新保存为 `.env.local`

填写配置

```bash
# 填写环境 ID
envId=YOUR_ENVID
# 填入上面前置依赖第二步的自定义登录密钥信息
customLoginJson.private_key_id=SECRET_KEY_ID
customLoginJson.private_key=SECRET_KEY
customLoginJson.env_id=YOUR_ENVID
# 账号名长度需要大于 4 位
administratorName=NAME
# 管理员账号密码，密码仅支持大小写字母
administratorPassword=PASSWORD
# 运营账号密码，密码仅支持大小写字母
operatorName=NAME_OPER
operatorPassword=PASSWORD_OPER
# 部署静态网站路径
deployPath=/deploy-path

```

#### 构建部署

登录 CLI

```bash
tcb login
```

初始化，安装依赖

```bash
npm run setup
```

部署

```bash
npm run deploy
```

## 运行方式

请参考 [运行方式](./INTRO.md)

## 常见问题

### 在扩展管理界面找不到 CMS 扩展

CMS 扩展会开通静态托管资源，静态托管目前仅支持在按量计费环境下开通，切换为按量计费后就可以安装 CMS 扩展

### 打开 CMS 时提示 404

CMS 的安装路径是是静态托管默认域名/tcb-cms, 可以看下地址是否正确

### 登录时报 “Invalid uid” 错误

管理员和运营者用户名只支持 4-32 位字符（大小写英文字母、数字），可以在扩展管理界面重新修改用户名进行修复

### 登录时 INVALID_CUSTOM_LOGIN_TICKET 报错

1、自定义密钥直接复制粘贴就可以了，不要改
2、确保你复制的是当前云开发环境的自定义密钥

### 使用管理员账号提示没有管理权限

管理员和运营者账号不能相同，建议设置为不同的账号，可以在扩展管理界面重新修改用户名进行修复

### 登录报错，提示 No credentials found on headers or cookies

用户打开了云函数的 HTTP 触发的访问鉴权功能，开启鉴权后，客户端需要在登录的情况下才能触发云函数

CMS 负责登录的 auth 云函数需要关闭访问鉴权才可以使用

## 开发

[参考文档](./docs/dev.md)

## RoadMap

- V2 版本规划中

