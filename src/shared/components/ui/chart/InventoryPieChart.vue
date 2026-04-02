<script setup lang="ts">
import type {
  ChartConfig,
} from "@/shared/components/ui/chart"

import { Donut } from "@unovis/ts"
import { VisDonut, VisSingleContainer } from "@unovis/vue"
import { TrendingUp } from "lucide-vue-next"
import { computed } from "vue"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  componentToString,
} from "@/shared/components/ui/chart"
import InventoryChartTooltip from "@/shared/components/ui/chart/InventoryChartTooltip.vue"
import { useInventoryStore } from "@/features/inventory/store"

const store = useInventoryStore()

// Green color palette
const greenColors = [
  "#10b981", // emerald-500
  "#34d399", // emerald-400
  "#6ee7b7", // emerald-300
  "#a7f3d0", // emerald-200
  "#d1fae5", // emerald-100
]

const chartData = computed(() => {
  // Nhóm nguyên liệu theo category và tính tổng số lượng
  const grouped: Record<string, number> = {}
  
  store.items.forEach(item => {
    grouped[item.category] = (grouped[item.category] ?? 0) + item.quantity
  })
  
  return Object.entries(grouped).map(([category, quantity], index) => ({
    category,
    quantity,
    fill: greenColors[index % greenColors.length],
  }))
})

type Data = typeof chartData.value[number]

const chartConfig = computed<ChartConfig>(() => {
  const config: ChartConfig = {}
  
  chartData.value.forEach((item, index) => {
    config[item.category] = {
      label: item.category,
      color: greenColors[index % greenColors.length],
    }
  })
  
  return config
})
</script>

<template>
  <Card class="flex flex-col bg-[#1F291E]">
    <CardHeader class="items-center pb-0">
      <CardTitle class="text-[#37EC13] font-bold text-[16px]">Ingredients base on Categories</CardTitle>
      <CardDescription>Quantity of ingredients in inventory</CardDescription>
    </CardHeader>
    <CardContent class="flex-1 pb-0">
      <ChartContainer
        :config="chartConfig"
        class="mx-auto aspect-square max-h-100"
      >
        <VisSingleContainer
          :data="chartData"
          :margin="{ top: 30, bottom: 30 }"
        >
          <VisDonut
            :value="(d: Data) => d.quantity"
            :color="(d: Data) => d.fill"
            :arc-width="0"
          />
          <ChartTooltip
            :triggers="{
              [Donut.selectors.segment]: componentToString(chartConfig, InventoryChartTooltip)!,
            }"
          />
        </VisSingleContainer>
      </ChartContainer>
    </CardContent>
  </Card>
</template>
