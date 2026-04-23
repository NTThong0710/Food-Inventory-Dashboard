<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { VisXYContainer, VisLine, VisArea, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue';
import { CurveType } from '@unovis/ts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { useInventoryStore } from '@/features/inventory/store';

const inventoryStore = useInventoryStore();

const selectedSku = ref<string>('');

onMounted(async () => {
  if (inventoryStore.aiForecasts.length === 0) {
    await inventoryStore.fetchAiForecasts();
  }
  
  if (uniqueIngredients.value.length > 0 && !selectedSku.value) {
    selectedSku.value = uniqueIngredients.value[0].sku;
  }
});

const uniqueIngredients = computed(() => {
  const map = new Map<string, string>();
  inventoryStore.aiForecasts.forEach(f => {
    map.set(f.ingredient_sku, f.ingredient_name || f.ingredient_sku);
  });
  return Array.from(map.entries()).map(([sku, name]) => ({ sku, name }));
});

watch(uniqueIngredients, (newVal) => {
  if (newVal.length > 0 && !selectedSku.value) {
    selectedSku.value = newVal[0].sku;
  }
});

const chartData = computed(() => {
  const filtered = inventoryStore.aiForecasts
    .filter(f => f.ingredient_sku === selectedSku.value)
    .sort((a, b) => new Date(a.forecast_date).getTime() - new Date(b.forecast_date).getTime());
    
  return filtered.map(f => ({
    label: new Date(f.forecast_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    predicted: Number(f.predicted_quantity),
    lower: Number(f.confidence_lower || f.predicted_quantity),
    upper: Number(f.confidence_upper || f.predicted_quantity),
    unit: inventoryStore.items.find(i => i.sku === f.ingredient_sku)?.unit || ''
  }));
});

const hasData = computed(() => chartData.value.length > 0);

const x = (_d: any, i: number) => i;
const yPredicted = (d: any) => d.predicted;
const yLower = (d: any) => d.lower;
const yUpper = (d: any) => d.upper;
const tickFormatX = (i: number) => chartData.value[i]?.label || '';

const tooltipTemplate = (d: any) => {
  return `<div style="padding:10px;background:rgba(20,30,22,0.9);border:1px solid #2A362C;border-radius:8px;color:#fff;font-size:12px;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
    <div style="display:flex;flex-direction:column;gap:4px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #374151">
        <span style="font-weight:bold;color:#10b981">${d.label}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="width:8px;height:8px;border-radius:50%;background:#37EC13"></span>
        <span style="color:#9ca3af">Dự báo:</span><span style="font-weight:bold">${d.predicted} ${d.unit}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="width:8px;height:8px;border-radius:50%;background:#3B82F6"></span>
        <span style="color:#9ca3af">Biên độ dao động:</span><span style="font-weight:bold">${d.lower} - ${d.upper} ${d.unit}</span>
      </div>
    </div>
  </div>`;
};
</script>

<template>
  <Card class="flex flex-col bg-[#1A241B] border-[#2A362C] shadow-lg rounded-2xl h-full overflow-hidden">
    <!-- Header -->
    <CardHeader class="pb-2 pt-6 px-6">
      <div class="flex items-start justify-between w-full flex-col xl:flex-row gap-4">
        <div>
          <CardTitle class="text-white font-bold text-lg flex items-center gap-2">
            Dự báo nguyên liệu bằng AI
            <span class="px-2 py-0.5 rounded text-[10px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black tracking-widest uppercase shadow-[0_0_10px_rgba(168,85,247,0.4)]">Beta</span>
          </CardTitle>
          <CardDescription class="text-[#6b7280] text-sm mt-1">
            Dự đoán số lượng xuất kho <span class="text-[#37EC13] font-semibold">7 ngày tới</span>
          </CardDescription>
        </div>
        
        <!-- Filters -->
        <div class="flex">
          <select 
            v-if="uniqueIngredients.length > 0"
            v-model="selectedSku"
            class="bg-[#132210] border border-[#2A362C] text-sm text-[#A1B99D] rounded-lg focus:ring-[#37EC13] focus:border-[#37EC13] p-2 max-w-[200px]"
          >
            <option v-for="ing in uniqueIngredients" :key="ing.sku" :value="ing.sku">
              {{ ing.name }}
            </option>
          </select>
          <div v-else class="text-xs text-gray-400 p-2">Không có dữ liệu dự báo</div>
        </div>
      </div>
      <!-- Legend -->
      <div class="flex gap-4 mt-3 xl:mt-0" v-if="hasData">
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-[#37EC13]"></div>
          <span class="text-xs text-gray-300 font-medium">Lượng dự kiến</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-blue-500/30 border border-blue-500"></div>
          <span class="text-xs text-gray-300 font-medium">Khoảng tin cậy</span>
        </div>
      </div>
    </CardHeader>
    
    <!-- Chart Body -->
    <CardContent class="flex-1 px-4 pb-4 mt-4 min-h-55">
      <div v-if="!hasData" class="flex items-center justify-center h-[400px] text-gray-500 text-sm">
        Đang chờ thuật toán AI phân tích dữ liệu kho...
      </div>
      <VisXYContainer
        v-else
        :data="chartData"
        :height="400"
        :padding="{ top: 10, bottom: 20, left: 10, right: 10 }"
      >
        <!-- Area for Confidence Interval -->
        <VisArea
          :x="x"
          :y="[yUpper, yLower]"
          :color="() => '#3B82F6'"
          :opacity="0.15"
          :curve-type="CurveType.MonotoneX"
        />

        <!-- Line for Predicted Quantity (green) -->
        <VisLine
          :x="x"
          :y="[yPredicted]"
          :color="() => '#37EC13'"
          :curve-type="CurveType.MonotoneX"
          :line-width="3"
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
          :tick-text-color="'#9ca3af'"
        />

        <VisAxis
          type="y"
          :grid-line="true"
          :tick-line="false"
          :domain-line="false"
          :font-size="11"
          :tick-text-color="'#6b7280'"
          :num-ticks="5"
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
:deep(.vis-line) {
  filter: drop-shadow(0 4px 6px rgba(55, 236, 19, 0.4));
}
</style>
