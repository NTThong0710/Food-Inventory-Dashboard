<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { VisXYContainer, VisGroupedBar, VisLine, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue';
import { CurveType } from '@unovis/ts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { useSalesStore } from '@/features/sales/store';
import { useCurrencyStore } from '@/shared/stores/currency';

const salesStore = useSalesStore();
const currencyStore = useCurrencyStore();

const timeFilter = ref<'day' | 'month' | 'year'>('day');

onMounted(async () => {
  await salesStore.fetchSales();
});

// Group data based on filter
const chartData = computed(() => {
  const aggregatedRevenue: Record<string, number> = {};
  const aggregatedProfit: Record<string, number> = {};

  salesStore.items.forEach(sale => {
    const d = new Date(sale.created_at);
    let key = '';
    const now = new Date();

    if (timeFilter.value === 'day') {
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 13) {
        key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      }
    } else if (timeFilter.value === 'month') {
      const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (diffMonths <= 5) {
        key = `Thg ${d.getMonth() + 1}`;
      }
    } else {
      const diffYears = now.getFullYear() - d.getFullYear();
      if (diffYears <= 4) {
        key = `${d.getFullYear()}`;
      }
    }

    if (key) {
      aggregatedRevenue[key] = (aggregatedRevenue[key] || 0) + Number(sale.revenue);
      aggregatedProfit[key] = (aggregatedProfit[key] || 0) + Number(sale.profit || 0);
    }
  });

  // Build sorted key list
  let sortedKeys: string[] = [];
  const now = new Date();

  if (timeFilter.value === 'day') {
    for (let i = 13; i >= 0; i--) {
      const past = new Date(now);
      past.setDate(now.getDate() - i);
      sortedKeys.push(`${past.getDate().toString().padStart(2, '0')}/${(past.getMonth() + 1).toString().padStart(2, '0')}`);
    }
  } else if (timeFilter.value === 'month') {
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      sortedKeys.push(`Thg ${m.getMonth() + 1}`);
    }
  } else {
    for (let i = 4; i >= 0; i--) {
      sortedKeys.push(`${now.getFullYear() - i}`);
    }
  }

  return sortedKeys.map(k => ({
    label: k,
    rawRevenue: aggregatedRevenue[k] || 0,
    rawProfit: aggregatedProfit[k] || 0,
    revenue: Number(((aggregatedRevenue[k] || 0) / 1000).toFixed(0)),
    profit: Number(((aggregatedProfit[k] || 0) / 1000).toFixed(0))
  }));
});

const hasData = computed(() => chartData.value.some(d => d.rawRevenue > 0));

const x = (_d: any, i: number) => i;
const yRevenue = (d: any) => d.revenue;
const yProfit = (d: any) => d.profit;
const tickFormatX = (i: number) => chartData.value[i]?.label || '';

const tooltipTemplate = (d: any) => {
  const fmtRevenue = currencyStore.format(d.rawRevenue);
  const fmtProfit = currencyStore.format(d.rawProfit);
  return `<div style="padding:10px;background:rgba(20,30,22,0.9);border:1px solid #2A362C;border-radius:8px;color:#fff;font-size:12px;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
    <div style="display:flex;flex-direction:column;gap:4px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #374151">
        <span style="font-weight:bold;color:#10b981">${d.label}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="width:8px;height:8px;border-radius:50%;background:#37EC13"></span>
        <span style="color:#9ca3af">Doanh thu:</span><span style="font-weight:bold">${fmtRevenue}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="width:8px;height:8px;border-radius:50%;background:#3B82F6"></span>
        <span style="color:#9ca3af">Lợi nhuận:</span><span style="font-weight:bold">${fmtProfit}</span>
      </div>
    </div>
  </div>`;
};
</script>

<template>
  <Card class="flex flex-col bg-[#1A241B] border-[#2A362C] shadow-lg rounded-2xl h-full overflow-hidden">
    <!-- Header -->
    <CardHeader class="pb-2 pt-6 px-6">
      <div class="flex items-start justify-between w-full flex-col sm:flex-row gap-4">
        <div>
          <CardTitle class="text-white font-bold text-lg">Doanh thu xuất kho</CardTitle>
          <CardDescription class="text-[#6b7280] text-sm mt-1">
            Theo <span class="text-[#37EC13] font-semibold">tổng giá trị</span>
          </CardDescription>
        </div>
        
        <!-- Filters -->
        <div class="flex bg-[#132210] border border-[#2A362C] rounded-lg p-1">
          <button 
            @click="timeFilter = 'day'" 
            class="px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200"
            :class="timeFilter === 'day' ? 'bg-[#37EC13] text-black shadow-[0_0_10px_rgba(55,236,19,0.3)]' : 'text-[#9ca3af] hover:text-white'"
          >Ngày</button>
          <button 
            @click="timeFilter = 'month'" 
            class="px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200"
            :class="timeFilter === 'month' ? 'bg-[#37EC13] text-black shadow-[0_0_10px_rgba(55,236,19,0.3)]' : 'text-[#9ca3af] hover:text-white'"
          >Tháng</button>
          <button 
            @click="timeFilter = 'year'" 
            class="px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200"
            :class="timeFilter === 'year' ? 'bg-[#37EC13] text-black shadow-[0_0_10px_rgba(55,236,19,0.3)]' : 'text-[#9ca3af] hover:text-white'"
          >Năm</button>
        </div>
      </div>
      <!-- Legend -->
      <div class="flex gap-4 mt-3 sm:mt-0">
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-[#37EC13]"></div>
          <span class="text-xs text-gray-300 font-medium">Doanh thu</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
          <span class="text-xs text-gray-300 font-medium">Lợi nhuận</span>
        </div>
      </div>
    </CardHeader>
    
    <!-- Chart Body -->
    <CardContent class="flex-1 px-4 pb-4 mt-4 min-h-55">
      <VisXYContainer
        :data="chartData"
        :height="400"
        :padding="{ top: 10, bottom: 20, left: 10, right: 10 }"
      >
        <!-- Bars for Revenue (green) -->
        <VisGroupedBar
          :x="x"
          :y="[yRevenue]"
          :color="() => '#37EC13'"
          :bar-width="20"
          :rounded-corners="3"
        />

        <!-- Line for Profit (blue, overlaid) -->
        <VisLine
          :x="x"
          :y="[yProfit]"
          :color="() => '#3B82F6'"
          :curve-type="CurveType.MonotoneX"
          :line-width="2.5"
          :point-visibility="() => true"
          :point-size-min="5"
        />

        <VisAxis
          type="x"
          :tick-format="tickFormatX"
          :tick-values="Array.from({length: chartData.length}, (_, i) => i)"
          :grid-line="false"
          :tick-line="false"
          :domain-line="false"
          :font-size="10"
          :tick-text-angle="-45"
          :tick-text-color="'#9ca3af'"
        />

        <VisAxis
          type="y"
          :grid-line="true"
          :tick-line="false"
          :domain-line="false"
          :font-size="11"
          :tick-text-color="'#6b7280'"
          :num-ticks="4"
          :tick-format="(val: number) => val"
        />

        <VisCrosshair :template="tooltipTemplate" color="#ffffff55" />
        <VisTooltip />
      </VisXYContainer>
    </CardContent>
  </Card>
</template>

<style scoped>
:deep(.vis-axis-grid) {
  stroke: #2a362c;
  stroke-dasharray: 4 4;
}
:deep(.vis-bar) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.85;
}
:deep(.vis-bar:hover) {
  filter: brightness(1.3);
  opacity: 1;
  transform: translateY(-2px);
}
</style>
