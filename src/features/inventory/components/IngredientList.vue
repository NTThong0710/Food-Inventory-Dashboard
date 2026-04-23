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
            v-model="searchInput"
            @input="handleSearch"
            type="text" 
            class="w-full bg-[#132210] border border-[#2A362C] text-[#A1B99D] text-sm rounded-lg focus:ring-[#37EC13] focus:border-[#37EC13] block pl-10 p-2.5 placeholder-gray-500 transition-colors" 
            placeholder="Tìm kiếm nguyên liệu, danh mục..."
          >
        </div>
        
        <!-- Filter Dropdown -->
        <div class="relative">
          <button @click="toggleFilter" @blur="closeFilterDelay" :aria-expanded="showFilterMenu" class="flex items-center gap-2 px-4 py-2.5 bg-[#132210] border border-[#2A362C] rounded-lg text-sm font-medium hover:bg-[#232F26] transition-colors whitespace-nowrap">
            <Filter class="w-4 h-4" />
            <span class="hidden sm:inline">{{ selectedCategory === 'All' ? 'Lọc' : selectedCategory }}</span>
          </button>
          
          <transition name="fade">
            <div v-if="showFilterMenu" class="absolute left-0 top-full mt-2 w-48 bg-[#132210] border border-[#2A362C] rounded-lg shadow-xl z-30 py-1 max-h-60 overflow-y-auto custom-scrollbar">
              <button 
                v-for="cat in filterCategories" 
                :key="cat"
                @click="selectCategory(cat)"
                class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A362C] hover:text-white transition-colors flex items-center justify-between"
              >
                {{ cat }}
                <Check v-if="selectedCategory === cat" class="w-4 h-4 text-[#37EC13]" />
              </button>
            </div>
          </transition>
        </div>

        <!-- Nút Sort -->
        <!-- Trong phần template, sửa nút Sort -->
