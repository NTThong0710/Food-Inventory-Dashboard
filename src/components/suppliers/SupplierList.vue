<template>
  <section class="w-full bg-[#1A2E16] text-white rounded-xl border border-[#2A362C] shadow-lg flex flex-col font-sans">
    
    <!-- Top toolbar -->
    <div class="p-4 sm:p-6 border-b border-[#2A362C] flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="flex gap-3 w-full sm:w-auto">
        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-4 w-4 text-gray-500" />
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            class="w-full bg-[#132210] border border-[#2A362C] text-[#A1B99D] text-sm rounded-lg focus:ring-[#37EC13] focus:border-[#37EC13] block pl-10 p-2.5 placeholder-gray-500 transition-colors" 
            placeholder="Tìm kiếm nhà cung cấp..."
          >
        </div>
        
        <!-- Filter Dropdown -->
        <div class="relative">
          <button @click="toggleFilter" @blur="closeFilterDelay" class="flex items-center gap-2 px-4 py-2.5 bg-[#132210] border border-[#2A362C] rounded-lg text-sm font-medium hover:bg-[#232F26] transition-colors whitespace-nowrap">
            <Filter class="w-4 h-4" />
            <span class="hidden sm:inline">{{ selectedStatus === 'All' ? 'Lọc trạng thái' : selectedStatus }}</span>
          </button>
          
          <transition name="fade">
            <div v-if="showFilterMenu" class="absolute left-0 top-full mt-2 w-40 bg-[#1B241D] border border-[#2A362C] rounded-lg shadow-xl z-30 py-1">
              <button 
                v-for="status in filterStatuses" 
                :key="status"
                @click="selectStatus(status)"
                class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A362C] hover:text-white transition-colors flex items-center justify-between"
              >
                {{ status }}
                <Check v-if="selectedStatus === status" class="w-4 h-4 text-[#37EC13]" />
              </button>
            </div>
          </transition>
        </div>

        <!-- Sort Button -->
        <button @click="toggleSort('name')" class="flex items-center gap-2 px-4 py-2.5 bg-[#132210] border border-[#2A362C] rounded-lg text-sm font-medium hover:bg-[#232F26] transition-colors whitespace-nowrap" :title="sortField === 'name' ? `Sắp xếp ${sortOrder === 'asc' ? 'giảm dần' : 'tăng dần'}` : 'Sắp xếp theo tên'">
          <ArrowUpDown class="w-4 h-4" />
          <span class="hidden sm:inline">Sắp xếp: {{ sortField === 'name' ? 'Tên' : sortField }}</span>
        </button>
      </div>
    </div>

    <!-- Table Header -->
    <div class="hidden md:grid grid-cols-[2.5fr_1fr_1.5fr_1fr_80px] gap-4 px-6 py-4 border-b border-[#2A362C] bg-[#152512] text-xs font-bold text-gray-500 uppercase tracking-wider">
      <div>Tên nhà cung cấp</div>
      <div>Liên hệ</div>
      <div>Email / ĐT</div>
      <div>Trạng thái</div>
      <div class="text-right pr-6">Thao tác</div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredSuppliers.length === 0" class="p-12 text-center text-gray-400">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1B241D] mb-4">
        <Users class="w-8 h-8 text-gray-500" />
      </div>
      <p>Không tìm thấy nhà cung cấp nào. Hãy thử thêm nhà cung cấp mới!</p>
    </div>

    <!-- Table Body -->
    <div class="flex flex-col">
      <div v-for="item in paginatedSuppliers" :key="item.supplier_code" 
           class="grid grid-cols-1 md:grid-cols-[2.5fr_1fr_1.5fr_1fr_80px] gap-4 px-6 py-5 border-b border-[#2A362C] hover:bg-[#1A231C]/60 transition-colors items-center group relative md:static cursor-default">
        
        <!-- Name -->
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-[#0F1410] border border-[#2A362C] flex justify-center items-center text-gray-300 shadow-inner">
            <Building class="w-5 h-5 text-gray-400" />
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="font-bold text-base text-gray-100 truncate w-full" :title="item.name">{{ item.name }}</span>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs text-gray-500 truncate">{{ item.address }}</span>
              <span v-if="item.ingredients && item.ingredients.length > 0" class="text-[10px] px-1.5 py-0.5 bg-[#2A362C] text-gray-300 rounded whitespace-nowrap">
                {{ item.ingredients.length }} SP
              </span>
            </div>
          </div>
        </div>

        <!-- Contact Person -->
        <div class="flex flex-col md:flex-row md:items-center mt-2 md:mt-0 gap-1.5 md:gap-0">
          <span class="text-xs text-gray-500 md:hidden uppercase font-bold">Liên hệ:</span>
          <span class="text-sm font-medium text-gray-300">
            {{ item.contact_name }}
          </span>
        </div>

        <!-- Email & Phone -->
        <div class="flex flex-col mt-2 md:mt-0 gap-0.5">
          <span class="text-xs text-gray-500 md:hidden uppercase font-bold mb-1">Thông tin liên hệ:</span>
          <span class="font-medium text-[#37EC13] text-sm truncate" :title="item.email">{{ item.email }}</span>
          <span class="text-xs text-gray-400">{{ item.phone }}</span>
        </div>

        <!-- Status -->
        <div class="flex flex-col md:flex-row md:items-center mt-2 md:mt-0 gap-1.5 md:gap-0">
          <span class="text-xs text-gray-500 md:hidden uppercase font-bold">Trạng thái:</span>
          <span class="px-2.5 py-1 text-xs font-medium rounded-md w-fit"
                :class="item.status === 'Active' ? 'bg-[#1B5E20]/40 text-[#37EC13] border border-[#1B5E20]' : 'bg-red-900/30 text-red-400 border border-red-900/50'">
            {{ item.status }}
          </span>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end absolute md:static right-4 top-4 md:right-0 md:top-0">
          <div class="relative">
            <button @click="toggleMenu(item.supplier_code)" @blur="closeMenuDelay" class="p-2 text-gray-500 hover:text-gray-200 hover:bg-[#2A362C] rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-gray-600">
              <MoreVertical class="w-5 h-5" />
            </button>
            <transition name="fade">
              <div v-if="activeMenu === item.supplier_code" class="absolute right-0 top-full mt-1 w-32 bg-[#1B241D] border border-[#2A362C] rounded-lg shadow-xl z-20 py-1 flex flex-col">
                <button @click.stop="$emit('edit', item); activeMenu = null" class="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2A362C] hover:text-white transition-colors">
                  <Pencil class="w-4 h-4" /> Sửa
                </button>
                <div class="h-px bg-[#2A362C] my-1 w-full"></div>
                <button @click.stop="$emit('delete', item.supplier_code); activeMenu = null" class="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-[#2A362C] hover:text-red-300 transition-colors">
                  <Trash2 class="w-4 h-4" /> Xóa
                </button>
              </div>
            </transition>
          </div>
        </div>
        
      </div>
    </div>

    <!-- Pagination Footer -->
    <div v-if="filteredSuppliers.length > 0" class="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center bg-[#132210] rounded-b-xl mt-auto">
      <div class="text-gray-400 text-sm mb-4 sm:mb-0 whitespace-nowrap">
        Đang hiển thị <span class="text-white font-bold">{{ paginationTextStart }}</span> đến <span class="text-white font-bold">{{ paginationTextEnd }}</span> trên <span class="text-white font-bold">{{ filteredSuppliers.length }}</span> kết quả
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
  Filter, Search, Check, Users, Building, ArrowUpDown,
  MoreVertical, Pencil, Trash2, ChevronLeft, ChevronRight 
} from 'lucide-vue-next';
import type { Supplier } from '@/stores/suppliers';

