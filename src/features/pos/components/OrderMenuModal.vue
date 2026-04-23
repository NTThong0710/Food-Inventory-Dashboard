<template>
  <!-- Full-screen slide-up modal for dish selection -->
  <Transition name="menu-modal">
    <div v-if="visible" class="fixed inset-0 z-50 flex flex-col">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" />

      <!-- Modal Panel -->
      <div class="relative mt-auto h-[85vh] bg-[#0C160A] rounded-t-3xl border-t border-[#2A362C] flex flex-col overflow-hidden shadow-2xl">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 bg-[#132210] border-b border-[#2A362C] shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-[#1B5E20] flex items-center justify-center">
              <Utensils class="w-4 h-4 text-[#37EC13]" />
            </div>
            <div>
              <h3 class="font-bold text-white">Chọn Món Ăn</h3>
              <p class="text-xs text-gray-400">Bàn {{ tableLabel }} · {{ selectedCount }} món đã chọn</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Search bar -->
        <div class="px-6 py-3 bg-[#0C160A] border-b border-[#2A362C]/50 shrink-0">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm tên món..."
              class="w-full bg-[#132210] border border-[#2A362C] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#37EC13] transition-colors"
              autofocus
            />
          </div>
        </div>

        <!-- Dish Grid -->
        <div class="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar">
          <div v-if="filteredDishes.length === 0" class="flex flex-col items-center justify-center h-40 text-gray-600">
            <Utensils class="w-10 h-10 mb-3 opacity-30" />
            <p class="text-sm">Không tìm thấy món ăn</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <button
              v-for="dish in filteredDishes"
              :key="dish.dish_code"
              @click="addDish(dish)"
              class="relative flex flex-col items-center rounded-2xl border p-3 cursor-pointer transition-all duration-200 hover:scale-[1.03] group text-left"
              :class="addedMap[dish.dish_code]
                ? 'bg-[#1B5E20]/20 border-[#37EC13]/60 shadow-[0_0_12px_rgba(55,236,19,0.15)]'
                : 'bg-[#132210]/80 border-[#2A362C] hover:border-[#37EC13]/30'"
            >
              <!-- Quantity badge -->
              <div v-if="addedMap[dish.dish_code]"
                class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#37EC13] text-black text-xs font-black flex items-center justify-center shadow-md z-10">
                {{ addedMap[dish.dish_code] }}
              </div>

              <!-- Image -->
              <div class="w-full aspect-square bg-[#1A2E16] rounded-xl mb-3 overflow-hidden flex items-center justify-center relative">
                <img v-if="dish.image_url" :src="dish.image_url" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                <Utensils v-else class="w-7 h-7 text-[#2A362C]" />
                <!-- Hover overlay -->
                <div class="absolute inset-0 bg-[#37EC13]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div class="w-7 h-7 rounded-full bg-[#37EC13] flex items-center justify-center shadow">
                    <Plus class="w-4 h-4 text-black" />
                  </div>
                </div>
              </div>

              <p class="text-xs font-bold text-gray-200 text-center line-clamp-2 w-full leading-tight h-8 group-hover:text-white transition-colors">
                {{ dish.name }}
              </p>
              <p class="text-[#37EC13] font-bold text-xs mt-1.5 bg-[#1B5E20]/20 px-2 py-0.5 rounded-full">
                {{ formatCurrency(dish.selling_price || 0) }}
              </p>
            </button>
          </div>
        </div>

        <!-- Footer: confirm -->
        <div class="shrink-0 bg-[#132210] border-t border-[#2A362C] px-6 py-4 flex items-center gap-4">
          <div class="flex-1">
            <p class="text-xs text-gray-500 font-medium">Nhấn một món để thêm vào order</p>
            <p class="text-sm font-bold text-white mt-0.5">{{ selectedCount }} món đã chọn trong phiên này</p>
          </div>
          <button
            @click="$emit('close')"
            class="px-6 py-2.5 rounded-xl bg-[#37EC13] hover:bg-[#2ecc11] text-black font-bold text-sm transition-colors shadow-lg"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, Search, Utensils, Plus } from 'lucide-vue-next';

const props = defineProps<{
  visible: boolean;
  dishes: any[];
  tableLabel: string;
  currentItems?: any[]; // existing order items to show quantity badges
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'add', dish: any): void;
}>();

const searchQuery = ref('');

// Track how many times each dish was added THIS session (for badge)
const sessionAdded = ref<Record<string, number>>({});

const addedMap = computed(() => {
  const map: Record<string, number> = {};
  // From existing order items
  (props.currentItems || []).forEach(item => {
    map[item.dish_code] = (map[item.dish_code] || 0) + item.quantity;
  });
  // Plus this session's additions
  Object.entries(sessionAdded.value).forEach(([code, qty]) => {
    map[code] = (map[code] || 0) + qty;
  });
  return map;
});

const selectedCount = computed(() =>
  Object.values(sessionAdded.value).reduce((a, b) => a + b, 0)
);

const filteredDishes = computed(() => {
  if (!searchQuery.value.trim()) return props.dishes;
  const q = searchQuery.value.toLowerCase();
  return props.dishes.filter(d => d.name?.toLowerCase().includes(q));
});

function addDish(dish: any) {
  sessionAdded.value[dish.dish_code] = (sessionAdded.value[dish.dish_code] || 0) + 1;
  emit('add', dish);
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
</script>

<style scoped>
.menu-modal-enter-active {
  transition: opacity 0.2s ease;
}
.menu-modal-leave-active {
  transition: opacity 0.2s ease;
}
.menu-modal-enter-from,
.menu-modal-leave-to {
  opacity: 0;
}
.menu-modal-enter-active .relative.mt-auto,
.menu-modal-leave-active .relative.mt-auto {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.menu-modal-enter-from .relative.mt-auto {
  transform: translateY(100%);
}
.menu-modal-leave-to .relative.mt-auto {
  transform: translateY(100%);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #1B5E20 rgba(12, 22, 10, 0.5);
}
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(12, 22, 10, 0.5); }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #1B5E20; border-radius: 10px; }
</style>
