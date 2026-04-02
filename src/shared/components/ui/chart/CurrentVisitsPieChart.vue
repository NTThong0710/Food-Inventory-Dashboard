<script setup lang="ts">
import { computed } from 'vue'
import { VisSingleContainer, VisDonut } from '@unovis/vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { useInventoryStore } from '@/features/inventory/store'

const invStore = useInventoryStore()

const chartData = computed(() => {
  const grouped: Record<string, number> = {};
  invStore.items.forEach(item => {
    grouped[item.category] = (grouped[item.category] || 0) + ((item.cost || 0) * (item.quantity || 0));
  });

  const colors = ['#3b82f6', '#38bdf8', '#eab308', '#ef4444', '#10b981', '#8b5cf6'];
  
  const total = Object.values(grouped).reduce((a, b) => a + b, 0) || 1;
  const topCategories = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (topCategories.length === 0) {
    return [{ name: 'Chưa có data', value: 100, fill: '#3b82f6' }];
  }

  return topCategories.map(([name, val], idx) => ({
    name,
    value: Number(((val / total) * 100).toFixed(1)),
    fill: colors[idx]
  }));
})

const valueStr = (d: any) => d.value
const pieColor = (d: any, i: number) => chartData.value[i]?.fill || '#3b82f6'
const arcLabel = (d: any) => `${d.data.value}%`
</script>

<template>
  <Card class="flex flex-col bg-[#1A241B] border-[#2A362C] shadow-lg rounded-2xl h-full overflow-hidden">
    <CardHeader class="pb-2 pt-6 px-6">
      <CardTitle class="text-white font-bold text-lg">Cơ cấu tồn kho</CardTitle>
      <CardDescription class="text-gray-500 text-sm mt-1">
        Theo <span class="text-[#38bdf8] font-semibold">tổng giá trị</span>
      </CardDescription>
    </CardHeader>

    <CardContent class="flex flex-col items-center justify-center flex-1 py-4">
      <div class="relative w-full flex-1 min-h-[220px] flex items-center justify-center">
        <!-- Make inner-radius 0 for a solid pie chart -->
        <VisSingleContainer :data="chartData" :height="220" :width="220" :margin="{ top: 10, bottom: 10, left: 10, right: 10 }">
          <VisDonut
            :value="valueStr"
            :color="pieColor"
            :inner-radius="0"
            :arc-label="arcLabel"
            :show-background="false"
            :corner-radius="0"
          />
        </VisSingleContainer>
      </div>

      <!-- Legend -->
      <div class="flex justify-center gap-6 w-full mt-6 flex-wrap px-2">
        <div v-for="item in chartData" :key="item.name" class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.fill }"></div>
          <span class="text-xs text-gray-300 font-medium truncate max-w-[80px]" :title="item.name">{{ item.name }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
:deep(.vis-donut-arc) {
  stroke: #1a241b;
  stroke-width: 2px;
}
:deep(.vis-donut-arc-label) {
  fill: #ffffff;
  font-weight: bold;
  font-size: 11px;
}
</style>