<div class="relative">
  <button @click="toggleSortMenu" @blur="closeSortMenu" :aria-expanded="showSortMenu" class="flex items-center gap-2 px-4 py-2.5 bg-[#132210] border border-[#2A362C] rounded-lg text-sm font-medium hover:bg-[#232F26] transition-colors whitespace-nowrap">
    <ArrowUpDown class="w-4 h-4" />
    <span class="hidden sm:inline">Sắp xếp: {{ sortField === 'name' ? 'Tên' : sortField === 'cost' ? 'Giá' : 'Số lượng' }}</span>
    <span class="ml-1 text-xs" :class="sortOrder === 'asc' ? 'text-[#37EC13]' : 'text-orange-400'">
      ({{ sortOrder === 'asc' ? '↑' : '↓' }})
    </span>
  </button>
  
  <transition name="fade">
    <div v-if="showSortMenu" class="absolute left-0 top-full mt-2 w-56 bg-[#132210] border border-[#2A362C] rounded-lg shadow-xl z-30 py-1 max-h-60 overflow-y-auto custom-scrollbar">
      <!-- Sort by Name -->
      <button 
        @click="setSort('name')"
        class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A362C] hover:text-white transition-colors flex items-center justify-between"
      >
        <span class="flex items-center gap-2">
          <span>Tên</span>
        </span>
        <div class="flex items-center gap-1">
          <span v-if="sortField === 'name'" class="text-[#37EC13] text-xs">
            {{ sortOrder === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần' }}
          </span>
          <Check v-if="sortField === 'name'" class="w-4 h-4 text-[#37EC13]" />
        </div>
      </button>
      
      <!-- Sort by Price -->
      <button 
        @click="setSort('cost')"
        class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A362C] hover:text-white transition-colors flex items-center justify-between"
      >
        <span class="flex items-center gap-2">
          <span>Giá</span>
        </span>
        <div class="flex items-center gap-1">
          <span v-if="sortField === 'cost'" class="text-[#37EC13] text-xs">
            {{ sortOrder === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần' }}
          </span>
          <Check v-if="sortField === 'cost'" class="w-4 h-4 text-[#37EC13]" />
        </div>
      </button>
      
      <!-- Sort by Quantity -->
      <button 
        @click="setSort('quantity')"
        class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A362C] hover:text-white transition-colors flex items-center justify-between"
      >
        <span class="flex items-center gap-2">
          <span>Số lượng</span>
        </span>
        <div class="flex items-center gap-1">
          <span v-if="sortField === 'quantity'" class="text-[#37EC13] text-xs">
            {{ sortOrder === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần' }}
          </span>
          <Check v-if="sortField === 'quantity'" class="w-4 h-4 text-[#37EC13]" />
        </div>
      </button>
      
      <!-- Divider -->
      <div class="h-px bg-[#2A362C] my-1"></div>
      
      <!-- Toggle Order -->
      <button 
        @click="toggleSortOrder"
        class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A362C] hover:text-white transition-colors flex items-center justify-between"
      >
        <span>Đổi chiều</span>
        <span class="text-xs" :class="sortOrder === 'asc' ? 'text-[#37EC13]' : 'text-orange-400'">
          {{ sortOrder === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần' }}
        </span>
      </button>
    </div>
  </transition>
</div>

        <!-- Bulk Delete Button -->
        <button v-if="selectedItems.length > 0 && authStore.hasPermission('ingredient_write')" @click="$emit('delete-multiple', selectedItems)" class="flex items-center gap-2 px-4 py-2.5 bg-red-900/40 text-red-400 border border-red-900/50 rounded-lg text-sm font-medium hover:bg-red-900/60 transition-colors whitespace-nowrap">
          <Trash2 class="w-4 h-4" />
          <span class="hidden sm:inline">Xóa {{ selectedItems.length }} mục</span>
        </button>
        
      </div>
      <div class="text-gray-400 text-sm">
        Đang hiển thị <span class="text-white font-bold">{{ paginationTextStart }}-{{ paginationTextEnd }}</span> trên <span class="text-white font-bold">{{ filteredInventory.length }}</span> nguyên liệu
      </div>
    </div>

    <!-- Table Header (Hidden on small screens) -->
    <div class="hidden md:grid grid-cols-[40px_2fr_0.5fr_1.5fr_1.5fr_2fr_40px] gap-4 px-6 py-4 border-b border-[#2A362C] bg-[#152512] text-xs font-bold text-gray-500 uppercase tracking-wider items-center">
      <div class="flex justify-center">
        <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="w-4 h-4 rounded border-gray-600 outline-none text-[#37EC13] focus:ring-1 focus:ring-[#37EC13] bg-[#121811] cursor-pointer accent-[#37EC13]">
      </div>
      <div>Tên nguyên liệu</div>
      <div>Đơn vị</div>
      <div class="flex justify-center">Đơn giá</div>
      <div>Danh mục</div>
      <div class="flex justify-center">Tồn kho</div>
      <div class="flex justify-center"></div>
    </div>

    <!-- Empty State -->
    <!-- Chỗ v-if là viết tắt của !props.inventory || store.items.length() === 0 -->
    <div v-if="!(props.inventory?.length)" class="p-12 text-center text-gray-400">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1B241D] mb-4">
        <PackageX class="w-8 h-8 text-gray-500" />
      </div>
      <p>Không tìm thấy nguyên liệu. Vui lòng thêm nguyên liệu mới.</p>
    </div>

    <!-- Table Body -->
    <div class="flex flex-col">
      <div v-for="item in paginatedInventory" :key="item.sku" 
           class="grid grid-cols-[40px_1fr] md:grid-cols-[40px_2fr_0.5fr_1.5fr_1.5fr_2fr_40px] gap-4 px-4 md:px-6 py-5 border-b border-[#2A362C] hover:bg-[#1A231C]/60 transition-colors items-start md:items-center group relative md:static cursor-default">
           
        <div class="flex justify-center items-center md:mt-0 md:h-full mt-[10px]">
          <input type="checkbox" v-model="selectedItems" :value="item.sku" class="w-4 h-4 rounded border-gray-600 outline-none text-[#37EC13] focus:ring-1 focus:ring-[#37EC13] bg-[#1B241D] cursor-pointer accent-[#37EC13]">
        </div>

        <div class="grid grid-cols-1 md:contents gap-4 col-span-1">
          <!-- Name & Icon -->
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 shrink-0 rounded-lg bg-[#132210] border border-[#2A362C] flex justify-center items-center text-gray-300 shadow-inner">
              <component :is="getCategoryIcon(item.category)" class="w-5 h-5" :class="getCategoryColorClass(item.category)" />
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="font-bold text-base text-gray-100 leading-tight wrap-break-word w-full" :title="item.name">{{ item.name }}</span>
              <span class="text-xs text-gray-500 mt-0.5 font-mono">SKU: {{ item.sku }}</span>
            </div>
          </div>

          <!-- Unit & Mobile labels handled by responsive classes -->
          <div class="flex flex-col md:flex-row md:items-center mt-2 md:mt-0 gap-1.5 md:gap-0">
            <span class="text-xs text-gray-500 md:hidden uppercase font-bold">Đơn vị:</span>
            <span class="px-2.5 py-1 text-xs font-medium bg-[#1B241D] border border-[#2A362C] text-gray-300 rounded-md w-fit">
              {{ item.unit }}
            </span>
          </div>

          <!-- Price -->
          <div class="flex flex-col md:flex-row md:items-center md:justify-center mt-2 md:mt-0 gap-1.5 md:gap-0 relative">
            <span class="text-xs text-gray-500 md:hidden uppercase font-bold">Đơn giá:</span>
            
            <div v-if="!item.supplier_prices || item.supplier_prices.length === 0" class="font-medium text-gray-500 italic text-sm">
              <span v-if="item.cost > 0">{{ formatVND(item.cost) }}</span>
              <span v-else>Chưa báo giá</span>
            </div>
            
            <div v-else-if="item.supplier_prices.length === 1" class="font-medium text-gray-200 text-sm">
              {{ formatVND(item.supplier_prices[0]?.price ?? 0) }}
              <div class="text-[10px] text-gray-500 mt-0.5 line-clamp-1 text-center hidden md:block">{{ item.supplier_prices[0]?.supplier_name }}</div>
            </div>
            
            <div v-else class="relative">
               <button @click="togglePriceMenu(item.sku)" @blur="closePriceMenuDelay" class="font-medium text-[#37EC13] flex flex-col items-center gap-0.5 hover:opacity-80 focus:outline-none">
                 <span>Nhiều mức giá</span>
                 <span class="text-[10px] bg-[#37EC13]/20 px-2 py-0.5 rounded-full text-white">{{ item.supplier_prices.length }} NCC</span>
               </button>
               
               <transition name="fade">
                  <div v-if="activePriceMenu === item.sku" class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 md:bottom-auto md:top-full md:mt-2 w-max min-w-[220px] bg-[#1B241D] border border-[#2A362C] rounded-xl shadow-2xl z-30 py-2 flex flex-col cursor-default font-sans">
                     <div class="px-3 pb-2 border-b border-[#2A362C] mb-1 text-left">
                        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Báo giá theo Nhà Cung Cấp</span>
                     </div>
                     <div v-for="sp in item.supplier_prices" :key="sp.supplier_code" class="px-3 py-2 flex justify-between items-center hover:bg-[#2A362C] transition-colors border-b border-[#2A362C]/50 last:border-0">
                        <div class="flex flex-col text-left mr-4">
                           <span class="text-sm text-gray-200 font-bold">{{ sp.supplier_name }}</span>
                        </div>
                        <span class="text-sm font-black text-[#37EC13] tracking-tight">{{ formatVND(sp.price) }}</span>
                     </div>
                  </div>
               </transition>
            </div>
          </div>

          <!-- Category -->
          <div class="flex flex-col md:flex-row md:items-center mt-2 md:mt-0 gap-1.5 md:gap-0">
            <span class="text-xs text-gray-500 md:hidden uppercase font-bold">Danh mục:</span>
            <div class="flex items-center gap-2 px-3 py-1 bg-[#1B241D]/50 border border-[#2A362C]/50 rounded-full text-xs font-medium w-fit"
                 :class="getCategoryColorClass(item.category)">
              <div class="w-1.5 h-1.5 rounded-full" :class="getCategoryBgClass(item.category)"></div>
              {{ getCategoryLabel(item.category) }}
            </div>
          </div>

          <!-- Stock Level -->
          <div class="flex flex-col justify-center pr-0 md:pr-4 mt-3 md:mt-0">
            <div class="flex justify-between items-end mb-1.5">
              <span class="font-medium text-gray-200">{{ item.quantity }} {{ item.unit }}</span>
              <span class="text-xs font-medium" :class="getStockStatusColor(item.quantity)">
                {{ getStockStatusLabel(item.quantity) }}
              </span>
            </div>
            <div class="w-full h-1.5 bg-[#1B241D] rounded-full overflow-hidden border border-[#2A362C]/50">
              <div class="h-full rounded-full transition-all duration-500 ease-out" 
                   :class="getStockBarColor(item.quantity)"
                   :style="{ width: getStockWidth(item.quantity) }"></div>
            </div>
          </div>

          
          <!-- Actions -->
          <div class="flex items-center justify-end absolute md:static right-4 top-5 md:right-0 md:top-0">
            <div class="relative" v-if="authStore.hasPermission('ingredient_write')">
              <button @click="toggleMenu(item.sku)" @blur="closeMenuDelay" aria-label="More options" class="p-2 text-gray-500 hover:text-gray-200 hover:bg-[#2A362C] rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-gray-600">
                <MoreVertical class="w-5 h-5" />
              </button>
              
              <!-- Hover/Click Menu -->
              <transition name="fade">
                <div v-if="activeMenu === item.sku" class="absolute right-0 top-full mt-1 w-32 bg-[#1B241D] border border-[#2A362C] rounded-lg shadow-xl z-20 py-1 flex flex-col">
                  <button @click.stop="$emit('edit', item); activeMenu = null" class="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2A362C] hover:text-white transition-colors">
                    <Pencil class="w-4 h-4" /> Sửa
                  </button>
                  <div class="h-px bg-[#2A362C] my-1 w-full"></div>
                  <button @click.stop="$emit('delete', item.sku); activeMenu = null" class="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-[#2A362C] hover:text-red-300 transition-colors">
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
    <div v-if="filteredInventory.length > 0" class="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center bg-[#132210] rounded-b-xl mt-auto">
      <div class="text-gray-400 text-sm mb-4 sm:mb-0 whitespace-nowrap">
        Đang hiển thị <span class="text-white font-bold">{{ paginationTextStart }}-{{ paginationTextEnd }}</span> trên <span class="text-white font-bold">{{ filteredInventory.length }}</span> nguyên liệu
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
import { ref, computed, watch, onUnmounted } from 'vue';
import { 
  Filter, ArrowUpDown, PackageX, Package, 
  Apple, Drumstick, Milk, Wheat, Settings,
  MoreVertical, Pencil, Trash2, ChevronLeft, ChevronRight,
  Search, Check
} from 'lucide-vue-next';
import type { Ingredient } from '@/features/inventory/store';
import { useAuthStore } from '@/features/auth/store';
import { useDebounceFn } from '@vueuse/core';


const props = withDefaults(defineProps<{
  inventory?: Ingredient[];
}>(), {
  inventory: () => [] // Giá trị mặc định là mảng rỗng
});

defineEmits(['edit', 'delete', 'delete-multiple']);

const authStore = useAuthStore();

// ---------- Multi Select ----------
const selectedItems = ref<string[]>([]);
const isAllSelected = computed(() => {
  return filteredInventory.value.length > 0 && selectedItems.value.length === filteredInventory.value.length;
});
const toggleSelectAll = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) {
    selectedItems.value = filteredInventory.value.map(i => i.sku);
  } else {
    selectedItems.value = [];
  }
};
watch(() => props.inventory, () => {
  selectedItems.value = selectedItems.value.filter(id => props.inventory?.some(i => i.sku === id));
}, { deep: true });

// Filter & Search State
const searchQuery = ref('');
const selectedCategory = ref('All');
const showFilterMenu = ref(false);
const sortField = ref<'name' | 'cost' | 'quantity'>('name');
const sortOrder = ref<'asc' | 'desc'>('asc');
const showSortMenu = ref(false);

const searchInput = ref('');

const filterCategories = computed(() => {
  const cats = new Set(props.inventory.map(item => item.category));
  return ['All', ...Array.from(cats).filter(Boolean)];
});

const toggleSortMenu = () => {
  showSortMenu.value = !showSortMenu.value;
};

const closeSortMenu = () => {
  setTimeout(() => { showSortMenu.value = false; }, 200);
};

const setSort = (field: 'name' | 'cost' | 'quantity') => {
  // Nếu click cùng field, đảo sortOrder
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Nếu click field mới, set field mới và mặc định là asc
    sortField.value = field;
    sortOrder.value = 'asc';
  }
  // Đóng menu sau khi chọn
  showSortMenu.value = false;
};

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  showSortMenu.value = false;
};

// Derived state for filtering and sorting
const filteredInventory = computed(() => {
  
  let result = props.inventory || [];

  // Filter by category
  if (selectedCategory.value !== 'All') {
    result = result.filter(item => item.category === selectedCategory.value);
  }

  // Filter by search query
  const query = searchQuery.value.toLowerCase().trim();
  if (query) {
    result = result.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  result = [...result].sort((a, b) => {
    let compareValue = 0;
    
    if (sortField.value === 'name') {
      compareValue = a.name.localeCompare(b.name);
    } else if (sortField.value === 'cost') {
      compareValue = a.cost - b.cost;
    } else if (sortField.value === 'quantity') {
      compareValue = a.quantity - b.quantity;
    }
    
    // Nếu sortOrder là 'desc', đảo ngược kết quả
    return sortOrder.value === 'asc' ? compareValue : -compareValue;
  })

  return result;
});

// Pagination handling
const currentPage = ref(1);
const itemsPerPage = ref(5);

// Reset to page 1 when filters change
watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1;
});

const totalPages = computed(() => Math.ceil(filteredInventory.value.length / itemsPerPage.value));

const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredInventory.value.slice(start, start + itemsPerPage.value);
});

