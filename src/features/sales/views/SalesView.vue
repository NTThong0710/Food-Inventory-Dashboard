<template>
  <div class="flex flex-col gap-6 w-full relative">
    
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-white tracking-tight">Xuất kho</h2>
        <p class="text-gray-400 text-sm mt-1">Lịch sử xuất bán các món ăn, doanh thu và lợi nhuận.</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-[#1A2E16] border border-[#2A362C] rounded-xl p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-lg bg-[#1B5E20]/40 flex items-center justify-center">
          <ReceiptText class="w-5 h-5 text-[#37EC13]" />
        </div>
        <div>
          <p class="text-2xl font-bold text-white">{{ store.items.length }}</p>
          <p class="text-xs text-gray-400">Tổng giao dịch</p>
        </div>
      </div>
      <div class="bg-[#1A2E16] border border-[#2A362C] rounded-xl p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-lg bg-emerald-900/40 flex items-center justify-center">
          <DollarSign class="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p class="text-2xl font-bold text-white">{{ formatCurrency(totalRevenue) }}</p>
          <p class="text-xs text-gray-400">Tổng doanh thu</p>
        </div>
      </div>
      <div class="bg-[#1A2E16] border border-[#2A362C] rounded-xl p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-lg bg-emerald-900/40 flex items-center justify-center">
          <TrendingUp class="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p class="text-2xl font-bold text-white">{{ formatCurrency(totalProfit) }}</p>
          <p class="text-xs text-gray-400">Tổng lợi nhuận</p>
        </div>
      </div>
    </div>

    <section class="w-full">
      <div class="transition-all w-full">
        <SalesList :sales="store.items" />
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useSalesStore } from '@/features/sales/store';
import SalesList from '@/features/sales/components/SalesList.vue';
import { ReceiptText, DollarSign, TrendingUp } from 'lucide-vue-next';

const store = useSalesStore();

onMounted(() => {
  store.fetchSales();
});

const totalRevenue = computed(() => {
  return store.items.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
});

const totalProfit = computed(() => {
  return store.items.reduce((sum, item) => sum + Number(item.profit || 0), 0);
});

function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}
</script>
