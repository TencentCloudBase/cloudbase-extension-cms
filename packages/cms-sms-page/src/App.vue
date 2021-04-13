<template>
  <div id="app" :class="{ long: isLongImg }">
    <!-- 加载动画 -->
    <loading v-if="pageLoading" />

    <!-- 内容 -->
    <template v-else>
      <iframe
        id="bgFrame"
        frameborder="0"
        :src="lowcodePage"
        v-if="fromLowCode && jumpPageType === 'lowcode' && lowcodePage"
      />

      <!-- 背景图 -->
      <img
        v-else-if="bgImg"
        id="bgImg"
        :src="bgImg"
        :class="{ long: isLongImg, full: !isLongImg }"
      />

      <desktop-web v-if="isDesktop" />
      <!-- 跳转按钮 -->
      <div v-else class="btn-box" :class="{ bottom: placeBtnBottom, middle: !placeBtnBottom }">
        <wechat-web
          v-if="isWeixin"
          :appPath="appPath"
          :btnImg="btnImg"
          :placeBottom="placeBtnBottom"
        />
        <public-web
          v-else
          :btnImg="btnImg"
          :openWeapp="openWeapp"
          :placeBottom="placeBtnBottom"
          :btnLoading="btnLoading"
        />
      </div>
    </template>

    <div class="bottom-box" v-if="isLongImg" />

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
      btnImg: '',
      isLongImg: false,
      pageLoading: true,
      // 加载中
      btnLoading: false,
      // 跳转链接
      openlink: '',
      dialogVisible: false,
      dialogMsg: '',
      // 生成跳转路径错误
      generateSchemaError: false,
      // 低码自定义页面
      fromLowCode: false,
      jumpPageType: 'image',
      lowcodePage: '',
    }
  },
  computed: {
    placeBtnBottom() {
      return Boolean(
        this.bgImg || (this.fromLowCode && this.jumpPageType === 'lowcode' && this.lowcodePage)
      )
    },
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
      const { envID } = cloudResource

      try {
        const activityId = this.getQueryByName('activityId')
        const channelId = this.getQueryByName('source') || '_cms_sms_'

        // 本地用户随机 id
        let sessionId = localStorage.getItem(LOCAL_SESSIONID_KEY)
        if (!sessionId) {
          sessionId = this.uuidv4()
          localStorage.setItem(LOCAL_SESSIONID_KEY, sessionId)
        }

        // 触发云函数的名称
        const functionName = WX_MP ? 'wx-ext-cms-sms' : 'tcb-ext-cms-sms'

        // 查询活动信息
        const res = await this.cloudApp.callFunction({
          name: functionName,
          data: {
            channelId,
            sessionId,
            activityId,
            referer: document.referrer,
            action: 'getUrlScheme',
          },
        })

        const { result } = res

        // 函数执行错误
        if (result.error) {
          this.generateSchemaError = true
          this.showDialog(result.error.message)
          return
        }

        this.openlink = res.result.openlink

        // 活动信息
        const activity = res.result.activity || {}

        const { jumpImg, isLongImg, btnImg, jumpPageType, lowcodePage, fromLowCode } = activity

        // 活动配置信息
        this.bgImg = jumpImg
        this.isLongImg = isLongImg
        this.btnImg = btnImg
        this.jumpPageType = jumpPageType
        this.fromLowCode = fromLowCode
        this.lowcodePage = lowcodePage

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
          jumpPath = activity.appPath + '.html'
        }

        // 添加参数，jumpPath 可能为空
        if (jumpPath) {
          jumpPath += `?_activityId_=${activityId}&_source_=${channelId}&_envId_=${envID}`
        } else {
          jumpPath = `?_activityId_=${activityId}&_source_=${channelId}&_envId=${envID}`
        }

        if (activity.appPathQuery) {
          jumpPath += activity.appPathQuery
        }

        console.log('跳转链接', jumpPath)

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
  position: relative;
  text-align: center;
  color: #2c3e50;
  height: calc(100% - constant(safe-area-inset-bottom));
  height: calc(100% - env(safe-area-inset-bottom));
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';

  &.long {
    overflow: auto;
  }
}

html,
body {
  height: 100%;
  margin: 0;
}

body {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

#bgFrame {
  position: absolute;
  overflow: auto;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

img#bgImg {
  display: block;
  width: 100%;

  &.full {
    width: 100%;
    display: block;
    height: calc(100% - constant(safe-area-inset-bottom));
    height: calc(100% - env(safe-area-inset-bottom));
    object-fit: cover;
    bottom: constant(safe-area-inset-bottom);
    bottom: env(safe-area-inset-bottom);
  }
}

.btn-box {
  &.middle {
    height: 100%;
    width: 100%;
  }

  &.bottom {
    position: fixed;
    width: 100%;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
  }
}

.bottom-box {
  content: ' ';
  height: 3rem;
  width: 100%;
}

.center {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