const paginationTextStart = computed(() => filteredInventory.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const paginationTextEnd = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredInventory.value.length));

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const goToPage = (page: number) => {
  currentPage.value = page;
};

// Toggle UI menus
const toggleFilter = () => {
  showFilterMenu.value = !showFilterMenu.value;
};
const closeFilterDelay = () => {
  setTimeout(() => { showFilterMenu.value = false; }, 200);
};
const selectCategory = (cat: string) => {
  selectedCategory.value = cat;
  showFilterMenu.value = false;
};

// Dropdown menu state for ingredients options
const activeMenu = ref<string | null>(null);
const toggleMenu = (sku: string) => {
  activeMenu.value = activeMenu.value === sku ? null : sku;
};
const closeMenuDelay = () => {
  setTimeout(() => { activeMenu.value = null; }, 200);
};

// Dropdown menu state for multiple prices
const activePriceMenu = ref<string | null>(null);
const togglePriceMenu = (sku: string) => {
  activePriceMenu.value = activePriceMenu.value === sku ? null : sku;
};
const closePriceMenuDelay = () => {
  setTimeout(() => { activePriceMenu.value = null; }, 200);
};

// Formatting helpers

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

const getExpiryColor = (dateString?: string) => {
  if (!dateString) return 'text-gray-400';
  
  const expiryDate = new Date(dateString).getTime();
  const today = new Date().getTime();
  const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return 'text-red-500 font-bold'; // Expired
  if (daysLeft <= 7) return 'text-orange-400 font-bold'; // Expiring soon
  return 'text-gray-300';
};

