<template>
  <section class="w-full bg-[#1A2E16] text-white rounded-xl border border-[#2A362C] shadow-lg flex flex-col font-sans">
    
    <!-- Top toolbar -->
    <div class="p-4 sm:p-6 border-b border-[#2A362C] flex flex-col sm:flex-row justify-between items-center gap-4">
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
            placeholder="Tìm kiếm lô hàng..."
          >
        </div>

        <!-- Filter by Supplier -->
        <div class="relative">
          <button @click="toggleFilter" @blur="closeFilterDelay" class="flex items-center gap-2 px-4 py-2.5 bg-[#132210] border border-[#2A362C] rounded-lg text-sm font-medium hover:bg-[#232F26] transition-colors whitespace-nowrap">
            <Filter class="w-4 h-4" />
            <span class="hidden sm:inline">{{ selectedSupplier === 'All' ? 'NCC' : selectedSupplier }}</span>
          </button>
          <transition name="fade">
            <div v-if="showFilterMenu" class="absolute left-0 top-full mt-2 w-52 bg-[#1B241D] border border-[#2A362C] rounded-lg shadow-xl z-30 py-1 max-h-60 overflow-y-auto">
              <button 
                @click="selectSupplier('All')"
                class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A362C] hover:text-white transition-colors flex items-center justify-between"
              >
                Tất cả NCC
                <Check v-if="selectedSupplier === 'All'" class="w-4 h-4 text-[#37EC13]" />
              </button>
              <button 
                v-for="sup in uniqueSuppliers" 
                :key="sup"
                @click="selectSupplier(sup)"
                class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A362C] hover:text-white transition-colors flex items-center justify-between"
              >
                {{ sup }}
                <Check v-if="selectedSupplier === sup" class="w-4 h-4 text-[#37EC13]" />
              </button>
            </div>
          </transition>
        </div>

        <!-- Filter by Status -->
        <div class="relative">
          <button @click="toggleStatusFilter" @blur="closeStatusFilterDelay" class="flex items-center gap-2 px-4 py-2.5 bg-[#132210] border border-[#2A362C] rounded-lg text-sm font-medium hover:bg-[#232F26] transition-colors whitespace-nowrap">
            <Clock class="w-4 h-4" />
            <span class="hidden sm:inline">{{ selectedExpiry === 'All' ? 'HSD' : selectedExpiry }}</span>
          </button>
          <transition name="fade">
            <div v-if="showStatusFilterMenu" class="absolute left-0 top-full mt-2 w-48 bg-[#1B241D] border border-[#2A362C] rounded-lg shadow-xl z-30 py-1">
              <button 
                v-for="status in expiryStatuses" 
                :key="status"
                @click="selectExpiry(status)"
                class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A362C] hover:text-white transition-colors flex items-center justify-between"
              >
                {{ status }}
                <Check v-if="selectedExpiry === status" class="w-4 h-4 text-[#37EC13]" />
              </button>
            </div>
          </transition>
        </div>

        <!-- Sort Button -->
        <button @click="toggleSort" class="flex items-center gap-2 px-4 py-2.5 bg-[#132210] border border-[#2A362C] rounded-lg text-sm font-medium hover:bg-[#232F26] transition-colors whitespace-nowrap">
          <ArrowUpDown class="w-4 h-4" />
          <span class="hidden sm:inline">{{ sortLabel }}</span>
        </button>

        <!-- Bulk Delete Button -->
        <button v-if="selectedItems.length > 0 && authStore.hasPermission('batch_write')" @click="$emit('delete-multiple', selectedItems)" class="flex items-center gap-2 px-4 py-2.5 bg-red-900/40 text-red-400 border border-red-900/50 rounded-lg text-sm font-medium hover:bg-red-900/60 transition-colors whitespace-nowrap">
          <Trash2 class="w-4 h-4" />
          <span class="hidden sm:inline">Xóa {{ selectedItems.length }} mục</span>
        </button>
      </div>
      <!-- Count Right -->
      <div class="text-gray-400 text-sm whitespace-nowrap hidden sm:block">
        Đang hiển thị <span class="text-white font-bold">{{ paginationTextStart }}-{{ paginationTextEnd }}</span> trên <span class="text-white font-bold">{{ filteredBatches.length }}</span> lô hàng
      </div>
    </div>

    <!-- Table Header -->
    <div class="hidden lg:grid grid-cols-[40px_2fr_1.2fr_0.6fr_0.8fr_1fr_1fr_1fr_50px] gap-3 px-6 py-4 border-b border-[#2A362C] bg-[#152512] text-xs font-bold text-gray-500 uppercase tracking-wider items-center">
      <div class="flex justify-center">
        <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="w-4 h-4 rounded border-gray-600 outline-none text-[#37EC13] focus:ring-1 focus:ring-[#37EC13] bg-[#121811] cursor-pointer accent-[#37EC13]">
      </div>
      <div>Nguyên liệu / Mã lô</div>
      <div>Nhà cung cấp</div>
      <div class="text-right">SL</div>
      <div class="text-right">Đơn giá</div>
      <div class="text-right">Tổng</div>
      <div>Ngày SX</div>
      <div>Hạn SD</div>
      <div></div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredBatches.length === 0" class="p-12 text-center text-gray-400">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1B241D] mb-4">
        <Package class="w-8 h-8 text-gray-500" />
      </div>
      <p>Không tìm thấy lô hàng nào.</p>
    </div>

    <!-- Table Body -->
    <div class="flex flex-col">
      <div v-for="item in paginatedBatches" :key="item.batch_code"
           class="grid grid-cols-[40px_1fr] lg:grid-cols-[40px_2fr_1.2fr_0.6fr_0.8fr_1fr_1fr_1fr_50px] gap-3 px-4 lg:px-6 py-3.5 border-b border-[#2A362C] hover:bg-[#1A231C]/60 transition-colors items-start lg:items-center group relative lg:static cursor-default">
           
        <div class="flex justify-center items-center lg:mt-0 lg:h-full mt-[18px]">
          <input type="checkbox" v-model="selectedItems" :value="item.batch_code" class="w-4 h-4 rounded border-gray-600 outline-none text-[#37EC13] focus:ring-1 focus:ring-[#37EC13] bg-[#1B241D] cursor-pointer accent-[#37EC13]">
        </div>

        <!-- Start of row content wrapper for mobile -->
        <div class="grid grid-cols-1 lg:contents gap-3 col-span-1">
          <!-- Ingredient + Batch Code (merged) -->
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-[#0F1410] border border-[#2A362C] flex justify-center items-center shadow-inner flex-shrink-0">
              <Package class="w-4 h-4 text-gray-400" />
            </div>
            <div class="flex flex-col overflow-hidden min-w-0">
              <span class="font-semibold text-sm text-gray-100 truncate">{{ item.ingredient_name }}</span>
              <span class="text-[10px] text-gray-500 font-mono truncate" :title="item.batch_code">{{ shortenCode(item.batch_code) }} · {{ formatDate(item.received_at) }}</span>
            </div>
          </div>

          <!-- Supplier -->
          <div class="flex flex-col lg:flex-row lg:items-center mt-2 lg:mt-0 gap-1 lg:gap-0">
            <span class="text-xs text-gray-500 lg:hidden uppercase font-bold">NCC:</span>
            <span class="text-sm text-gray-300 truncate">{{ item.supplier_name }}</span>
          </div>

          <!-- Quantity -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-end mt-2 lg:mt-0">
            <span class="text-xs text-gray-500 lg:hidden uppercase font-bold">SL:</span>
            <span class="text-sm font-semibold text-white tabular-nums">{{ formatNumber(item.quantity) }}</span>
          </div>

          <!-- Unit Cost -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-end mt-2 lg:mt-0">
            <span class="text-xs text-gray-500 lg:hidden uppercase font-bold">Đơn giá:</span>
            <span class="text-sm text-gray-300 tabular-nums">{{ formatCurrency(item.unit_cost) }}</span>
          </div>

          <!-- Total Value -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-end mt-2 lg:mt-0">
            <span class="text-xs text-gray-500 lg:hidden uppercase font-bold">Tổng:</span>
            <span class="text-sm font-semibold text-[#37EC13] tabular-nums">{{ formatCurrency(item.quantity * item.unit_cost) }}</span>
          </div>

          <!-- Production Date -->
          <div class="flex flex-col lg:flex-row lg:items-center mt-2 lg:mt-0 gap-1 lg:gap-0">
            <span class="text-xs text-gray-500 lg:hidden uppercase font-bold">NSX:</span>
            <span class="text-[11px] text-gray-400">{{ item.production_date ? formatDate(item.production_date) : '—' }}</span>
          </div>

          <!-- Expiry Date -->
          <div class="flex flex-col lg:flex-row lg:items-center mt-2 lg:mt-0 gap-1 lg:gap-0">
            <span class="text-xs text-gray-500 lg:hidden uppercase font-bold">HSD:</span>
            <span class="px-1.5 py-0.5 text-[11px] font-medium rounded w-fit"
                  :class="getExpiryClass(item.expiry_date)">
              {{ item.expiry_date ? formatDate(item.expiry_date) : '—' }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end absolute lg:static right-4 top-4 lg:right-0 lg:top-0">
            <div class="relative" v-if="authStore.hasPermission('batch_write')">
              <button @click="toggleMenu(item.batch_code)" @blur="closeMenuDelay" class="p-1.5 text-gray-500 hover:text-gray-200 hover:bg-[#2A362C] rounded-lg transition-colors focus:outline-none">
                <MoreVertical class="w-4 h-4" />
              </button>
              <transition name="fade">
                <div v-if="activeMenu === item.batch_code" class="absolute right-0 top-full mt-1 w-32 bg-[#1B241D] border border-[#2A362C] rounded-lg shadow-xl z-20 py-1 flex flex-col">
                  <button @click.stop="$emit('edit', item); activeMenu = null" class="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2A362C] hover:text-white transition-colors">
                    <Pencil class="w-4 h-4" /> Sửa
                  </button>
                  <div class="h-px bg-[#2A362C] my-1 w-full"></div>
                  <button @click.stop="$emit('delete', item.batch_code); activeMenu = null" class="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-[#2A362C] hover:text-red-300 transition-colors">
                    <Trash2 class="w-4 h-4" /> Xóa
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Footer -->
    <div v-if="filteredBatches.length > 0" class="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center bg-[#132210] rounded-b-xl mt-auto">
      <div class="text-gray-400 text-sm mb-4 sm:mb-0 whitespace-nowrap">
        Đang hiển thị <span class="text-white font-bold">{{ paginationTextStart }}-{{ paginationTextEnd }}</span> trên <span class="text-white font-bold">{{ filteredBatches.length }}</span> lô hàng
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
import { ref, computed, watch } from 'vue';
import { 
  Filter, Search, Check, Package, ArrowUpDown, Clock,
  MoreVertical, Pencil, Trash2, ChevronLeft, ChevronRight 
} from 'lucide-vue-next';
import type { Batch } from '@/features/batches/store';
import { useAuthStore } from '@/features/auth/store';

const props = defineProps<{
  batches: Batch[]
}>();

defineEmits(['edit', 'delete', 'delete-multiple']);

const authStore = useAuthStore();

// ---------- Multi Select ----------
const selectedItems = ref<string[]>([]);
const isAllSelected = computed(() => {
  return filteredBatches.value.length > 0 && selectedItems.value.length === filteredBatches.value.length;
});
const toggleSelectAll = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) {
    selectedItems.value = filteredBatches.value.map(b => b.batch_code);
  } else {
    selectedItems.value = [];
  }
};
watch(() => props.batches, () => {
  selectedItems.value = selectedItems.value.filter(id => props.batches.some(b => b.batch_code === id));
}, { deep: true });

