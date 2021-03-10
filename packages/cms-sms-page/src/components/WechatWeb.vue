<template>
  <div id="wechat-web-container" class="center">
    <div :class="{ bottom: placeBottom }">
      <!-- replace -->
      <!-- 跳转小程序的开放标签。文档 https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_Open_Tag.html -->
      <!-- Vue 中处理开放标签 https://developers.weixin.qq.com/community/develop/article/doc/000c00b4490678f528baf2cf756413 -->

      <!-- 图片按钮 -->
      <img
        v-if="btnImg"
        :src="btnImg"
        style="width: 100%; position: fixed; left: 0; right: 0; bottom: 0; z-index: 0"
      />
      <wx-open-launch-weapp v-if="btnImg" :username="originalID" :path="appPath">
        <!-- replace -->
        <script type="text/wxtag-template">
          <div style="width: 100%; height: 3rem; z-index: 10"></div>
        </script>
      </wx-open-launch-weapp>
      <wx-open-launch-weapp v-else-if="placeBottom" :username="originalID" :path="appPath">
        <!-- replace -->
        <script type="text/wxtag-template">
          <button
            style="width: 100%; height: 3rem; font-size: 18px; font-weight: bold; display: flex; align-items: center; justify-content: center; border: none; border-radius: 0; background-color: #07c160; color:#fff;"
          >
            打开小程序
          </button>
        </script>
      </wx-open-launch-weapp>
      <wx-open-launch-weapp v-else :username="originalID" :path="appPath">
        <!-- replace -->
        <script type="text/wxtag-template">
          <button v-else style="width: 200px; height: 45px; text-align: center; font-size: 17px; font-weight: bold; display: block; margin: 0 auto; padding: 8px 24px; border: none; border-radius: 4px; background-color: #07c160; color:#fff;">
            打开小程序
          </button>
        </script>
      </wx-open-launch-weapp>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    btnImg: String,
    appPath: String,
    placeBottom: Boolean,
  },
  data() {
    const { cloudResource = {} } = window

    return {
      appName: cloudResource.appName || '',
      originalID: cloudResource.appOriginalID || '',
    }
  },
  computed: {},
  mounted() {},
}
</script>

<style scoped lang="less">
.bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

  p {
    margin-bottom: 4.5rem;
  }

  wx-open-launch-weapp {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