// Replace formatCurrency to match the mockup's visual if requested, but let's stick to their existing currency logic to avoid confusion:
function customCurrencyFormat(amount: number) {
  return formatVND(amount);
}

// Category styling metadata
const getCategoryLabel = (cat: string) => {
  return cat || 'Không rõ';
};

const getCategoryIcon = (cat: string) => {
  const lowerCat = cat?.toLowerCase() || '';
  if (lowerCat.includes('thịt') || lowerCat.includes('meat')) return Drumstick;
  if (lowerCat.includes('rau') || lowerCat.includes('củ') || lowerCat.includes('vegetable')) return Apple; 
  if (lowerCat.includes('sữa') || lowerCat.includes('dairy')) return Milk;
  if (lowerCat.includes('vị') || lowerCat.includes('spice')) return Wheat;
  if (lowerCat.includes('hải sản') || lowerCat.includes('seafood')) return Package; 
  if (lowerCat.includes('đồ khô') || lowerCat.includes('bún') || lowerCat.includes('phở') || lowerCat.includes('gạo')) return Wheat;
  return Settings;
};

const getCategoryColorClass = (cat: string) => {
  const lowerCat = cat?.toLowerCase() || '';
  if (lowerCat.includes('thịt') || lowerCat.includes('meat')) return 'text-red-400';
  if (lowerCat.includes('rau') || lowerCat.includes('củ') || lowerCat.includes('vegetable')) return 'text-green-400';
  if (lowerCat.includes('sữa') || lowerCat.includes('dairy')) return 'text-blue-400';
  if (lowerCat.includes('vị') || lowerCat.includes('spice')) return 'text-purple-400';
  if (lowerCat.includes('hải sản') || lowerCat.includes('seafood')) return 'text-cyan-400';
  if (lowerCat.includes('đồ khô') || lowerCat.includes('bún') || lowerCat.includes('phở')) return 'text-yellow-400';
  return 'text-gray-400';
};

