<template>
  <section class="w-full bg-[#1A2E16] text-white rounded-xl border border-[#2A362C] shadow-lg flex flex-col font-sans">
    
    <!-- Top toolbar -->
    <div class="p-4 sm:p-6 border-b border-[#2A362C] flex justify-between items-center gap-4">
      <div class="flex gap-3 w-full sm:w-auto flex-wrap items-center">
        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-4 w-4 text-gray-500" />
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            class="w-full bg-[#132210] border border-[#2A362C] text-[#A1B99D] text-sm rounded-lg focus:ring-[#37EC13] focus:border-[#37EC13] block pl-10 p-2.5 placeholder-gray-500 transition-colors" 
            placeholder="Tìm kiếm giao dịch..."
          >
        </div>
      </div>
      <!-- Count -->
      <div class="text-gray-400 text-sm whitespace-nowrap hidden sm:block">
        Đang hiển thị <span class="text-white font-bold">{{ paginationTextStart }}-{{ paginationTextEnd }}</span> trên <span class="text-white font-bold">{{ filteredSales.length }}</span> giao dịch
      </div>
    </div>

    <!-- Table Header -->
    <div class="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_50px] gap-3 px-6 py-4 border-b border-[#2A362C] bg-[#152512] text-xs font-bold text-gray-500 uppercase tracking-wider items-center">
      <div>Tên món / Mã</div>
      <div class="text-right">Số lượng</div>
      <div class="text-right">Doanh thu</div>
      <div class="text-right">Lợi nhuận</div>
      <div class="text-right">Thời gian</div>
      <div></div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredSales.length === 0" class="p-12 text-center text-gray-400">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1B241D] mb-4">
        <ReceiptText class="w-8 h-8 text-gray-500" />
      </div>
      <p>Không tìm thấy giao dịch nào.</p>
    </div>

    <!-- Table Body -->
    <div class="flex flex-col">
      <div v-for="item in paginatedSales" :key="item.id"
           class="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_50px] gap-3 px-4 lg:px-6 py-3.5 border-b border-[#2A362C] hover:bg-[#1A231C]/60 transition-colors items-start lg:items-center group relative lg:static cursor-default">
           
        <!-- Món ăn -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-[#0F1410] border border-[#2A362C] flex justify-center items-center shadow-inner flex-shrink-0">
            <Utensils class="w-4 h-4 text-gray-400" />
          </div>
          <div class="flex flex-col overflow-hidden min-w-0">
            <span class="font-semibold text-sm text-gray-100 truncate">{{ item.dish_name }}</span>
            <span class="text-[10px] text-gray-500 font-mono truncate" :title="item.dish_code">{{ shortenCode(item.dish_code) }}</span>
          </div>
        </div>

        <!-- Số lượng -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-end mt-2 lg:mt-0">
          <span class="text-xs text-gray-500 lg:hidden uppercase font-bold">SL:</span>
          <span class="text-sm font-semibold text-white tabular-nums">{{ formatNumber(item.quantity) }}</span>
        </div>

        <!-- Doanh thu -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-end mt-2 lg:mt-0">
          <span class="text-xs text-gray-500 lg:hidden uppercase font-bold">Doanh thu:</span>
          <span class="text-sm font-semibold text-[#37EC13] tabular-nums">{{ formatCurrency(item.revenue) }}</span>
        </div>

        <!-- Lợi nhuận -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-end mt-2 lg:mt-0">
          <span class="text-xs text-gray-500 lg:hidden uppercase font-bold">Lợi nhuận:</span>
          <span class="text-sm font-semibold text-emerald-400 tabular-nums">{{ formatCurrency(item.profit) }}</span>
        </div>

        <!-- Thời gian -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-end mt-2 lg:mt-0 gap-1 lg:gap-0">
          <span class="text-xs text-gray-500 lg:hidden uppercase font-bold">Thời gian:</span>
          <span class="text-[11px] text-gray-400">{{ formatDateTime(item.created_at) }}</span>
        </div>

        <!-- Actions -->
        <div></div>
      </div>
    </div>

    <!-- Pagination Footer -->
    <div v-if="filteredSales.length > 0" class="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center bg-[#132210] rounded-b-xl mt-auto">
      <div class="text-gray-400 text-sm mb-4 sm:mb-0 whitespace-nowrap">
        Đang hiển thị <span class="text-white font-bold">{{ paginationTextStart }}-{{ paginationTextEnd }}</span> trên <span class="text-white font-bold">{{ filteredSales.length }}</span> giao dịch
      </div>
      <div class="flex items-center gap-1">
        <button 
          @click="prevPage"
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2A362C] text-gray-500 hover:bg-[#1B241D] hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
          :disabled="currentPage === 1">
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button 
          v-for="page in totalPages" 
          :key="page"
          @click="goToPage(page)"
          class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          :class="currentPage === page 
            ? 'bg-[#37EC13] text-[#131A14] font-bold shadow-[0_0_10px_rgba(55,236,19,0.2)]' 
            : 'border border-transparent text-gray-400 hover:bg-[#1B241D] hover:text-gray-200'"
        >
          {{ page }}
        </button>
        <button 
          @click="nextPage"
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2A362C] text-gray-500 hover:bg-[#1B241D] hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="currentPage === totalPages || totalPages === 0">
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, ReceiptText, Utensils, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import type { SaleRecord } from '@/features/sales/store';

const props = defineProps<{
  sales: SaleRecord[]
}>();

// ---------- Search ----------
const searchQuery = ref('');

// ---------- Filtering ----------
const filteredSales = computed(() => {
  let result = props.sales;

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(s =>
      s.dish_name.toLowerCase().includes(query) ||
      s.dish_code.toLowerCase().includes(query)
    );
  }

  return result;
});

// ---------- Pagination ----------
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = computed(() => Math.ceil(filteredSales.value.length / itemsPerPage.value));
const paginatedSales = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredSales.value.slice(start, start + itemsPerPage.value);
});
const paginationTextStart = computed(() => filteredSales.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const paginationTextEnd = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredSales.value.length));
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const goToPage = (page: number) => { currentPage.value = page; };

// ---------- Formatting ----------
function formatDateTime(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN');
}
function formatNumber(n: number) {
  return n.toLocaleString('vi-VN');
}
function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}
function shortenCode(code: string) {
  if (code.length <= 16) return code;
  return code.slice(0, 6) + '…' + code.slice(-6);
}
</script>
