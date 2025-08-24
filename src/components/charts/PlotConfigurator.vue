<script setup lang="ts">
import type { IndicatorConfig, PlotConfig } from '@/types';

const props = withDefaults(
  defineProps<{
    columns: string[];
    isVisible?: boolean;
  }>(),
  {
    isVisible: false,
  },
);

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
const usedColumns = computed((): { text: string; value: string }[] => {
  let usedCols: string[] = [];
  if (isMainPlot.value) {
    usedCols = Object.keys(plotStore.editablePlotConfig.main_plot);
  }
  if (selSubPlot.value in plotStore.editablePlotConfig.subplots) {
    usedCols = Object.keys(plotStore.editablePlotConfig.subplots[selSubPlot.value]);
  }
  return usedCols.map((col) => ({
    value: col,
    text: !props.columns.includes(col) ? `${col} <-- 在当前图表不可用` : col,
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
    console.log(`从主图中移除 ${selIndicatorName.value} 指标`);
    delete plotStore.editablePlotConfig.main_plot[selIndicatorName.value];
  } else {
    console.log(`从 ${selSubPlot.value} 移除 ${selIndicatorName.value} 指标`);
    delete plotStore.editablePlotConfig.subplots[selSubPlot.value][selIndicatorName.value];
  }

  plotStore.editablePlotConfig = { ...plotStore.editablePlotConfig };
  selIndicatorName.value = '';
}

function clickAddNewIndicator() {
  addNewIndicator.value = !addNewIndicator.value;
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
  // Reassign to trigger reactivity
  plotStore.editablePlotConfig = { ...plotStore.editablePlotConfig };
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
    showAlert(`没有选择策略，无法加载绘图配置.`);
    return;
  }
  try {
    await botStore.activeBot.getStrategyPlotConfig();
    if (botStore.activeBot.strategyPlotConfig) {
      plotStore.editablePlotConfig = botStore.activeBot.strategyPlotConfig;
    }
  } catch (error) {
    //
    showAlert('未能从策略加载绘图配置.');
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
  {
    immediate: true,
  },
);
const fromPlotTemplateVisible = ref(false);

const showTagsInTooltips = computed({
  get() {
    return plotStore.editablePlotConfig.options?.showTags ?? true;
  },
  set(value: boolean) {
    if (!plotStore.editablePlotConfig.options) {
      plotStore.editablePlotConfig.options = {};
    }
    plotStore.editablePlotConfig.options.showTags = value;
  },
});
</script>

<template>
  <div v-if="columns">
    <label for="idPlotConfigName">绘图配置名称</label>
    <PlotConfigSelect allow-edit></PlotConfigSelect>
    <Divider />
    <BaseCheckbox v-model="showTagsInTooltips" class="mb-1">在工具提示中显示标签</BaseCheckbox>
    <Divider />

    <label for="fieldSel" class="mb">目标图</label>
    <EditValue
      v-model="selSubPlot"
      :allow-edit="!isMainPlot"
      allow-add
      editable-name="plot configuration"
      align-vertical
      @new="addSubplot"
      @delete="deleteSubplot"
      @rename="renameSubplot"
    >
      <ListBox
        id="fieldSel"
        v-model="selSubPlot"
        :options="subplots"
        size="small"
        :pt="{
          list: {
            class: 'h-30',
          },
        }"
      >
      </ListBox>
    </EditValue>
    <Divider />
    <div>
      <label for="selectedIndicators">该图中的指标</label>
      <ListBox
        id="selectedIndicators"
        v-model="selIndicatorName"
        size="small"
        empty-message="没有选中任何指标"
        option-label="text"
        option-value="value"
        :disabled="addNewIndicator"
        :options="usedColumns"
        :pt="{
          list: {
            class: 'h-30',
          },
        }"
      >
      </ListBox>
    </div>
    <div class="flex flex-row mt-1 gap-1">
      <Button
        severity="secondary"
        title="移除绘图指标"
        size="small"
        :disabled="!selIndicatorName"
        class="col"
        @click="removeIndicator"
      >
        Remove indicator
      </Button>
      <Button
        severity="secondary"
        title="从模板加载指标配置"
        size="small"
        @click="fromPlotTemplateVisible = !fromPlotTemplateVisible"
      >
        从模板加载指标
      </Button>
      <Button
        severity="primary"
        title="在绘图中添加指标"
        size="small"
        class="col"
        :disabled="addNewIndicator"
        @click="clickAddNewIndicator"
      >
        添加新的指标
      </Button>
    </div>

    <PlotIndicatorSelect
      v-if="addNewIndicator"
      :columns="columns"
      class="mt-1"
      label="选中指标添加"
      @indicator-selected="addNewIndicatorSelected"
    />

    <PlotFromTemplate v-model:visible="fromPlotTemplateVisible" :columns="columns" />

    <PlotIndicator
      v-if="selIndicatorName && !fromPlotTemplateVisible"
      v-model="selIndicator"
      class="mt-1"
      :columns="columns"
    />
    <Divider />

    <div class="flex flex-row gap-1">
      <Button
        severity="secondary"
        size="small"
        :disabled="addNewIndicator"
        title="重置成最后一次保存的配置"
        @click="loadPlotConfig"
        >Reset</Button
      >

      <!--
        Does Resetting a config to "nothing" make sense, or can this be done via "delete / create"?
        <Button
        class="ms-1 "
        severity="secondary"
        size="small"
        :disabled="addNewIndicator"
        title="Start with empty configuration"
        @click="clearConfig"
        >Reset</Button
      > -->
      <Button
        :disabled="
          (botStore.activeBot.isWebserverMode &&
            !botStore.activeBot.botFeatures.plotConfigFromServer) ||
          !botStore.activeBot.isBotOnline ||
          addNewIndicator
        "
        severity="secondary"
        size="small"
        @click="loadPlotConfigFromStrategy"
      >
        From strategy
      </Button>
      <Button
        id="showButton"
        severity="secondary"
        size="small"
        :disabled="addNewIndicator"
        title="显示配置以便于转移到策略"
        @click="showConfig = !showConfig"
        >{{ showConfig ? '隐藏' : '显示' }}</Button
      >

      <Button
        severity="primary"
        size="small"
        data-toggle="tooltip"
        :disabled="addNewIndicator"
        title="保存配置"
        @click="savePlotConfig"
        >保存</Button>
    </div>
    <Button
      v-if="showConfig"
      class="ms-1 mt-1"
      severity="secondary"
      size="small"
      title="从下面的文本框加载配置"
      @click="loadConfigFromString"
      >Load from String</Button
    >
    <div v-if="showConfig" class="w-full ms-1 mt-2">
      <Textarea
        id="TextArea"
        v-model="plotConfigJson"
        class="w-full min-h-[250px]"
        size="small"
        :state="tempPlotConfigValid"
      >
      </Textarea>
    </div>
  </div>
</template>

<style scoped lang="css">
.form-group {
  margin-bottom: 0.5rem;
}

hr {
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
}
</style>