const getCategoryBgClass = (cat: string) => {
  const lowerCat = cat?.toLowerCase() || '';
  if (lowerCat.includes('thịt') || lowerCat.includes('meat')) return 'bg-red-400';
  if (lowerCat.includes('rau') || lowerCat.includes('củ') || lowerCat.includes('vegetable')) return 'bg-green-400';
  if (lowerCat.includes('sữa') || lowerCat.includes('dairy')) return 'bg-blue-400';
  if (lowerCat.includes('vị') || lowerCat.includes('spice')) return 'bg-purple-400';
  if (lowerCat.includes('hải sản') || lowerCat.includes('seafood')) return 'bg-cyan-400';
  if (lowerCat.includes('đồ khô') || lowerCat.includes('bún') || lowerCat.includes('phở')) return 'bg-yellow-400';
  return 'bg-gray-400';
};

// Stock Progress Bar Logic
const getStockStatus = (qty: number) => {
  if (qty > 40) return 'high';
  if (qty >= 20) return 'normal';
  return 'low';
};

const getStockStatusLabel = (qty: number) => {
  const status = getStockStatus(qty);
  if (status === 'high') return 'Nhiều';
  if (status === 'normal') return 'Vừa';
  return 'Sắp hết';
};

const getStockStatusColor = (qty: number) => {
  const status = getStockStatus(qty);
  if (status === 'high') return 'text-[#37EC13]';
  if (status === 'normal') return 'text-[#37EC13]/70';
  return 'text-orange-400';
};

const getStockBarColor = (qty: number) => {
  const status = getStockStatus(qty);
  // Using the vibrant green from the picture and dashboard
  if (status === 'high') return 'bg-[#37EC13] shadow-[0_0_10px_rgba(55,236,19,0.3)]';
  if (status === 'normal') return 'bg-[#37EC13]/70';
  return 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.3)]';
};

const getStockWidth = (qty: number) => {
  // Max visual scale assumed at roughly 100 for percentage visualization
  const percentage = Math.min((qty/100)*100, 100);
  return `${Math.max(percentage, 5)}%`; // Ensure minimum visibility width
};

//Hàm này dùng để debounce, tránh spam thanh tìm kiếm
const handleSearch = useDebounceFn(() => {
  searchQuery.value = searchInput.value;
}, 500);

</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.sort-arrow {
  transition: transform 0.2s ease;
}
.sort-arrow.asc {
  transform: rotate(0deg);
}
.sort-arrow.desc {
  transform: rotate(180deg);
}

/* Custom Scrollbar cho dropdown */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #132210;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #2A362C;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #37EC13;
}
</style>
