<template>
  <div id="app">
    <loading v-if="pageLoading" />
    <img v-if="bgImg" id="bgImg" :src="bgImg" />
    <wechat-web v-if="isWeixin" :appPath="appPath" :bgImg="bgImg" />
    <desktop-web v-else-if="isDesktop" />
    <public-web v-else :bgImg="bgImg" :openWeapp="openWeapp" :btnLoading="btnLoading" />
    <we-dialog :onOk="openWeapp" :visible="dialogVisible" :message="dialogMsg" />
  </div>
</template>

<script>
import WechatWeb from './components/WechatWeb'
import PublicWeb from './components/PublicWeb'
import DesktopWeb from './components/DesktopWeb.vue'
import Loading from './components/Loading.vue'
import WeDialog from './components/WeDialog.vue'

const LOCAL_SESSIONID_KEY = 'CMS_SMS_USER_SESSIONID_KEY'

export default {
  name: 'App',
  components: {
    WechatWeb,
    PublicWeb,
    DesktopWeb,
    Loading,
    WeDialog,
  },
  data() {
    return {
      isWXWork: false,
      isWeixin: false,
      isMobile: false,
      isDesktop: false,
      cloudApp: null,
      // 小程序路径
      appPath: '',
      bgImg: '',
      pageLoading: true,
      // 加载中
      btnLoading: false,
      // 跳转链接
      openlink: '',
      dialogVisible: false,
      dialogMsg: '',
      // 生成跳转路径错误
      generateSchemaError: false,
    }
  },
  created() {
    // 获取 UA 信息
    const ua = navigator.userAgent.toLowerCase()
    this.isWXWork = ua.match(/wxwork/i) == 'wxwork'
    this.isWeixin = !this.isWXWork && ua.match(/micromessenger/i) == 'micromessenger'

    if (
      navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|IEMobile)/i)
    ) {
      this.isMobile = true
    } else {
      this.isDesktop = true
    }

    // 桌面不获取活动信息
    if (!this.isDesktop) {
      this.initCloudAndGetActivityInfo()
    } else {
      this.pageLoading = false
    }
  },
  mounted() {
    if (this.isWeixin) {
      this.initWxConfig()
    }
  },
  methods: {
    // 初始化微信 SDK
    initWxConfig() {
      const { cloudResource = {} } = window

      wx.config({
        // debug: true, // 调试时可开启
        appId: cloudResource.appID, // <!-- replace -->
        timestamp: 0, // 必填，填任意数字即可
        nonceStr: 'nonceStr', // 必填，填任意非空字符串即可
        signature: 'signature', // 必填，填任意非空字符串即可
        jsApiList: ['chooseImage'], // 必填，随意一个接口即可
        openTagList: ['wx-open-launch-weapp'], // 填入打开小程序的开放标签名
      })
    },
    // 初始化云开发 SDK
    initCloudAndGetActivityInfo() {
      const { cloudResource } = window
      if (!cloudResource || cloudResource.appID === '{{APPID}}') {
        this.showDialog('页面初始化信息缺失')
        return
      }

      // 初始化云开发 SDK
      const cloud = new window.cloud.Cloud({
        // 必填，表示是未登录模式
        identityless: true,
        // 资源方 AppID
        resourceAppid: cloudResource.appID, // <!-- replace -->
        // 资源方环境 ID
        resourceEnv: cloudResource.envID, // <!-- replace -->
      })
      cloud.init()
      this.cloudApp = cloud

      this.getActivityInfo()
    },
    // 查询 query 参数
    getQueryByName(name, url = window.location.href) {
      name = name.replace(/[\[\]]/g, '\\$&')
      const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url)
      if (!results) return null
      if (!results[2]) return ''
      return decodeURIComponent(results[2].replace(/\+/g, ' '))
    },
    showDialog(msg) {
      this.dialogMsg = msg
      this.dialogVisible = true
    },
    /**
     * 获取活动信息
     */
    async getActivityInfo() {
      this.btnLoading = true
      const { cloudResource = {} } = window

      try {
        const activityId = this.getQueryByName('activityId')
        const channelId = this.getQueryByName('source') || '_cms_sms_'
        let sessionId = localStorage.getItem(LOCAL_SESSIONID_KEY)
        if (!sessionId) {
          sessionId = this.uuidv4()
          localStorage.setItem(LOCAL_SESSIONID_KEY, sessionId)
        }

        // 查询活动信息
        const res = await this.cloudApp.callFunction({
          name: 'wx-ext-cms-sms',
          data: {
            channelId,
            sessionId,
            activityId,
            action: 'getUrlScheme',
          },
        })

        console.log(res)

        const { result } = res

        // 函数执行错误
        if (result.error) {
          this.generateSchemaError = true
          this.showDialog(result.error.message)
          return
        }

        this.openlink = res.result.openlink

        // 动态修改 Path
        const activity = res.result.activity || {}

        // 添加背景图片
        if (activity.jumpImg) {
          this.bgImg = activity.jumpImg
        }

        // 活动状态
        let status = ''

        if (!activity || !activity._id) {
          status = '不存在'
        } else if (typeof activity.isActivityOpen === 'boolean' && !activity.isActivityOpen) {
          status = '未开放'
        } else if (activity.startTime > Date.now()) {
          status = '尚未开始'
        } else if (activity.endTime < Date.now()) {
          status = '已结束'
        }

        // 添加跳转路径
        let jumpPath
        if (activity.appPath) {
          jumpPath = activity.appPath + '.html?'
        }

        if (activity.appPathQuery) {
          jumpPath += activity.appPathQuery
        }

        if (jumpPath) {
          this.appPath = jumpPath
        }

        // 活动状态异常
        if (status) {
          this.showDialog(`当前活动${status}，更多精彩活动来${cloudResource.appName}看看吧`)
        } else {
          // 自动跳转
          if (!this.isWeixin && !this.isDesktop) {
            location.href = this.openlink
          }
        }
      } catch (err) {
        // 页面路径错误
        console.log(err)
        if (err.message && err.message.indexOf('40165') > -1) {
          this.showDialog('页面路径填写错误')
        } else {
          alert(err)
        }
      } finally {
        this.pageLoading = false
        this.btnLoading = false
      }
    },
    uuidv4() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
      )
    },

    /**
     * 打开小程序
     */
    openWeapp() {
      this.dialogVisible = false

      if (this.isWeixin || this.generateSchemaError) return

      if (this.openlink) {
        location.href = this.openlink
      } else {
        this.getActivityInfo()
      }
    },
  },
}
</script>

<style lang="less">
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  text-align: center;
  color: #2c3e50;
}

html,
body {
  height: 100%;
  margin: 0;
}

#app {
  height: calc(100% - constant(safe-area-inset-bottom));
  height: calc(100% - env(safe-area-inset-bottom));
  position: relative;
}

body {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

img {
  position: absolute;
  height: calc(100% - constant(safe-area-inset-bottom));
  height: calc(100% - env(safe-area-inset-bottom));
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  z-index: -1;
  bottom: constant(safe-area-inset-bottom);
  bottom: env(safe-area-inset-bottom);
}

.center {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
