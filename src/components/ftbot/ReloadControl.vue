<template>
  <div class="d-flex align-items-center ms-2">
    <b-form-checkbox
      v-model="autoRefreshLoc"
      class="float-end my-auto mt-1"
      title="自动刷新"
    ></b-form-checkbox>
    <b-button
      class="m-1"
      variant="secondary"
      size="sm"
      title="自动刷新所有机器人"
      @click="botStore.allRefreshFull"
    >
      <i-mdi-refresh />
    </b-button>
  </div>
</template>

<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';

const botStore = useBotStore();
const autoRefreshLoc = computed({
  get() {
    return botStore.globalAutoRefresh;
  },
  set(newValue: boolean) {
    botStore.setGlobalAutoRefresh(newValue);
  },
});
</script>

<style scoped></style>
