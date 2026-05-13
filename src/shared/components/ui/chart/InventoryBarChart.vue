<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisGroupedBar, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'
import { GroupedBar } from '@unovis/ts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useInventoryStore } from '@/features/inventory/store'
import { TrendingUp } from 'lucide-vue-next'

const store = useInventoryStore()

type DataRecord = { category: string; quantity: number; fill: string }

const greenShades = [
  '#37EC13', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#14B8A6', '#F43F5E',
]

const chartData = computed<DataRecord[]>(() => {
  const grouped: Record<string, number> = {}
  store.items.forEach(item => {
    grouped[item.category] = (grouped[item.category] ?? 0) + item.quantity
  })
  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .map(([category, quantity], i) => ({
      category,
      quantity,
      fill: greenShades[i % greenShades.length] as string,
    }))
})

const totalQuantity = computed(() => 
  chartData.value.reduce((sum, item) => sum + item.quantity, 0)
)

const maxQuantity = computed(() => 
  Math.max(...chartData.value.map(d => d.quantity), 0)
)

const x = (_: DataRecord, i: number) => i
const y = (d: DataRecord) => d.quantity
const color = (d: DataRecord) => d.fill

const tickFormat = (i: number) => chartData.value[i]?.category ?? ''
const tooltipTemplate = (d: DataRecord) =>
  `<div style="padding:10px 14px;background:rgba(20,30,22,0.85);backdrop-filter:blur(10px);border:1px solid rgba(55,236,19,0.3);border-radius:12px;color:#fff;font-size:13px;box-shadow:0 8px 32px rgba(0,0,0,0.6);">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
      <div style="width:8px;height:8px;border-radius:50%;background:${d.fill};box-shadow:0 0 8px ${d.fill}"></div>
      <span style="color:#fff;font-weight:800;font-size:14px;letter-spacing:0.5px;">${d.category}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:2px;padding-left:16px;">
      <span style="font-weight:600;font-family:monospace;font-size:16px;">${d.quantity.toLocaleString('vi-VN')} <span style="font-size:11px;color:#9ca3af;font-weight:normal;">units</span></span>
      <span style="color:#37EC13;font-size:11px;font-weight:bold;">${((d.quantity / (totalQuantity.value || 1)) * 100).toFixed(1)}% <span style="color:#6b7280;font-weight:normal;">of total</span></span>
    </div>
  </div>`
</script>

<template>
  <Card class="flex flex-col bg-linear-to-br from-[#1A241B] to-[#1A2E16] border border-[#2A362C] hover:border-[#37EC13]/30 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(55,236,19,0.1)]">
    <CardHeader class="items-start pb-3 pt-6 px-6">
      <div class="flex items-start justify-between w-full">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <CardTitle class="text-white font-bold text-base">Inventory by Category</CardTitle>
            <TrendingUp class="w-4 h-4 text-[#37EC13]" />
          </div>
          <CardDescription class="text-gray-500 text-xs">Stock quantity distribution across all categories</CardDescription>
        </div>
        <div v-if="totalQuantity > 0" class="text-right">
          <p class="text-lg font-black text-[#37EC13]">{{ totalQuantity.toLocaleString('vi-VN') }}</p>
          <p class="text-xs text-gray-500">Total Units</p>
        </div>
      </div>
    </CardHeader>
    <CardContent class="flex-1 px-4 pb-6">
      <div v-if="chartData.length === 0" class="flex flex-col items-center justify-center h-48 text-gray-500 gap-2">
        <div class="w-12 h-12 rounded-full bg-[#1B241D] flex items-center justify-center opacity-50">
          📊
        </div>
        <p class="text-sm">No inventory data available</p>
      </div>
      <div v-else class="space-y-4">
        <!-- Stats Row -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-[#0F1A10] rounded-lg p-3 border border-[#2A362C]">
            <p class="text-xs text-gray-500 uppercase font-bold">Categories</p>
            <p class="text-lg font-black text-[#37EC13] mt-1">{{ chartData.length }}</p>
          </div>
          <div class="bg-[#0F1A10] rounded-lg p-3 border border-[#2A362C]">
            <p class="text-xs text-gray-500 uppercase font-bold">Max Stock</p>
            <p class="text-lg font-black text-amber-50 mt-1">{{ maxQuantity.toLocaleString('vi-VN') }}</p>
          </div>
          <div class="bg-[#0F1A10] rounded-lg p-3 border border-[#2A362C]">
            <p class="text-xs text-gray-500 uppercase font-bold">Avg per Cat</p>
            <p class="text-lg font-black text-amber-50 mt-1">{{ (totalQuantity / chartData.length).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) }}</p>
          </div>
        </div>

        <!-- Chart -->
        <VisXYContainer
          :data="chartData"
          :height="240"
          :padding="{ top: 10, bottom: 0 }"
        >
          <VisGroupedBar
            :x="x"
            :y="[y]"
            :color="color"
            :bar-padding="0.25"
            :group-padding="0.1"
            :rounded-corners="8"
          />
          <VisAxis
            type="x"
            :tick-format="tickFormat"
            :grid-line="false"
            :tick-line="false"
            :domain-line="false"
            :font-size="11"
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
          />
          <VisCrosshair :template="tooltipTemplate" />
          <VisTooltip />
        </VisXYContainer>

        <!-- Legend -->
        <div class="flex flex-wrap gap-2">
          <div v-for="(item, idx) in chartData" :key="item.category" class="flex items-center gap-2 text-xs">
            <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: item.fill }"></div>
            <span class="text-gray-400">{{ item.category }}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.vis-bar) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 6px rgba(55, 236, 19, 0.2));
}

:deep(.vis-bar:hover) {
  filter: brightness(1.2) drop-shadow(0 0 12px rgba(55, 236, 19, 0.6));
  transform: translateY(-2px);
}
</style>