forceexit
<template>
  <div>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || isRunning"
      title="开启交易"
      @click="botStore.activeBot.startBot()"
    >
      <i-mdi-play height="24" width="24" />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="暂停交易 - 也停止处理未平仓交易."
      @click="handleStopBot()"
    >
      <i-mdi-stop height="24" width="24" />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="停止买入 - 不再买入, 但仍处理已开仓订单"
      @click="handleStopBuy()"
    >
      <i-mdi-pause height="24" width="24" />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading"
      title="重新加载配置 - 重新加载配置，包括策略，重置所有动态更改的设置."
      @click="handleReloadConfig()"
    >
      <i-mdi-reload height="24" width="24" />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading"
      title="全部平仓"
      @click="handleForceExit()"
    >
      <i-mdi-close-box-multiple height="24" width="24" />
    </button>
    <button
      v-if="botStore.activeBot.botState && botStore.activeBot.botState.force_entry_enable"
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="开仓 - 立即以可选价格创建订单。然后根据策略规则处理退出."
      @click="forceEnter = true"
    >
      <i-mdi-plus-box-multiple-outline style="font-size: 20px" />
    </button>
    <button
      v-if="botStore.activeBot.isWebserverMode && false"
      :disabled="botStore.activeBot.isTrading"
      class="btn btn-secondary btn-sm ms-1"
      title="开始交易模式"
      @click="botStore.activeBot.startTrade()"
    >
      <i-mdi-play class="fs-4" />
    </button>
    <ForceEntryForm v-model="forceEnter" :pair="botStore.activeBot.selectedPair" />
    <MessageBox ref="msgBox" />
  </div>
</template>

<script setup lang="ts">
import MessageBox, { MsgBoxObject } from '@/components/general/MessageBox.vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import { ForceSellPayload } from '@/types';

import ForceEntryForm from './ForceEntryForm.vue';

const botStore = useBotStore();
const forceEnter = ref<boolean>(false);
const msgBox = ref<typeof MessageBox>();

const isRunning = computed((): boolean => {
  return botStore.activeBot.botState?.state === 'running';
});

const handleStopBot = () => {
  const msg: MsgBoxObject = {
    title: '停止机器人',
    message: '停止机器人的循环运行?',
    accept: () => {
      botStore.activeBot.stopBot();
    },
  };
  msgBox.value?.show(msg);
};

const handleStopBuy = () => {
  const msg: MsgBoxObject = {
    title: '停止买入',
    message: '机器人仍继续处理已开仓订单.',
    accept: () => {
      botStore.activeBot.stopBuy();
    },
  };
  msgBox.value?.show(msg);
};

const handleReloadConfig = () => {
  const msg: MsgBoxObject = {
    title: '重新加载',
    message: '重新加载配置(包括策略)?',
    accept: () => {
      console.log('重载中...');
      botStore.activeBot.reloadConfig();
    },
  };
  msgBox.value?.show(msg);
};

const handleForceExit = () => {
  const msg: MsgBoxObject = {
    title: '全部平仓',
    message: '是否对所有开仓订单进行强平?',
    accept: () => {
      const payload: ForceSellPayload = {
        tradeid: 'all',
        // TODO: support ordertype (?)
      };
      botStore.activeBot.forceexit(payload);
    },
  };
  msgBox.value?.show(msg);
};
</script>
