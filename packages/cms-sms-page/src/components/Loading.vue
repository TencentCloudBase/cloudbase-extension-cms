<template>
  <div id="loading" class="center">
    <div>
      <span class="weui-primary-loading weui-primary-loading_brand">
        <span class="weui-primary-loading__dot"></span>
      </span>
      <p>
        加载中...
      </p>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="less">
#loading {
  .weui-primary-loading {
    height: 48px;
    width: 48px;

    &:before,
    &:after {
      border: 3px solid;
    }

    &:before {
      border-right-width: 0;
      width: 24px;
      height: 48px;
      border-top-left-radius: 48px;
      border-bottom-left-radius: 48px;
    }

    &:after {
      width: 24px;
      height: 48px;
      border-left-width: 0;
      border-top-right-radius: 48px;
      border-bottom-right-radius: 48px;
    }
  }

  p {
    margin-top: 1rem;
  }
}
</style>
