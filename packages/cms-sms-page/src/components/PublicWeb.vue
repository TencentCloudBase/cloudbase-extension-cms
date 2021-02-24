<template>
  <div id="public-web-container" class="center">
    <div :class="{ bottom: bgImg }">
      <template v-if="btnImg">
        <img id="btnImg" :src="btnImg" @click="onOpenWeapp" />
      </template>
      <template v-else>
        <a
          href="javascript:"
          @click="onOpenWeapp"
          class="weui-btn weui-btn_primary weui-btn_loading"
        >
          <span class="weui-primary-loading weui-primary-loading_transparent" v-if="loading">
            <i class="weui-primary-loading__dot"></i>
          </span>
          打开小程序
        </a>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    bgImg: String,
    btnImg: String,
    loading: Boolean,
    openWeapp: Function,
  },
  data() {
    const { cloudResource = {} } = window
    return {
      appName: cloudResource.appName || '',
      originalID: cloudResource.appOriginalID || '',
    }
  },
  methods: {
    onOpenWeapp() {
      this.openWeapp()
    },
  },
}
</script>

<style lang="less" scoped>
#btnImg {
  position: fixed;
  width: 100%;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.bottom {
  width: 100%;
  .weui-btn {
    width: 100%;
    height: 3rem;
    border-radius: 0;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
