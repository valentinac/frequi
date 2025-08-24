<script setup lang="ts">
import { FtWsMessageTypes } from '@/types/wsMessageTypes';

const settingsStore = useSettingsStore();
const colorStore = useColorStore();
const layoutStore = useLayoutStore();

const timezoneOptions = ['UTC', Intl.DateTimeFormat().resolvedOptions().timeZone];
const openTradesOptions = [
  { value: OpenTradeVizOptions.showPill, text: 'Show pill in icon' },
  { value: OpenTradeVizOptions.asTitle, text: 'Show in title' },
  { value: OpenTradeVizOptions.noOpenTrades, text: "Don't show open trades in header" },
];
const colorPreferenceOptions = [
  { value: ColorPreferences.GREEN_UP, text: 'Green Up/Red Down' },
  { value: ColorPreferences.RED_UP, text: 'Green Down/Red Up' },
];

const resetDynamicLayout = () => {
  layoutStore.resetTradingLayout();
  layoutStore.resetDashboardLayout();
  showAlert('Layouts have been reset.');
};
</script>

<template>
  <Card class="mx-auto mt-3 p-4 max-w-4xl">
    <template #title>FaiQ UI设置</template>
    <template #content>
      <div class="flex flex-col gap-4 text-start dark:text-surface-300">
        <p class="text-left">UI版本: {{ settingsStore.uiVersion }}</p>

        <div class="border border-surface-400 rounded-sm p-4 space-y-4">
          <h4 class="text-xl font-semibold">UI设置</h4>

          <BaseCheckbox v-model="layoutStore.layoutLocked" class="space-y-1">
            锁定动态布局
            <template #hint>
              锁定动态布局，使其不能再移动。可以从导航栏顶部重新设置.
            </template>
          </BaseCheckbox>

          <div class="flex flex-row items-center gap-2 space-y-2">
            <Button severity="secondary" size="small" class="mb-0" @click="resetDynamicLayout"
              >重置布局</Button>
            <small class="block text-surface-600 dark:text-surface-400"
              >重置动态布局恢复到初始状态.</small>
          </div>

          <Divider />

          <div class="space-y-1">
            <label class="block text-sm">在顶部显示未平仓交易</label>
            <Select
              v-model="settingsStore.openTradesInTitle"
              :options="openTradesOptions"
              option-label="text"
              option-value="value"
              size="small"
              class="w-full" />
            <small class="text-surface-600 dark:text-surface-400"
              >决定是否应该将未平仓交易可视化</small>
          </div>

          <div class="space-y-1">
            <label class="block text-sm">UTC时区</label>
            <Select
              v-model="settingsStore.timezone"
              :options="timezoneOptions"
              class="w-full"
              size="small"
            />
            <small class="text-surface-600 dark:text-surface-400"
              >选择时区(我们建议使用UTC，因为交易所通常使用UTC)</small>
          </div>

          <BaseCheckbox v-model="settingsStore.backgroundSync" class="space-y-1">
            后台同步
            <template #hint>当其他机器人被选中时，保持后台同步运行. </template>
          </BaseCheckbox>

          <BaseCheckbox v-model="settingsStore.confirmDialog" class="space-y-1">
            平仓时显示对话框
            <template #hint>在强制退出交易时使用确认对话框.</template>
          </BaseCheckbox>

          <BaseCheckbox v-model="settingsStore.multiPaneButtonsShowText" class="space-y-1">
            在多窗格按钮上显示文本
            <template #hint>在多窗格按钮上显示文本。如果禁用，只显示图像.</template>
          </BaseCheckbox>
        </div>

        <div class="border border-surface-400 rounded-sm p-4 space-y-4">
          <h4 class="text-lg font-semibold">绘图设置</h4>

          <div class="space-y-1">
            <label class="block text-sm">图表显示位置</label>
            <div class="flex gap-4">
              <div class="flex items-center">
                <RadioButton v-model="settingsStore.chartLabelSide" value="left" size="small" />
                <label class="ml-2">左侧</label>
              </div>
              <div class="flex items-center">
                <RadioButton v-model="settingsStore.chartLabelSide" value="right" size="small" />
                <label class="ml-2">右侧</label>
              </div>
            </div>
            <small class="text-surface-600 dark:text-surface-400">
              图表应该显示在左边还是右边?
            </small>
          </div>

          <BaseCheckbox v-model="settingsStore.useHeikinAshiCandles" class="space-y-1">
            使用平均K线（Heikin Ashi）
            <template #hint>在你的图表中使用平均K线(Heikin Ashi)</template>
          </BaseCheckbox>

          <BaseCheckbox v-model="settingsStore.useReducedPairCalls" class="space-y-1">
            只获取必须字段
            <template #hint
              >可以减少大数据帧的传输大小。如果图表配置改变，可能需要额外的请求.</template
            >
          </BaseCheckbox>

          <div>
            <p>默认显示K线数量(默认250)</p>
            <div class="flex flex-row gap-5 w-full items-center">
              <Slider
                v-model="settingsStore.chartDefaultCandleCount"
                class="flex-1"
                :step="50"
                :min="100"
                :max="2000" />
              <InputNumber
                v-model="settingsStore.chartDefaultCandleCount"
                :step="50"
                :min="100"
                :max="2000"
                size="small" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block">K线颜色偏好</label>
            <div class="flex flex-row gap-5 items-center">
              <div
                v-for="option in colorPreferenceOptions"
                :key="option.value"
                class="flex items-center"
              >
                <RadioButton
                  v-model="colorStore.colorPreference"
                  :value="option.value"
                  :input-id="`input-id${option.value}`"
                  size="small"
                  @change="colorStore.updateProfitLossColor"
                />
                <label :for="`input-id${option.value}`" class="ml-2 flex items-center">
                  <span class="mr-2">{{ option.text }}</span>
                  <i-mdi-arrow-up-thin
                    :color="
                      option.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorProfit
                        : colorStore.colorLoss
                    "
                    class="-ml-2"
                  />
                  <i-mdi-arrow-down-thin
                    :color="
                      option.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorLoss
                        : colorStore.colorProfit
                    "
                    class="-ml-2"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="border rounded-sm p-4 space-y-4">
          <h4 class="text-lg font-semibold">通知设置</h4>
          <div class="space-y-2">
            <BaseCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.entryFill]">
              开仓通知
            </BaseCheckbox>
            <BaseCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.exitFill]">
              平仓通知
            </BaseCheckbox>
            <BaseCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.entryCancel]">
              取消开仓通知
            </BaseCheckbox>
            <BaseCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.exitCancel]">
              取消平仓通知
            </BaseCheckbox>
          </div>
        </div>

        <div class="border rounded-sm p-4 space-y-4">
          <h4 class="text-lg font-semibold">回测设置</h4>
          <div>
            <label for="backtestMetrics" class="block text-sm">回测指标</label>
            <MultiSelect
              id="backtestMetrics"
              v-model="settingsStore.backtestAdditionalMetrics"
              :options="availableBacktestMetrics"
              option-label="header"
              option-value="field"
              class="w-full"
              size="small"
              display="chip"
            />
            <small class="text-surface-600 dark:text-surface-400"
              >选择应该在每对/标签的基础上显示哪些指标.</small
            >
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
