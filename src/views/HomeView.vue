<template>
  <div class="mt-5">
    <div class="flex justify-center">
      <BotList class="max-w-xl" />
    </div>
    <Divider />
    <div
      title="FaiQuants logo"
      class="logo-svg my-5 mx-auto dark:bg-white bg-black sm:w-[250px] sm:h-[250px] w-[150px] h-[150px] transition-all duration-300"
    />
    <h1 class="font-bold text-2xl sm:text-4xl mb-4 transition-all">欢迎使用FaiQuants量化交易程序</h1>
    <div>此页面用于您配置您的交易机器人.</div>
    <Divider />
    <p class="mb-2">
      如果需要帮助, 可以加入<a href="https://discord.gg/aH8hd5Ez">Discord讨论组</a>查找帮助文档.
    </p>

    <p class="mb-5">祝您交易愉快！ - <i>FaiQuants工作组</i></p>
  </div>
</template>

<style lang="css" scoped>
.logo-svg {
  -webkit-mask: url(../assets/freqtrade-logo-mask.png) no-repeat center;
  -webkit-mask-size: 240px 240px;
  mask: url(../assets/freqtrade-logo-mask.png) no-repeat center;
  mask-size: contain;
}
</style>
