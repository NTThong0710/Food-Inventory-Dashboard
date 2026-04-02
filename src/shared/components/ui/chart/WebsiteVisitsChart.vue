<script setup lang="ts">
import { computed } from 'vue'
import { VisSingleContainer, VisDonut, VisTooltip } from '@unovis/vue'
import { Donut } from '@unovis/ts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { useInventoryStore } from '@/features/inventory/store'
import { useDishesStore } from '@/features/dishes/store'
import { useCurrencyStore } from '@/shared/stores/currency'



const invStore = useInventoryStore()
const dishStore = useDishesStore()
const currencyStore = useCurrencyStore()


const chartData = computed(() => {
  const categoryNames = Array.from(new Set([
    ...invStore.items.map(i => i.category),
    
  ])).filter(c => c && c !== 'Unknown');

  if (categoryNames.length === 0) {
    return [{ category: 'Chưa có data', count: 1, ingredients: 0, dishes: 0, totalValue: 0 }];
  }

  return categoryNames.map(catName => {
    const invItems = invStore.items.filter(i => i.category === catName);
   const skuSet = new Set(invItems.map(i => i.sku));
    const dishes = dishStore.items.filter(dish =>
      dish.ingredients?.some(ing =>
        skuSet.has(ing.ingredient_sku)
      )
    );
    const totalValue = invItems.reduce((sum, item) => sum + ((item.cost || 0) * (item.quantity || 0)), 0);

    return {
      category: catName,
      count: invItems.length,
      ingredients: invItems.length,
      dishes: dishes.length,
      totalValue
    };
  }).sort((a, b) => b.count - a.count);
  
})

const valueAccessor = (d: any) => d.count
const colorAccessor = (d: any) => {
  const hue = Math.abs(
    d.category.split('').reduce((a:any,b:any)=>a+b.charCodeAt(0),0)
  ) % 360

  return `hsl(${hue}, 65%, 55%)`
}

const tooltipTemplate = (d: any) =>
  `<div style="padding:10px;background:rgba(20,30,22,0.9);border:1px solid #2A362C;border-radius:8px;color:#fff;font-size:12px;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
    <div style="display:flex;flex-direction:column;gap:4px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #374151">
        <span style="font-weight:bold;color:#10b981">${d.data.category}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="color:#9ca3af">Tổng số lượng:</span><span style="font-weight:bold">${d.data.count}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="color:#9ca3af">SL Nguyên liệu:</span><span style="font-weight:bold">${d.data.ingredients}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="color:#9ca3af">SL Món ăn:</span><span style="font-weight:bold">${d.data.dishes}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:4px;padding-top:4px;border-top:1px solid #374151">
        <span style="color:#9ca3af">Giá trị tồn:</span><span style="font-weight:bold">${currencyStore.formatShort(d.data.totalValue)}</span>
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
      </div>
    </CardHeader>
    
    <!-- Chart Body -->
    <CardContent class="flex-1 px-4 pb-8 mt-4 flex items-center justify-center min-h-55">
      <VisSingleContainer
        :data="chartData"
        :height="400"
      >
        <VisDonut
          :value="valueAccessor"
          :color="colorAccessor"
          :arc-width="150"
          :show-background="false"
        />
        <VisTooltip :triggers="{ [Donut.selectors.segment]: tooltipTemplate }" />
      </VisSingleContainer>
    </CardContent>
  </Card>
</template>

<style scoped>
:deep(.vis-donut-segment) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  stroke: #1A241B;
  stroke-width: 2px;
}
:deep(.vis-donut-segment:hover) {
  filter: brightness(1.2);
  transform: scale(1.02);
}
</style>
