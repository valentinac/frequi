<template>
  <div v-if="botStore.activeBot.botState">
    <p>
      当前的版本 <strong>{{ botStore.activeBot.version }}</strong>
    </p>
    <p>
      最多同时运行
      <strong>
        {{ botStore.activeBot.botState.max_open_trades }}x{{
          botStore.activeBot.botState.stake_amount
        }}
        {{ botStore.activeBot.botState.stake_currency }} 订单
      </strong>
      <br/>运行交易所
      <strong>{{ botStore.activeBot.botState.exchange }}</strong> 的
      <strong>{{ botStore.activeBot.botState.trading_mode || 'spot' }}</strong> 市场, 执行
      <strong>{{ botStore.activeBot.botState.strategy }}</strong> 策略.
    </p>
    <p v-if="'stoploss_on_exchange' in botStore.activeBot.botState">
      交易所止损
      <strong>{{
        botStore.activeBot.botState.stoploss_on_exchange ? '可用' : '不可用'
      }}</strong
      >.
    </p>
    <p>
      当前状态 <strong>{{ botStore.activeBot.botState.state }}</strong
      >,
      <strong>是否可开仓/加仓: {{ botStore.activeBot.botState.force_entry_enable }}</strong>
    </p>
    <p>
      <strong>{{ botStore.activeBot.botState.dry_run ? '模拟账户' : '实盘' }}</strong>
    </p>
    <hr />
    <p>
      平均利润率 {{ formatPercent(botStore.activeBot.profit.profit_all_ratio_mean) }} (&sum;
      {{ formatPercent(botStore.activeBot.profit.profit_all_ratio_sum) }}) 在
      {{ botStore.activeBot.profit.trade_count }} 订单中, 平均持仓时长
      {{ botStore.activeBot.profit.avg_duration }}. 最佳币种:
      {{ botStore.activeBot.profit.best_pair }}.
    </p>
    <p v-if="botStore.activeBot.profit.first_trade_timestamp">
      <span v-if="botStore.activeBot.profit.bot_start_timestamp" class="d-block">
        机器人开启时间:
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.bot_start_timestamp" show-timezone />
        </strong>
      </span>
      <span class="d-block">
        第一笔交易开仓于:
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.first_trade_timestamp" show-timezone />
        </strong>
      </span>
      <span class="d-block">
        最后一笔交易开仓于:
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.latest_trade_timestamp" show-timezone />
        </strong>
      </span>
    </p>
    <p>
      <span v-if="botStore.activeBot.profit.profit_factor" class="d-block">
        盈利因子:
        {{ botStore.activeBot.profit.profit_factor.toFixed(2) }}
      </span>
      <span v-if="botStore.activeBot.profit.trading_volume" class="d-block">
        交易量:
        {{
          formatPriceCurrency(
            botStore.activeBot.profit.trading_volume,
            botStore.activeBot.botState.stake_currency,
            botStore.activeBot.botState.stake_currency_decimals ?? 3,
          )
        }}
      </span>
    </p>
    <BotProfit
      class="mx-1"
      :profit="botStore.activeBot.profit"
      :stake-currency="botStore.activeBot.botState.stake_currency ?? 'USDT'"
      :stake-currency-decimals="botStore.activeBot.botState.stake_currency_decimals ?? 3"
    />
  </div>
</template>

<script setup lang="ts">
import { formatPercent, formatPriceCurrency } from '@/shared/formatters';

import { useBotStore } from '@/stores/ftbotwrapper';

const botStore = useBotStore();
</script>
