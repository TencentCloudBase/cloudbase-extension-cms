# 安装

## 第一步：开通并创建云开发按量计费环境

开通云开发 CMS 扩展，需要开通并创建云开发按量计费环境。开发者可以根据下面的身份角色参考指引进行开通和创建。

- [微信小程序开发者](#wx-miniprogram)
- [腾讯云开发者](#tencent-cloud)
- [QQ 小程序开发者](#qq-miniprogram)

<span id="wx-miniprogram"></span>

### 微信小程序开发者

#### 开通云开发环境

- 注册小程序账号：在微信公共平台进行申请并提交相应资料。[前往注册](https://mp.weixin.qq.com/)
- 下载微信开发者工具：简单高效地开发和调试小程序，并可预览和发布。 [前往下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/nightly.html)
- 开通云开发：在开发者工具中点击“云开发” 按钮开通，开通后会自动开通环境。

#### 切换按量计费

- 下载最新的 [ Nightly Build 版本的微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/nightly.html)，登录微信开发者工具 > 云开发控制台。
- 在【云开发控制台】>【设置】>【环境设置】>【支付方式】中点击切换【按量付费】即可。

::: tip
目前仅支持从腾讯云账户付款，云开发环境切换【按量付费】模式前，请确保腾讯云账户中余额充足，否则将切换失败。
:::

![](https://main.qcloudimg.com/raw/bc4f7048d2bf3e85e4adf46cc8f2cb1c.png)

<span id="tencent-cloud"></span>

### 腾讯云开发者

#### 开通并创建按量付费环境

- 注册腾讯云账号，并完成实名认证。
- 进入 [云开发控制台](https://console.cloud.tencent.com/tcb)，授权开通云开发。
- 单击进入控制台 [创建按量计费环境](https://console.cloud.tencent.com/tcb/env/index?action=CreateEnv)（温馨提示，无资源消耗时，按量计费不产生任何费用）。

##### 切换包年包月计费方式为按量计费

如果已经开通过云开发环境，需要在计费模式中切换计费方式为按量计费
登录腾讯云 [云开发控制台](https://console.cloud.tencent.com/tcb)。在云开发 CloudBase 控制台 > 环境 > [资源购买](https://console.cloud.tencent.com/tcb/env/resource) 中的【计费模式】中单击【切换按量付费】即可。

![](https://main.qcloudimg.com/raw/246abb49435c0758ac609b5fec70ce22.png)

<span id="qq-miniprogram"></span>

### QQ 小程序开发者

#### 开通环境

在 QQ 小程序开发者工具工具栏左侧，点击 “云开发” 按钮即可打开云控制台、根据提示开通云开发、创建云环境。

#### 切换为按量计费

在云开发 CloudBase 控制台 > 环境 > [资源购买](https://console.cloud.tencent.com/tcb/env/resource) 中的【计费模式】中点击【切换按量付费】即可。

![](https://main.qcloudimg.com/raw/cd1b12302b84a6ac63245dd23717f7fe.png)

## 第二步：在腾讯云控制台安装扩展

- 登录腾讯云 [云开发控制台](https://console.cloud.tencent.com/tcb)。
  > ! 微信小程序开发者请使用【其他登录方式】-【微信公众号登录】登录，再选择关联的小程序账户登录。
  > ![](https://main.qcloudimg.com/raw/e89b73bb82eb0315e7506281333ebf3e.png)

::: tip
QQ 小程序开发者可直接通过 QQ 小程序开发者 IDE【云开发】按钮登录，也可以通过关联的腾讯云账户登录。
:::

- 打开云开发控制台 > 扩展能力 > [扩展管理](https://console.cloud.tencent.com/tcb/add) 页面。
- 选择目标按量计费环境后，在更多扩展能力下单击【安装】【CMS 内容管理系统】扩展，并按提示完成扩展安装。
- 安装时需要进行资源的授权和扩展程序的配置，比如管理员和运营者的账号密码配置等，同时需要提供自定义登录的密钥，可以点击自定义登录密钥旁边的小图标了解如何填写。

![](https://main.qcloudimg.com/raw/b7e24a8f7f434c9db89a215236a5f204.jpg)