// ---------- Search & Filter ----------
const searchQuery = ref('');
const selectedSupplier = ref('All');
const selectedExpiry = ref('All');
const showFilterMenu = ref(false);
const showStatusFilterMenu = ref(false);
const expiryStatuses = ['All', 'Còn hạn', 'Sắp hết hạn', 'Hết hạn'];

const uniqueSuppliers = computed(() => {
  const set = new Set(props.batches.map(b => b.supplier_name));
  return Array.from(set).sort();
});

// ---------- Sort ----------
const sortOptions = ['Ngày nhập ↓', 'Ngày nhập ↑', 'HSD ↑', 'HSD ↓', 'Giá trị ↓', 'Giá trị ↑'] as const;
const sortIndex = ref(0);
const sortLabel = computed(() => sortOptions[sortIndex.value]);

const toggleSort = () => {
  sortIndex.value = (sortIndex.value + 1) % sortOptions.length;
};

// ---------- Expiry helpers ----------
function getExpiryStatus(dateStr: string | null): 'ok' | 'warning' | 'expired' | 'none' {
  if (!dateStr) return 'none';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(dateStr);
  if (exp < now) return 'expired';
  const diff = exp.getTime() - now.getTime();
  if (diff <= 7 * 24 * 60 * 60 * 1000) return 'warning';
  return 'ok';
}

