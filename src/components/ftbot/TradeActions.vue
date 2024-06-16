<template>
  <div class="d-flex flex-column">
    <b-button
      v-if="botApiVersion <= 1.1"
      class="btn-xs text-start"
      size="sm"
      title="卖出"
      @click="$emit('forceExit', trade)"
    >
      <i-mdi-close-box class="me-1" />卖出
    </b-button>
    <b-button
      v-if="botApiVersion > 1.1"
      class="btn-xs text-start"
      size="sm"
      title="Forceexit limit"
      @click="$emit('forceExit', trade, 'limit')"
    >
      <i-mdi-close-box class="me-1" />限价卖出
    </b-button>
    <b-button
      v-if="botApiVersion > 1.1"
      class="btn-xs text-start mt-1"
      size="sm"
      title="市价卖出"
      @click="$emit('forceExit', trade, 'market')"
    >
      <i-mdi-close-box class="me-1" />市价卖出
    </b-button>
    <b-button
      v-if="botApiVersion > 2.16"
      class="btn-xs text-start mt-1"
      size="sm"
      title="减仓"
      @click="$emit('forceExitPartial', trade)"
    >
      <i-mdi-close-box-multiple class="me-1" />减仓
    </b-button>
    <b-button
      v-if="botApiVersion >= 2.24 && (trade.open_order_id || trade.has_open_orders)"
      class="btn-xs text-start mt-1"
      size="sm"
      title="取消挂单"
      @click="$emit('cancelOpenOrder', trade)"
    >
      <i-mdi-cancel class="me-1" />取消挂单
    </b-button>
    <b-button
      v-if="enableForceEntry"
      class="btn-xs text-start mt-1"
      size="sm"
      title="加仓"
      @click="$emit('forceEntry', trade)"
    >
      <i-mdi-plus-box-multiple-outline class="me-1" />加仓
    </b-button>
    <b-button
      v-if="botApiVersion >= 2.28"
      class="btn-xs text-start mt-1"
      size="sm"
      title="刷新"
      @click="$emit('reloadTrade', trade)"
    >
      <i-mdi-reload-alert class="me-1" />刷新订单
    </b-button>
    <b-button
      class="btn-xs text-start mt-1"
      size="sm"
      title="删除订单"
      @click="$emit('deleteTrade', trade)"
    >
      <i-mdi-delete class="me-1" />删除订单</b-button>
  </div>
</template>

<script setup lang="ts">
import { Trade } from '@/types';

defineProps({
  botApiVersion: {
    type: Number,
    default: 1.0,
  },
  trade: {
    type: Object as () => Trade,
    required: true,
  },
  enableForceEntry: {
    type: Boolean,
    default: false,
  },
});
defineEmits([
  'forceExit',
  'forceExitPartial',
  'cancelOpenOrder',
  'reloadTrade',
  'deleteTrade',
  'forceEntry',
]);
</script>

<style scoped lang="scss"></style>
