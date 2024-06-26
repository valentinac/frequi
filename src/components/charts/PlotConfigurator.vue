<template>
  <div v-if="columns">
    <b-form-group label="绘图配置名称" label-for="idPlotConfigName">
      <plot-config-select allow-edit></plot-config-select>
    </b-form-group>
    <div class="col-mb-3">
      <hr />
      <b-form-group label="绘图目标" label-for="FieldSel">
        <edit-value
          v-model="selSubPlot"
          :allow-edit="!isMainPlot"
          allow-add
          editable-name="plot configuration"
          align-vertical
          @new="addSubplot"
          @delete="deleteSubplot"
          @rename="renameSubplot"
        >
          <b-form-select id="FieldSel" v-model="selSubPlot" :options="subplots" :select-size="5">
          </b-form-select>
        </edit-value>
      </b-form-group>
    </div>
    <hr />
    <div>
      <b-form-group label="图表中包含的指标" label-for="selectedIndicators">
        <b-form-select
          id="selectedIndicators"
          v-model="selIndicatorName"
          :disabled="addNewIndicator"
          :options="usedColumns"
          :select-size="4"
        >
        </b-form-select>
      </b-form-group>
    </div>
    <div class="d-flex flex-row mt-1">
      <b-button
        variant="secondary"
        title="从图表中移除指标"
        size="sm"
        :disabled="!selIndicatorName"
        class="col"
        @click="removeIndicator"
      >
        移除指标
      </b-button>
      <b-button
        variant="primary"
        title="向图表中添加新指标"
        size="sm"
        class="ms-1 col"
        :disabled="addNewIndicator"
        @click="
          addNewIndicator = !addNewIndicator;
          selIndicatorName = '';
        ">添加新指标
      </b-button>
    </div>

    <PlotIndicatorSelect
      v-if="addNewIndicator"
      :columns="columns"
      class="mt-1"
      label="选择指标添加到图表"
      @indicator-selected="addNewIndicatorSelected"
    />

    <plot-indicator
      v-if="selIndicatorName"
      v-model="selIndicator"
      class="mt-1"
      :columns="columns"
    />
    <hr />

    <div class="d-flex flex-row">
      <b-button
        class="ms-1 col"
        variant="secondary"
        size="sm"
        :disabled="addNewIndicator"
        title="重置成最后一次保存的配置"
        @click="loadPlotConfig"
        >重置</b-button
      >

      <!--
        Does Resetting a config to "nothing" make sense, or can this be done via "delete / create"?
        <b-button
        class="ms-1 col"
        variant="secondary"
        size="sm"
        :disabled="addNewIndicator"
        title="Start with empty configuration"
        @click="clearConfig"
        >Reset</b-button
      > -->
      <b-button
        :disabled="
          (botStore.activeBot.isWebserverMode && botStore.activeBot.botApiVersion < 2.23) ||
          !botStore.activeBot.isBotOnline ||
          addNewIndicator
        "
        class="ms-1 col"
        variant="secondary"
        size="sm"
        @click="loadPlotConfigFromStrategy"
      >
        从策略中
      </b-button>
      <b-button
        id="showButton"
        class="ms-1 col"
        variant="secondary"
        size="sm"
        :disabled="addNewIndicator"
        title="显示配置以便于转移到策略"
        @click="showConfig = !showConfig"
        >{{ showConfig ? '隐藏' : '显示' }}</b-button
      >

      <b-button
        class="ms-1 col"
        variant="primary"
        size="sm"
        data-toggle="tooltip"
        :disabled="addNewIndicator"
        title="保存配置"
        @click="savePlotConfig">保存</b-button
      >
    </div>
    <b-button
      v-if="showConfig"
      class="ms-1 mt-1"
      variant="secondary"
      size="sm"
      title="从下面的文本框加载配置"
      @click="loadConfigFromString"
      >从字符串加载</b-button
    >
    <div v-if="showConfig" class="col-mb-5 ms-1 mt-2">
      <b-form-textarea
        id="TextArea"
        v-model="plotConfigJson"
        class="textArea"
        size="sm"
        :state="tempPlotConfigValid"
      >
      </b-form-textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showAlert } from '@/shared/alerts';
import { IndicatorConfig, PlotConfig } from '@/types';

import { deepClone } from '@/shared/deepClone';
import { useBotStore } from '@/stores/ftbotwrapper';
import { usePlotConfigStore } from '@/stores/plotConfig';

import randomColor from '@/shared/randomColor';

const props = defineProps({
  columns: { required: true, type: Array as () => string[] },
  isVisible: { required: true, default: false, type: Boolean },
});

const plotStore = usePlotConfigStore();
const botStore = useBotStore();

const plotConfigNameLoc = ref('default');
const selIndicatorName = ref('');
const addNewIndicator = ref(false);
const showConfig = ref(false);
const selSubPlot = ref('main_plot');
const tempPlotConfig = ref<PlotConfig>();
const tempPlotConfigValid = ref(true);

const isMainPlot = computed(() => {
  return selSubPlot.value === 'main_plot';
});

const currentPlotConfig = computed(() => {
  if (isMainPlot.value) {
    return plotStore.editablePlotConfig.main_plot;
  }

  return plotStore.editablePlotConfig.subplots[selSubPlot.value];
});
const subplots = computed((): string[] => {
  // Subplot keys (for selection window)
  return ['main_plot', ...Object.keys(plotStore.editablePlotConfig.subplots)];
});
const usedColumns = computed((): { html: string; value: string }[] => {
  let usedCols: string[] = [];
  if (isMainPlot.value) {
    usedCols = Object.keys(plotStore.editablePlotConfig.main_plot);
  }
  if (selSubPlot.value in plotStore.editablePlotConfig.subplots) {
    usedCols = Object.keys(plotStore.editablePlotConfig.subplots[selSubPlot.value]);
  }
  return usedCols.map((col) => ({
    value: col,
    html: !props.columns.includes(col)
      ? `<span title="列名不可用">${col} <-- not available in this chart</span>`
      : col,
  }));
});

