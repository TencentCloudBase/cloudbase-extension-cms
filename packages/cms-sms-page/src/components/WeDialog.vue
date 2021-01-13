<template>
  <div class="js_dialog" id="" v-show="visible">
    <div class="weui-mask"></div>
    <div class="weui-dialog">
      <div class="weui-dialog__bd">
        {{ message }}
      </div>
      <div class="weui-dialog__ft" @click="this.onOk">
        <a href="javascript:" class="weui-dialog__btn weui-dialog__btn_primary">
          我知道了
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    message: String,
    onOk: Function,
  },
  name: "WeDialog",
};
</script>

<style scoped>
.js_dialog {
  transition: opacity 0.2s linear 0s;
}
</style>
