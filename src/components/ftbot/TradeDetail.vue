<template>
  <div class="container text-start">
    <div class="row">
      <div class="col-lg-5">
        <h5 class="detail-header">概要</h5>
        <ValuePair description="订单编号">{{ trade.trade_id }}</ValuePair>
        <ValuePair description="币种">{{ trade.pair }}</ValuePair>

        <ValuePair description="开仓时间">{{ timestampms(trade.open_timestamp) }}</ValuePair>
        <ValuePair v-if="trade.enter_tag" description="开仓标签">{{ trade.enter_tag }}</ValuePair>
        <ValuePair description="总金额"
          >{{ formatPriceCurrency(trade.stake_amount, stakeCurrency) }}
          {{ trade.leverage && trade.leverage !== 1 ? `(${trade.leverage}x)` : '' }}</ValuePair
        >
        <ValuePair description="数量">{{ trade.amount }}</ValuePair>
        <ValuePair description="开仓均价">{{ formatPrice(trade.open_rate) }}</ValuePair>
        <ValuePair v-if="trade.is_open && trade.current_rate" description="当前价格">{{
          formatPrice(trade.current_rate)
        }}</ValuePair>
        <ValuePair v-if="!trade.is_open && trade.close_rate" description="平仓价格">{{
          formatPrice(trade.close_rate)
        }}</ValuePair>

        <ValuePair v-if="trade.close_timestamp" description="平仓时间">{{
          timestampms(trade.close_timestamp)
        }}</ValuePair>
        <ValuePair
          v-if="trade.is_open && trade.realized_profit && !trade.total_profit_abs"
          description="未结算盈亏"
        >
          <trade-profit class="ms-2" :trade="trade" mode="realized" />
        </ValuePair>
        <ValuePair v-if="trade.is_open && trade.total_profit_abs" description="总盈亏">
          <trade-profit class="ms-2" :trade="trade" mode="total" />
        </ValuePair>
        <ValuePair
          v-if="trade.profit_ratio && trade.profit_abs"
          :description="`${trade.is_open ? '当前盈亏' : '已结算盈亏'}`"
        >
          <trade-profit class="ms-2" :trade="trade" />
        </ValuePair>
        <details>
          <summary>订单细节</summary>
          <ValuePair v-if="trade.min_rate" description="最低价">{{
            formatPrice(trade.min_rate)
          }}</ValuePair>
          <ValuePair v-if="trade.max_rate" description="最高价">{{
            formatPrice(trade.max_rate)
          }}</ValuePair>
          <ValuePair description="开仓手续费">
            {{ trade.fee_open_cost }} {{ trade.quote_currency }}
            <span v-if="trade.quote_currency !== trade.fee_open_currency">
              (in {{ trade.fee_open_currency }})
            </span>
            ({{ formatPercent(trade.fee_open) }})
          </ValuePair>
          <ValuePair v-if="trade.fee_close_cost && trade.fee_close" description="平仓手续费">
            {{ trade.fee_close_cost }} {{ trade.fee_close_currency }} ({{
              formatPercent(trade.fee_close)
            }})
          </ValuePair>
        </details>
      </div>
      <div class="mt-2 mt-lg-0 col-lg-7">
        <h5 class="detail-header">止损</h5>
        <ValuePair description="止损">
          {{ formatPercent(trade.stop_loss_pct / 100) }} |
          {{ formatPrice(trade.stop_loss_abs) }}
        </ValuePair>
        <ValuePair
          v-if="trade.initial_stop_loss_pct && trade.initial_stop_loss_abs"
          description="初始化止损"
        >
          {{ formatPercent(trade.initial_stop_loss_pct / 100) }} |
          {{ formatPrice(trade.initial_stop_loss_abs) }}
        </ValuePair>
        <ValuePair
          v-if="trade.is_open && trade.stoploss_current_dist_ratio && trade.stoploss_current_dist"
          description="当前止损距离"
        >
          {{ formatPercent(trade.stoploss_current_dist_ratio) }} |
          {{ formatPrice(trade.stoploss_current_dist) }}
        </ValuePair>
        <ValuePair v-if="trade.stoploss_last_update_timestamp" description="最后止损时间">
          {{ timestampms(trade.stoploss_last_update_timestamp) }}
        </ValuePair>
        <div v-if="trade.trading_mode !== undefined && trade.trading_mode !== 'spot'">
          <h5 class="detail-header">合约/现货</h5>
          <ValuePair description="方向">
            {{ trade.is_short ? '空单' : '多单' }} - {{ trade.leverage }}x
          </ValuePair>
          <ValuePair v-if="trade.funding_fees !== undefined" description="资金费率">
            {{ formatPrice(trade.funding_fees) }}
          </ValuePair>
          <ValuePair v-if="trade.interest_rate !== undefined" description="利率">
            {{ formatPrice(trade.interest_rate) }}
          </ValuePair>
          <ValuePair v-if="trade.liquidation_price !== undefined" description="结算价格">
            {{ formatPrice(trade.liquidation_price) }}
          </ValuePair>
        </div>
        <details v-if="trade.orders">
          <summary>子订单 {{ trade.orders.length > 1 ? `[${trade.orders.length}]` : '' }}</summary>
          <div v-for="(order, key) in trade.orders" :key="key">
            <span
              :title="`${order.ft_order_side} ${order.order_type} order for ${formatPriceCurrency(
                order.amount,
                trade.base_currency ?? '',
              )} at ${formatPriceCurrency(
                order.safe_price,
                trade.quote_currency ?? '',
              )}, filled ${formatPrice(order.filled)}`"
            >
              (#{{ key + 1 }})
              <i-mdi-triangle
                v-if="order.ft_order_side === 'buy'"
                class="me-1 color-up"
                style="font-size: 0.6rem"
              />
              <i-mdi-triangle-down v-else class="me-1 color-down" style="font-size: 0.6rem" />
              <DateTimeTZ
                v-if="order.order_timestamp"
                :date="order.order_timestamp"
                show-timezone
              />
              <b class="ms-1" :class="order.ft_order_side === 'buy' ? 'color-up' : 'color-down'">{{
                order.ft_order_side
              }}</b>
              for <b>{{ formatPrice(order.safe_price) }}</b> |
              <span v-if="order.remaining && order.remaining !== 0" title="remaining"
                >{{ formatPrice(order.remaining, 8) }} /
              </span>
              <span title="Filled">{{ formatPrice(order.filled ?? 0, 8) }}</span>
              <template v-if="order.ft_order_tag"> | {{ order.ft_order_tag ?? '' }}</template>
            </span>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPercent, formatPriceCurrency, formatPrice, timestampms } from '@/shared/formatters';
import { Trade } from '@/types';

const colorStore = useColorStore();

defineProps({
  trade: { required: true, type: Object as () => Trade },
  stakeCurrency: { required: true, type: String },
});
</script>
<style scoped>
.detail-header {
  border-bottom: 1px solid;
  padding-bottom: 5px;
  width: 100%;
  display: block;
}
.color-up {
  color: v-bind('colorStore.colorUp');
}

.color-down {
  color: v-bind('colorStore.colorDown');
}
</style>
