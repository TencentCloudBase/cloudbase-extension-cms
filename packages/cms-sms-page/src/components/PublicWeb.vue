<template>
  <div id="public-web-container" class="center">
    <div :class="{ bottom: bgImg }">
      <p>正在打开{{ appName }}...</p>
      <a
        href="javascript:"
        @click="this.onOpenWeapp"
        class="weui-btn weui-btn_primary weui-btn_loading"
      >
        <span
          class="weui-primary-loading weui-primary-loading_transparent"
          v-if="loading"
        >
          <i class="weui-primary-loading__dot"></i>
        </span>
        打开小程序
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    bgImg: String,
    loading: Boolean,
    openWeapp: Function,
  },
  data() {
    const { cloudResource = {} } = window;
    return {
      appName: cloudResource.appName || "",
      originalID: cloudResource.appOriginalID || "",
    };
  },
  methods: {
    onOpenWeapp() {
      this.openWeapp();
    },
  },
};
</script>

<style lang="less" scoped>
#public-web-container {
  height: 100%;
}

.weui-btn {
  margin-top: 2rem;
}

.bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

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
