<template>
  <div class="container mt-3">
    <b-card header="FaiTrader界面设置">
      <div class="text-start d-flex flex-column gap-2">
        <p>界面版本: {{ settingsStore.uiVersion }}</p>
        <div class="d-flex flex-column border rounded p-2 mb-2 gap-2">
          <h4>UI 设置</h4>
          <b-form-group
            description="锁定动态布局，使其不能再移动。可以从导航栏顶部重新设置."
          >
            <b-form-checkbox v-model="layoutStore.layoutLocked">锁定布局</b-form-checkbox>
          </b-form-group>
          <b-form-group description="重置动态布局恢复到初始状态.">
            <b-button size="sm" class="me-1" @click="resetDynamicLayout">重置布局</b-button>
          </b-form-group>
          <b-form-group
            label="在顶部显示未平仓交易"
            description="决定是否应该将未平仓交易可视化"
          >
            <b-form-select
              v-model="settingsStore.openTradesInTitle"
              :options="openTradesOptions"
            ></b-form-select>
          </b-form-group>
          <b-form-group
            label="UTC时区"
            description="选择时区(我们建议使用UTC，因为交易所通常使用UTC)"
          >
            <b-form-select
              v-model="settingsStore.timezone"
              :options="timezoneOptions"
            ></b-form-select>
          </b-form-group>
          <b-form-group description="保持后台同步运行，当其他机器人被选中.">
            <b-form-checkbox v-model="settingsStore.backgroundSync"
              >Background sync</b-form-checkbox
            >
          </b-form-group>
          <b-form-group description="在强制退出交易时使用确认对话框.">
            <b-form-checkbox v-model="settingsStore.confirmDialog"
              >Show Confirm Dialog for Trade Exits</b-form-checkbox
            >
          </b-form-group>
        </div>

        <div class="d-flex flex-column border rounded p-2 mb-2 gap-2">
          <h4>K线设置</h4>
          <b-form-group description="在你的图表中使用平均K线(Heikin Ashi)">
            <b-form-checkbox v-model="settingsStore.useHeikinAshiCandles">使用平均K线（Heikin Ashi）.</b-form-checkbox
            >
          </b-form-group>
          <b-form-group
            description="可以减少大数据帧的传输大小。如果图表配置改变，可能需要额外的请求."
          >
            <b-form-checkbox v-model="settingsStore.useReducedPairCalls"> 只获取必须字段(建议勾选).</b-form-checkbox
            >
          </b-form-group>
          <b-form-group description="K线颜色偏好">
            <b-form-radio-group
              id="settings-color-preference-radio-group"
              v-model="colorStore.colorPreference"
              name="color-preference-options"
              @change="colorStore.updateProfitLossColor"
            >
              <b-form-radio
                v-for="option in colorPreferenceOptions"
                :key="option.value"
                :value="option.value"
              >
                <div class="d-flex">
                  <span class="me-2">{{ option.text }}</span>
                  <i-mdi-arrow-up-thin
                    :color="
                      option.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorProfit
                        : colorStore.colorLoss
                    "
                    class="color-candle-arrows"
                  />
                  <i-mdi-arrow-down-thin
                    :color="
                      option.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorLoss
                        : colorStore.colorProfit
                    "
                    class="color-candle-arrows"
                  />
                </div>
              </b-form-radio>
            </b-form-radio-group>
          </b-form-group>
        </div>
        <div class="d-flex flex-column border rounded p-2 mb-2 gap-2">
          <b-form-group description="通知">
            <h4>通知设置</h4>
            <b-form-checkbox v-model="settingsStore.notifications[FtWsMessageTypes.entryFill]"
              >开仓通知</b-form-checkbox
            >
            <b-form-checkbox v-model="settingsStore.notifications[FtWsMessageTypes.exitFill]"
              >平仓通知</b-form-checkbox
            >
            <b-form-checkbox v-model="settingsStore.notifications[FtWsMessageTypes.entryCancel]"
              >取消开仓通知</b-form-checkbox
            >
            <b-form-checkbox v-model="settingsStore.notifications[FtWsMessageTypes.exitCancel]"
              >取消平仓通知</b-form-checkbox
            >
          </b-form-group>
        </div>
      </div>
    </b-card>
  </div>
</template>

<script setup lang="ts">
import { OpenTradeVizOptions, useSettingsStore } from '@/stores/settings';
import { useLayoutStore } from '@/stores/layout';
import { showAlert } from '@/shared/alerts';
import { FtWsMessageTypes } from '@/types/wsMessageTypes';
import { ColorPreferences, useColorStore } from '@/stores/colors';

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

<style lang="scss" scoped>
.color-candle-arrows {
  margin-left: -0.5rem;
  margin-top: 2px;
}
</style>
