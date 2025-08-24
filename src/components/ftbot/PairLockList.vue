<script setup lang="ts">
import type { Lock } from '@/types';

const botStore = useBotStore();

function removePairLock(item: Lock) {
  console.log(item);
  if (item.id !== undefined) {
    botStore.activeBot.deleteLock(item.id);
  } else {
    showAlert('当前版本不支持删除锁.');
  }
}
</script>

<template>
  <div>
    <div class="mb-2">
      <label class="me-auto text-xl">锁定的币种</label>
      <Button class="float-end" severity="secondary" @click="botStore.activeBot.getLocks">
        <template #icon>
          <i-mdi-refresh />
        </template>
      </Button>
    </div>
    <div>
      <DataTable size="small" :items="botStore.activeBot.activeLocks">
        <Column field="pair" header="Pair"></Column>
        <Column field="lock_end_timestamp" header="Until">
          <template #body="{ data, field }">
            {{ timestampms(data[field]) }}
          </template>
        </Column>
        <Column field="reason" header="Reason"></Column>
        <Column field="actions" header="Actions">
          <template #body="{ data }">
            <Button
              class="btn-xs ms-1"
              size="small"
              severity="secondary"
              title="Delete Lock"
              @click="removePairLock(data as Lock)"
            >
              <i-mdi-delete />
            </Button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