function addIndicator(newIndicator: Record<string, IndicatorConfig>) {
  // const { plotConfig.value } = this;
  const name = Object.keys(newIndicator)[0];
  const indicator = newIndicator[name];
  if (isMainPlot.value) {
    // console.log(`Adding ${name} to MainPlot`);
    plotStore.editablePlotConfig.main_plot[name] = { ...indicator };
  } else {
    // console.log(`Adding ${name} to ${selSubPlot.value}`);
    plotStore.editablePlotConfig.subplots[selSubPlot.value][name] = { ...indicator };
  }

  plotStore.editablePlotConfig = { ...plotStore.editablePlotConfig };
  // Reset random color
  addNewIndicator.value = false;
}

const selIndicator = computed({
  get() {
    if (addNewIndicator.value) {
      return {};
    }
    if (selIndicatorName.value) {
      return {
        [selIndicatorName.value]: currentPlotConfig.value[selIndicatorName.value],
      };
    }
    return {};
  },
  set(newValue: Record<string, IndicatorConfig>) {
    const name = Object.keys(newValue)[0];
    // this.currentPlotConfig[this.selIndicatorName] = { ...newValue[name] };
    // this.emitPlotConfig();
    if (name && newValue) {
      addIndicator(newValue);
    } else {
      addNewIndicator.value = false;
    }
  },
});

const plotConfigJson = computed({
  get() {
    return JSON.stringify(plotStore.editablePlotConfig, null, 2);
  },
  set(newValue: string) {
    try {
      tempPlotConfig.value = JSON.parse(newValue);
      // TODO: Should Validate schema validity (should be PlotConfig type...)
      tempPlotConfigValid.value = true;
    } catch (err) {
      tempPlotConfigValid.value = false;
    }
  },
});

function removeIndicator() {
  if (isMainPlot.value) {
    console.log(`Removing ${selIndicatorName.value} from MainPlot`);
    delete plotStore.editablePlotConfig.main_plot[selIndicatorName.value];
  } else {
    console.log(`Removing ${selIndicatorName.value} from ${selSubPlot.value}`);
    delete plotStore.editablePlotConfig.subplots[selSubPlot.value][selIndicatorName.value];
  }

  plotStore.editablePlotConfig = { ...plotStore.editablePlotConfig };
  selIndicatorName.value = '';
}
function addSubplot(newSubplotName: string) {
  plotStore.editablePlotConfig.subplots = {
    ...plotStore.editablePlotConfig.subplots,
    [newSubplotName]: {},
  };
  selSubPlot.value = newSubplotName;
}

function deleteSubplot(subplotName: string) {
  delete plotStore.editablePlotConfig.subplots[subplotName];
  // plotStore.editablePlotConfig.subplots = { ...plotStore.editablePlotConfig.subplots };
  selSubPlot.value = subplots.value[subplots.value.length - 1];
}

function renameSubplot(oldName: string, newName: string) {
  plotStore.editablePlotConfig.subplots[newName] = plotStore.editablePlotConfig.subplots[oldName];
  delete plotStore.editablePlotConfig.subplots[oldName];
  selSubPlot.value = newName;
}

function loadPlotConfig() {
  // Reset from store
  plotStore.editablePlotConfig = deepClone(plotStore.customPlotConfigs[plotStore.plotConfigName]);
}

function loadConfigFromString() {
  if (tempPlotConfig.value !== undefined && tempPlotConfigValid.value) {
    plotStore.editablePlotConfig = tempPlotConfig.value;
  }
}

// function clearConfig() {
//   // Use empty config
//   plotStore.editablePlotConfig = { ...EMPTY_PLOTCONFIG };
// }

async function loadPlotConfigFromStrategy() {
  if (botStore.activeBot.isWebserverMode && !botStore.activeBot.strategy.strategy) {
    showAlert(`没有选择策略，无法加载图表配置.`);
    return;
  }
  try {
    await botStore.activeBot.getStrategyPlotConfig();
    if (botStore.activeBot.strategyPlotConfig) {
      plotStore.editablePlotConfig = botStore.activeBot.strategyPlotConfig;
    }
  } catch (data) {
    //
    showAlert('未能从策略加载图表配置.');
  }
}

function savePlotConfig() {
  plotStore.saveCustomPlotConfig(plotConfigNameLoc.value, plotStore.editablePlotConfig);
}

function addNewIndicatorSelected(indicator?: string) {
  addNewIndicator.value = false;

  if (indicator) {
    addIndicator({
      [indicator]: {
        color: randomColor(),
      },
    });
    selIndicatorName.value = indicator;
  }
}

watch(selSubPlot, () => {
  // Deselect Indicator when switching selected plot
  selIndicatorName.value = '';
});

watch(
  () => plotStore.plotConfigName,
  () => {
    selIndicatorName.value = '';
    // selSubPlot.value = '';
    plotConfigNameLoc.value = plotStore.plotConfigName;
  },
);

watch(
  () => props.isVisible,
  () => {
    if (props.isVisible) {
      // Deep clone and assign to editable
      plotStore.editablePlotConfig = deepClone(plotStore.plotConfig);
      plotStore.isEditing = true;
      plotConfigNameLoc.value = plotStore.plotConfigName;
    } else {
      plotStore.isEditing = false;
    }
  },
);
</script>

<style scoped lang="scss">
.textArea {
  min-height: 250px;
}

.form-group {
  margin-bottom: 0.5rem;
}

hr {
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
}
</style>
