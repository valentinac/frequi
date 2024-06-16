<script setup lang="ts">
import { formatPrice } from '@/shared/formatters';

import { useBotStore } from '@/stores/ftbotwrapper';
import { TableField } from 'bootstrap-vue-next';

const botStore = useBotStore();
enum PerformanceOptions {
  performance = 'performance',
  entryStats = 'entryStats',
  exitStats = 'exitStats',
  mixTagStats = 'mixTagStats',
}
const selectedOption = ref<PerformanceOptions>(PerformanceOptions.performance);

function formatTextLen(text: string, len: number) {
  if (text.length > len) {
    return text.substring(0, len) + '...';
  }
  return text;
}

const performanceTable = computed<TableField[]>(() => {
  const textLength = 17;
  const initialCol = {
    [PerformanceOptions.performance]: { key: 'pair', label: '币种' },
    [PerformanceOptions.entryStats]: {
      key: 'enter_tag',
      label: '开仓标签',
      formatter: (v: unknown) => formatTextLen(v as string, textLength),
    },
    [PerformanceOptions.exitStats]: {
      key: 'exit_reason',
      label: '平仓原因',
      formatter: (v: unknown) => formatTextLen(v as string, textLength),
    },
    [PerformanceOptions.mixTagStats]: {
      key: 'mix_tag',
      label: '混合标签',
      formatter: (v: unknown) => formatTextLen(v as string, textLength),
    },
  };
  return [
    initialCol[selectedOption.value],
    { key: 'profit', label: '利润率%' },
    {
      key: 'profit_abs',
      label: `利润${botStore.activeBot.botState?.stake_currency}`,
      formatter: (v: unknown) => formatPrice(v as number, 5),
    },
    { key: 'count', label: '总数' },
  ];
});

const performanceData = computed(() => {
  if (selectedOption.value === PerformanceOptions.performance) {
    return botStore.activeBot.performanceStats;
  }
  if (selectedOption.value === PerformanceOptions.entryStats) {
    return botStore.activeBot.entryStats;
  }
  if (selectedOption.value === PerformanceOptions.exitStats) {
    return botStore.activeBot.exitStats;
  }
  if (selectedOption.value === PerformanceOptions.mixTagStats) {
    return botStore.activeBot.mixTagStats;
  }
  return [];
});

const hasAdvancedStats = computed(() => botStore.activeBot.botApiVersion >= 2.34);

const options = [
  { value: PerformanceOptions.performance, text: '运行表现' },
  { value: PerformanceOptions.entryStats, text: '开仓' },
  { value: PerformanceOptions.exitStats, text: '平仓' },
  { value: PerformanceOptions.mixTagStats, text: '混合标签' },
];

function refreshSummary() {
  if (selectedOption.value === PerformanceOptions.performance) {
    botStore.activeBot.getPerformance();
  }
  if (selectedOption.value === PerformanceOptions.entryStats) {
    botStore.activeBot.getEntryStats();
  }
  if (selectedOption.value === PerformanceOptions.exitStats) {
    botStore.activeBot.getExitStats();
  }
  if (selectedOption.value === PerformanceOptions.mixTagStats) {
    botStore.activeBot.getMixTagStats();
  }
}

onMounted(() => {
  refreshSummary();
});
</script>
<template>
  <div>
    <div class="mb-2">
      <h3 class="me-auto d-inline">运行表现</h3>
      <b-button class="float-end" size="sm" @click="refreshSummary">
        <i-mdi-refresh />
      </b-button>
    </div>
    <b-form-radio-group
      v-if="hasAdvancedStats"
      id="order-direction"
      v-model="selectedOption"
      :options="options"
      name="radios-btn-default"
      size="sm"
      buttons
      style="min-width: 10em"
      button-variant="outline-primary"
      @change="refreshSummary"
    ></b-form-radio-group>
    <b-table class="table-sm" :items="performanceData" :fields="performanceTable"></b-table>
  </div>
</template>
