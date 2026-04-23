<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useBatchesStore } from '@/features/batches/store';
import { useCurrencyStore } from '@/shared/stores/currency';

const batchesStore = useBatchesStore();
const currencyStore = useCurrencyStore();

const timeFilter = ref<'daily' | 'monthly'>('monthly');

onMounted(async () => {
  if (batchesStore.items.length === 0) {
    await batchesStore.fetchBatches();
  }
});

// Group data based on filter
const chartData = computed(() => {
  const aggregatedCost: Record<string, number> = {};

  batchesStore.items.forEach(batch => {
    // Determine the date of the batch
    const d = new Date(batch.received_at || new Date());
    let key = '';
    const now = new Date();

    if (timeFilter.value === 'daily') {
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 6) { // Show last 7 days
        key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      }
    } else if (timeFilter.value === 'monthly') {
      const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (diffMonths <= 5) { // Show last 6 months
        const monthNames: string[] = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        key = monthNames[d.getMonth()] as string;
      }
    }

    if (key) {
      const cost = Number(batch.quantity || 0) * Number(batch.unit_cost || 0);
      aggregatedCost[key] = (aggregatedCost[key] || 0) + cost;
    }
  });

  // Build sorted key list
  let sortedKeys: string[] = [];
  const now = new Date();

  if (timeFilter.value === 'daily') {
    for (let i = 6; i >= 0; i--) {
      const past = new Date(now);
      past.setDate(now.getDate() - i);
      sortedKeys.push(`${past.getDate().toString().padStart(2, '0')}/${(past.getMonth() + 1).toString().padStart(2, '0')}`);
    }
  } else if (timeFilter.value === 'monthly') {
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthNames: string[] = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      sortedKeys.push(monthNames[m.getMonth()] as string);
    }
  }

  const result = sortedKeys.map(k => ({
    label: k,
    cost: aggregatedCost[k] || 0,
  }));

  return result;
});

const maxCost = computed(() => {
  const max = Math.max(...chartData.value.map(d => d.cost));
  return max > 0 ? max : 100;
});

const targetCost = computed(() => maxCost.value * 1.1); // Dynamic bounds for Y-axis

const linePoints = computed(() => {
  if (chartData.value.length === 0) return '';
  const len = chartData.value.length;
  // Make sure X maps nicely from 0 to 100
  return chartData.value.map((d, i) => {
    const x = (i / Math.max(1, len - 1)) * 100;
    const y = 100 - (d.cost / targetCost.value) * 100;
    return `${x},${y}`;
  }).join(' ');
});

const areaPoints = computed(() => {
  if (!linePoints.value) return '';
  return `0,100 ${linePoints.value} 100,100`;
});

const totalPeriodCost = computed(() => {
  const values = chartData.value.map(d => d.cost);
  return values.reduce((a, b) => a + b, 0);
});

const formatCompact = (val: number) => {
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1) + 'M';
  } else if (val >= 1000) {
    return (val / 1000).toFixed(1) + 'K';
  }
  return val.toString();
};

</script>

<template>
  <div class="flex flex-col bg-[#1A2E16] rounded-3xl h-full shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-6 md:p-8 font-sans border border-[#2A362C]">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">Chi phí nhập kho</h2>
        <p class="text-gray-400 text-sm mt-1">Tổng tiền nhập hàng theo khung thời gian</p>
      </div>
      
      <!-- Toggle -->
      <div class="flex bg-[#132210] rounded-full p-1 self-start sm:self-auto border border-[#2A362C]">
        <button 
          @click="timeFilter = 'daily'" 
          class="px-5 py-1.5 text-xs font-bold rounded-full transition-all duration-300"
          :class="timeFilter === 'daily' ? 'bg-[#ea580c] text-white shadow-md' : 'text-gray-400 hover:text-white'"
        >
          Theo ngày
        </button>
        <button 
          @click="timeFilter = 'monthly'" 
          class="px-5 py-1.5 text-xs font-bold rounded-full transition-all duration-300"
          :class="timeFilter === 'monthly' ? 'bg-[#ea580c] text-white shadow-md' : 'text-gray-400 hover:text-white'"
        >
          Theo tháng
        </button>
      </div>
    </div>
    
    <!-- Custom Line Chart -->
    <div class="flex-1 min-h-[250px] relative mt-8 pb-[30px] w-full">
      <div class="absolute bottom-0 w-full border-b border-[#2A362C]/50"></div>
      
      <!-- SVG Data Line -->
      <svg class="absolute top-0 left-0 w-full h-[calc(100%-30px)] z-0 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ea580c" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
          </linearGradient>
        </defs>
        <!-- Area -->
        <polygon :points="areaPoints" fill="url(#orangeGrad)" />
        <!-- Line -->
        <polyline 
          :points="linePoints" 
          fill="none" 
          stroke="#ea580c" 
          stroke-width="3" 
          vector-effect="non-scaling-stroke"
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </svg>
      
      <!-- Interaction HTML Layer (Points, Tooltips, Labels) -->
      <div class="absolute top-0 left-0 w-full h-[calc(100%-30px)] pointer-events-none">
        <div 
          v-for="(item, index) in chartData" 
          :key="index"
          class="absolute top-0 h-full pointer-events-auto group outline-none"
          :style="{ 
            left: `${(index / Math.max(1, chartData.length - 1)) * 100}%`,
            width: '30px', /* Generous hover area */
            transform: 'translateX(-50%)'
          }"
        >
          <!-- Hover Line Guide -->
          <div class="absolute top-0 border-l border-dashed border-gray-500/0 opacity-0 group-hover:opacity-100 group-hover:border-[#ea580c]/50 transition-all z-10 left-1/2 -translate-x-1/2 h-full"></div>
          
          <!-- Circle Point -->
          <div 
            class="absolute w-3 h-3 bg-[#ea580c] border-[2px] border-[#1A2E16] rounded-full left-1/2 transition-transform duration-300 group-hover:scale-[1.8] z-20 shadow-[0_0_10px_rgba(234,88,12,0.6)]"
            :style="{ 
              bottom: `${(item.cost / targetCost) * 100}%`,
              transform: 'translate(-50%, 50%)' 
            }"
          ></div>

          <!-- Output Label -->
          <span class="absolute -bottom-[22px] left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 tracking-wider">
            {{ item.label }}
          </span>

          <!-- Tooltip on hover -->
          <div class="absolute bottom-[100%] mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-lg z-30 whitespace-nowrap pointer-events-none shadow-xl border border-gray-700 flex flex-col gap-1">
            <div class="flex justify-between items-center gap-3">
               <span class="text-gray-400 font-normal">Tiền nhập:</span>
               <span class="text-[#f97316]">{{ currencyStore.formatShort(item.cost) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Stats -->
    <div class="grid grid-cols-2 gap-4 mt-8 pt-6">
      <div class="flex flex-col items-center text-center border-r border-[#2A362C]">
        <span class="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">Tổng chi phí</span>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-black text-white">{{ formatCompact(totalPeriodCost) }}</span>
          <span class="text-xs font-bold text-gray-500">VND</span>
        </div>
      </div>
      <div class="flex flex-col items-center text-center">
        <span class="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">Trạng thái</span>
        <span class="text-sm font-bold text-[#ea580c] mt-2">Đang theo dõi</span>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
/* Scoped styles */
svg {
  filter: drop-shadow(0 4px 6px rgba(234,88,12, 0.2));
}
</style>
