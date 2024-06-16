<template>
  <div class="home">
    <div class="d-flex justify-content-center">
      <bot-list />
    </div>
    <hr />
    <!-- <img alt="Freqtrade logo" src="../assets/freqtrade-logo.png" width="450px" class="my-5" /> -->
    <div title="Freqtrade logo" class="logo-svg my-5 mx-auto" />
    <div>
      <h3>欢迎使用FaiTrader量化交易程序</h3>
    </div>
    <div>此页面允许您配置您的交易机器人.</div>
    <br />
    <p>
      如果需要帮助, 可以加入<a href="https://www.freqtrade.io/en/latest/">Discord讨论组</a>查找帮助文档.
    </p>

    <p>祝您交易愉快！<i>FaiTrader工作组</i></p>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.home {
  margin-top: 1.5em;
}
.logo-svg {
  -webkit-mask: url(../assets/freqtrade-logo-mask.png) no-repeat center;
  -webkit-mask-size: 240px 240px;
  mask: url(../assets/freqtrade-logo-mask.png) no-repeat center;
  mask-size: contain;
  width: 250px;
  height: 250px;
}
</style>