function getExpiryClass(dateStr: string | null) {
  const status = getExpiryStatus(dateStr);
  switch (status) {
    case 'expired': return 'bg-red-900/40 text-red-400 border border-red-900/50';
    case 'warning': return 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50';
    case 'ok': return 'bg-[#1B5E20]/40 text-[#37EC13] border border-[#1B5E20]';
    default: return 'text-gray-400';
  }
}

// ---------- Filtering ----------
const filteredBatches = computed(() => {
  let result = props.batches;

  // Filter by supplier
  if (selectedSupplier.value !== 'All') {
    result = result.filter(b => b.supplier_name === selectedSupplier.value);
  }

  // Filter by expiry status
  if (selectedExpiry.value !== 'All') {
    result = result.filter(b => {
      const status = getExpiryStatus(b.expiry_date);
      switch (selectedExpiry.value) {
        case 'Còn hạn': return status === 'ok';
        case 'Sắp hết hạn': return status === 'warning';
        case 'Hết hạn': return status === 'expired';
        default: return true;
      }
    });
  }

  // Search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(b =>
      b.batch_code.toLowerCase().includes(query) ||
      b.ingredient_name.toLowerCase().includes(query) ||
      b.supplier_name.toLowerCase().includes(query)
    );
  }

  // Sort
  result = [...result].sort((a, b) => {
    const opt = sortOptions[sortIndex.value];
    switch (opt) {
      case 'Ngày nhập ↓': return new Date(b.received_at).getTime() - new Date(a.received_at).getTime();
      case 'Ngày nhập ↑': return new Date(a.received_at).getTime() - new Date(b.received_at).getTime();
      case 'HSD ↑': return (a.expiry_date || '9999').localeCompare(b.expiry_date || '9999');
      case 'HSD ↓': return (b.expiry_date || '0000').localeCompare(a.expiry_date || '0000');
      case 'Giá trị ↓': return (b.quantity * b.unit_cost) - (a.quantity * a.unit_cost);
      case 'Giá trị ↑': return (a.quantity * a.unit_cost) - (b.quantity * b.unit_cost);
      default: return 0;
    }
  });

  return result;
});

