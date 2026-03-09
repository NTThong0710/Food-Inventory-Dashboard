<template>
  <div class="flex flex-col gap-6 w-full">
    <div>
      <h2 class="text-2xl font-bold text-amber-50">Dashboard Overview</h2>
      <p class="text-gray-400 text-sm mt-1">Summary of inventory</p>
    </div>

    <!-- Summary Cards Section -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1: Total Items -->
      <div class="bg-[#1F291E] p-6 rounded-xl border border-gray-700 flex flex-col shadow-md">
        <div class="flex justify-between">
            <span class="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Items</span>
            <AlignEndVertical/>
        </div>
        <span class="text-4xl font-bold text-amber-50 mt-3">{{ store.totalItems }}</span>
      </div>
      
      <!-- Card 2: Total Categories -->
      <div class="bg-[#1F291E] p-6 rounded-xl border border-gray-700 flex flex-col shadow-md">
        <div class="flex justify-between">
            <span class="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Categories</span>
            <ChartBarStacked/>
        </div>
        <span class="text-4xl font-bold text-amber-50 mt-3">{{ store.totalCategories }}</span>
      </div>

      <!-- Card 3: Total Value -->
      <div class="bg-[#1F291E] p-6 rounded-xl border border-[#37EC13]/40 flex flex-col relative overflow-hidden shadow-md">
        <span class="text-[#37EC13] text-sm font-medium uppercase tracking-wider relative z-10">Total Inventory Value</span>
        <span class="text-4xl font-bold text-amber-50 mt-3 relative z-10">{{ store.grandTotalValue.toLocaleString() }} <span class="text-lg text-gray-400">VND</span></span>
        <!-- Decorative background glow -->
        <div class="absolute -right-4 -bottom-4 w-32 h-32 bg-[#37EC13] opacity-5 rounded-full blur-2xl"></div>
      </div>
    </section>
    <div class="grid grid-cols-2 gap-6">
      <InventoryPieChart/>
      <InventoryPieChart/>
    </div>
    

  </div>
</template>

<script setup lang="ts">

import InventoryPieChart from '@/components/ui/chart/InventoryPieChart.vue';
import { useInventoryStore } from '@/stores/inventory';
import { AlignEndVertical, ChartBarStacked } from 'lucide-vue-next';

const store = useInventoryStore();

</script>