const props = defineProps<{
  suppliers: Supplier[]
}>();

defineEmits(['edit', 'delete']);

// Filter & Search
const searchQuery = ref('');
const selectedStatus = ref('All');
const showFilterMenu = ref(false);
const sortField = ref<'name' | 'status'>('name');
const sortOrder = ref<'asc' | 'desc'>('asc');
const filterStatuses = ['All', 'Active', 'Inactive'];

// Sort handler
const toggleSort = (field: typeof sortField.value) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }
};

const filteredSuppliers = computed(() => {
  let result = props.suppliers;
  if (selectedStatus.value !== 'All') {
    result = result.filter(item => item.status === selectedStatus.value);
  }
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(item => item.name.toLowerCase().includes(query) || item.contact_name.toLowerCase().includes(query));
  }
  
  // Apply sorting
  result = [...result].sort((a, b) => {
    let compareValue = 0;
    if (sortField.value === 'name') {
      compareValue = a.name.localeCompare(b.name);
    } else if (sortField.value === 'status') {
      compareValue = a.status.localeCompare(b.status);
    }
    return sortOrder.value === 'asc' ? compareValue : -compareValue;
  });
  
  return result;
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);
watch([searchQuery, selectedStatus], () => { currentPage.value = 1; });
const totalPages = computed(() => Math.ceil(filteredSuppliers.value.length / itemsPerPage.value));
const paginatedSuppliers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredSuppliers.value.slice(start, start + itemsPerPage.value);
});
const paginationTextStart = computed(() => filteredSuppliers.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
const paginationTextEnd = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredSuppliers.value.length));
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const goToPage = (page: number) => { currentPage.value = page; };

// UI Menus
const toggleFilter = () => { showFilterMenu.value = !showFilterMenu.value; };
const closeFilterDelay = () => { setTimeout(() => { showFilterMenu.value = false; }, 200); };
const selectStatus = (cat: string) => { selectedStatus.value = cat; showFilterMenu.value = false; };

const activeMenu = ref<string | null>(null);
const toggleMenu = (id: string) => { activeMenu.value = activeMenu.value === id ? null : id; };
const closeMenuDelay = () => { setTimeout(() => { activeMenu.value = null; }, 200); };
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
</style>