// ---------- Pagination ----------
const currentPage = ref(1);
const itemsPerPage = ref(8);
watch([searchQuery, selectedSupplier, selectedExpiry], () => { currentPage.value = 1; });
const totalPages = computed(() => Math.ceil(filteredBatches.value.length / itemsPerPage.value));
const paginatedBatches = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredBatches.value.slice(start, start + itemsPerPage.value);
});
const paginationTextStart = computed(() => filteredBatches.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const paginationTextEnd = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredBatches.value.length));
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const goToPage = (page: number) => { currentPage.value = page; };

// ---------- Formatting ----------
function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}
function formatNumber(n: number) {
  return n.toLocaleString('vi-VN');
}
function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}
function shortenCode(code: string) {
  if (code.length <= 16) return code;
  return code.slice(0, 6) + '…' + code.slice(-8);
}

// ---------- UI Menus ----------
const toggleFilter = () => { showFilterMenu.value = !showFilterMenu.value; };
const closeFilterDelay = () => { setTimeout(() => { showFilterMenu.value = false; }, 200); };
const selectSupplier = (s: string) => { selectedSupplier.value = s; showFilterMenu.value = false; };

const toggleStatusFilter = () => { showStatusFilterMenu.value = !showStatusFilterMenu.value; };
const closeStatusFilterDelay = () => { setTimeout(() => { showStatusFilterMenu.value = false; }, 200); };
const selectExpiry = (s: string) => { selectedExpiry.value = s; showStatusFilterMenu.value = false; };

const activeMenu = ref<string | null>(null);
const toggleMenu = (id: string) => { activeMenu.value = activeMenu.value === id ? null : id; };
const closeMenuDelay = () => { setTimeout(() => { activeMenu.value = null; }, 200); };
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
</style>
