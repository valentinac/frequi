<template>
  <grid-layout
    class="h-100 w-100"
    :row-height="50"
    :layout="gridLayoutData"
    :vertical-compact="false"
    :margin="[5, 5]"
    :responsive-layouts="responsiveGridLayouts"
    :is-resizable="!isLayoutLocked"
    :is-draggable="!isLayoutLocked"
    :responsive="true"
    :prevent-collision="true"
    :cols="{ lg: 12, md: 12, sm: 12, xs: 4, xxs: 2 }"
    :col-num="12"
    @layout-updated="layoutUpdatedEvent"
    @update:breakpoint="breakpointChanged"
  >
    <template #default="{ gridItemProps }">
      <grid-item
        v-bind="gridItemProps"
        :i="gridLayoutDaily.i"
        :x="gridLayoutDaily.x"
        :y="gridLayoutDaily.y"
        :w="gridLayoutDaily.w"
        :h="gridLayoutDaily.h"
        :min-w="3"
        :min-h="4"
        drag-allow-from=".drag-header"
      >
        <DraggableContainer :header="`每日盈亏 ${botStore.botCount > 1 ? 'combined' : ''}`">
          <TimePeriodChart
            v-if="botStore.allDailyStatsSelectedBots"
            :daily-stats="botStore.allDailyStatsSelectedBots"
            :show-title="false"
          />
        </DraggableContainer>
      </grid-item>
      <grid-item
        v-bind="gridItemProps"
        :i="gridLayoutBotComparison.i"
        :x="gridLayoutBotComparison.x"
        :y="gridLayoutBotComparison.y"
        :w="gridLayoutBotComparison.w"
        :h="gridLayoutBotComparison.h"
        :min-w="3"
        :min-h="4"
        drag-allow-from=".drag-header"
      >
        <DraggableContainer header="机器人列表">
          <bot-comparison-list />
        </DraggableContainer>
      </grid-item>
      <grid-item
        v-bind="gridItemProps"
        :i="gridLayoutAllOpenTrades.i"
        :x="gridLayoutAllOpenTrades.x"
        :y="gridLayoutAllOpenTrades.y"
        :w="gridLayoutAllOpenTrades.w"
        :h="gridLayoutAllOpenTrades.h"
        :min-w="3"
        :min-h="4"
        drag-allow-from=".drag-header"
      >
        <DraggableContainer>
          <template #header>
            <div class="d-flex justify-content-center">
              进行中的交易
              <InfoBox
                class="ms-2"
                hint="所有选定机器人的进行中的交易，点击交易进入交易页面."
              />
            </div>
          </template>
          <trade-list active-trades :trades="botStore.allOpenTradesSelectedBots" multi-bot-view />
        </DraggableContainer>
      </grid-item>
      <grid-item
        v-bind="gridItemProps"
        :i="gridLayoutCumChart.i"
        :x="gridLayoutCumChart.x"
        :y="gridLayoutCumChart.y"
        :w="gridLayoutCumChart.w"
        :h="gridLayoutCumChart.h"
        :min-w="3"
        :min-h="4"
        drag-allow-from=".drag-header"
      >
        <DraggableContainer header="盈亏累计">
          <CumProfitChart
            :trades="botStore.allTradesSelectedBots"
            :open-trades="botStore.allOpenTradesSelectedBots"
            :show-title="false"
          />
        </DraggableContainer>
      </grid-item>
      <grid-item
        v-bind="gridItemProps"
        :i="gridLayoutAllClosedTrades.i"
        :x="gridLayoutAllClosedTrades.x"
        :y="gridLayoutAllClosedTrades.y"
        :w="gridLayoutAllClosedTrades.w"
        :h="gridLayoutAllClosedTrades.h"
        :min-w="3"
        :min-h="4"
        drag-allow-from=".drag-header"
      >
        <DraggableContainer>
          <template #header>
            <div class="d-flex justify-content-center">
              已完成的交易
              <InfoBox
                class="ms-2"
                hint="所有选定机器人的已完成交易。点击交易进入交易页面."
              />
            </div>
          </template>
          <trade-list
            :active-trades="false"
            show-filter
            :trades="botStore.allClosedTradesSelectedBots"
            multi-bot-view
          />
        </DraggableContainer>
      </grid-item>
      <grid-item
        v-bind="gridItemProps"
        :i="gridLayoutProfitDistribution.i"
        :x="gridLayoutProfitDistribution.x"
        :y="gridLayoutProfitDistribution.y"
        :w="gridLayoutProfitDistribution.w"
        :h="gridLayoutProfitDistribution.h"
        :min-w="3"
        :min-h="4"
        drag-allow-from=".drag-header"
      >
        <DraggableContainer header="盈亏分布图">
          <ProfitDistributionChart :trades="botStore.allTradesSelectedBots" :show-title="false" />
        </DraggableContainer>
      </grid-item>
      <grid-item
        v-bind="gridItemProps"
        :i="gridLayoutTradesLogChart.i"
        :x="gridLayoutTradesLogChart.x"
        :y="gridLayoutTradesLogChart.y"
        :w="gridLayoutTradesLogChart.w"
        :h="gridLayoutTradesLogChart.h"
        :min-w="3"
        :min-h="4"
        drag-allow-from=".drag-header"
      >
        <DraggableContainer header="每日交易盈亏">
          <TradesLogChart :trades="botStore.allTradesSelectedBots" :show-title="false" />
        </DraggableContainer>
      </grid-item>
    </template>
  </grid-layout>
</template>

<script setup lang="ts">
import { DashboardLayout, findGridLayout, useLayoutStore } from '@/stores/layout';
import { useBotStore } from '@/stores/ftbotwrapper';
import { GridItemData } from '@/types';

const botStore = useBotStore();

const layoutStore = useLayoutStore();
const currentBreakpoint = ref('');

const breakpointChanged = (newBreakpoint: string) => {
  // console.log('breakpoint:', newBreakpoint);
  currentBreakpoint.value = newBreakpoint;
};
const isResizableLayout = computed(() =>
  ['', 'sm', 'md', 'lg', 'xl'].includes(currentBreakpoint.value),
);
const isLayoutLocked = computed(() => {
  return layoutStore.layoutLocked || !isResizableLayout.value;
});

const gridLayoutData = computed((): GridItemData[] => {
  if (isResizableLayout.value) {
    return layoutStore.dashboardLayout;
  }
  return [...layoutStore.getDashboardLayoutSm];
});

const layoutUpdatedEvent = (newLayout) => {
  if (isResizableLayout.value) {
    console.log('newlayout', newLayout);
    console.log('saving dashboard');
    layoutStore.dashboardLayout = newLayout;
  }
};

const gridLayoutDaily = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.dailyChart);
});

const gridLayoutBotComparison = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.botComparison);
});

const gridLayoutAllOpenTrades = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.allOpenTrades);
});
const gridLayoutAllClosedTrades = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.allClosedTrades);
});

const gridLayoutCumChart = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.cumChartChart);
});
const gridLayoutProfitDistribution = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.profitDistributionChart);
});
const gridLayoutTradesLogChart = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.tradesLogChart);
});

const responsiveGridLayouts = computed(() => {
  return {
    sm: layoutStore.getDashboardLayoutSm,
  };
});

onMounted(async () => {
  botStore.allGetDaily({ timescale: 30 });
  // botStore.activeBot.getTrades();
  botStore.activeBot.getOpenTrades();
  botStore.activeBot.getProfit();
});
</script>

<style scoped></style>
