<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisGroupedBar, VisLine, VisArea, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CurveType } from '@unovis/ts'
import { useInventoryStore } from '@/stores/inventory'
import { useDishesStore } from '@/stores/dishes'

const invStore = useInventoryStore()
const dishStore = useDishesStore()

const chartData = computed(() => {
  const categoryNames = Array.from(new Set([
    ...invStore.items.map(i => i.category),
    ...dishStore.items.map(d => d.category)
  ])).filter(c => c && c !== 'Unknown');

  if (categoryNames.length === 0) {
    return [{ category: 'Chưa có data', teamA: 0, teamB: 0, teamC: 0 }];
  }

  return categoryNames.map(catName => {
    const invItems = invStore.items.filter(i => i.category === catName);
    const dishItems = dishStore.items.filter(d => d.category === catName);
    
    const skuCount = invItems.length;
    const dishCount = dishItems.length;
    let totalValue = invItems.reduce((sum, item) => sum + ((item.cost || 0) * (item.quantity || 0)), 0);
    const valueMillions = totalValue / 1000000;

    return {
      category: catName,
      targetA: skuCount, // Bar
      targetB: dishCount, // Line
      targetC: Number(valueMillions.toFixed(1)) // Area
    };
  });
})

const x = (_d: any, i: number) => i
const yA = (d: any) => d.targetA
const yB = (d: any) => d.targetB
const yC = (d: any) => d.targetC
const tickFormatX = (i: number) => chartData.value[i]?.category || ''

const tooltipTemplate = (d: any) =>
  `<div style="padding:10px;background:rgba(20,30,22,0.9);border:1px solid #2A362C;border-radius:8px;color:#fff;font-size:12px;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
    <div style="display:flex;flex-direction:column;gap:4px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #374151">
        <span style="font-weight:bold;color:#10b981">${d.category}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="width:8px;height:8px;border-radius:50%;background:#3B82F6"></span>
        <span style="color:#9ca3af">SL Nguyên liệu:</span><span style="font-weight:bold">${d.targetA}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="width:8px;height:8px;border-radius:50%;background:#EAB308"></span>
        <span style="color:#9ca3af">SL Món ăn:</span><span style="font-weight:bold">${d.targetB}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="width:8px;height:8px;border-radius:50%;background:#38BDF8"></span>
        <span style="color:#9ca3af">GT Tồn kho:</span><span style="font-weight:bold">${d.targetC} Tr ₫</span>
      </div>
    </div>
  </div>`
</script>

<template>
  <Card class="flex flex-col bg-[#1A241B] border-[#2A362C] shadow-lg rounded-2xl h-full overflow-hidden">
    <!-- Header -->
    <CardHeader class="pb-2 pt-6 px-6">
      <div class="flex items-start justify-between w-full">
        <div>
          <CardTitle class="text-white font-bold text-lg">Phân bổ danh mục</CardTitle>
          <CardDescription class="text-gray-500 text-sm mt-1">
            <span class="text-[#37EC13] font-semibold">Thực tế</span> từ dữ liệu dự án
          </CardDescription>
        </div>
        <!-- Legend -->
        <div class="flex gap-4">
          <div class="flex items-center gap-1.5 align-middle">
            <div class="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
            <span class="text-xs text-gray-300 font-medium">Nguyên liệu</span>
          </div>
          <div class="flex items-center gap-1.5 align-middle">
            <div class="w-2.5 h-2.5 rounded-full bg-[#EAB308]"></div>
            <span class="text-xs text-gray-300 font-medium">Món ăn</span>
          </div>
          <div class="flex items-center gap-1.5 align-middle">
            <div class="w-2.5 h-2.5 rounded-full bg-[#38BDF8]"></div>
            <span class="text-xs text-gray-300 font-medium">Tồn kho (Tr ₫)</span>
          </div>
        </div>
      </div>
    </CardHeader>
    
    <!-- Chart Body -->
    <CardContent class="flex-1 px-4 pb-4 mt-4">
      <VisXYContainer
        :data="chartData"
        :height="280"
        :padding="{ top: 10, bottom: 20, left: 10, right: 10 }"
      >
        <!-- Area for Team C -->
        <VisArea
          :x="x"
          :y="[yC]"
          :color="() => '#38bdf8'"
          :opacity="0.15"
          :curve-type="CurveType.Natural"
        />

        <!-- Line for Team C (Light Blue) -->
        <VisLine
          :x="x"
          :y="[yC]"
          :color="() => '#38bdf8'"
          :curve-type="CurveType.Natural"
          :line-width="2.5"
        />

        <!-- Line for Team B (Yellow) -->
        <VisLine
          :x="x"
          :y="[yB]"
          :color="() => '#eab308'"
          :curve-type="CurveType.Natural"
          :line-width="2.5"
        />

        <!-- Bars for Team A (Dark Blue) -->
        <VisGroupedBar
          :x="x"
          :y="[yA]"
          :color="() => '#3b82f6'"
          :bar-width="8"
          :rounded-corners="4"
        />

        <VisAxis
          type="x"
          :tick-format="tickFormatX"
          :grid-line="false"
          :tick-line="false"
          :domain-line="false"
          :font-size="11"
          :tick-text-color="'#9ca3af'"
        />

        <!-- Y Axis with dashed grid lines -->
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
}
:deep(.vis-bar:hover) {
  filter: brightness(1.2);
  transform: translateY(-2px);
}
</style>
