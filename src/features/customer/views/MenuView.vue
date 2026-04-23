<template>
  <div class="min-h-screen bg-[#0C160A] text-white flex flex-col font-sans relative">
    <div class="absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-[#132210] to-[#0C160A] pointer-events-none"></div>
    
    <CustomerNavbar />
    <CartSidebar />
    
    <main class="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative z-10 w-full">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-4xl md:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Thực Đơn <span class="text-[#4ade80]">Hảo Hạng</span></h2>
        <p class="text-gray-400 text-lg">Khám phá tinh hoa ẩm thực được chế tác từ những nguyên liệu tươi ngon nhất, mang đến trải nghiệm hương vị không thể nào quên.</p>
      </div>

      <div class="flex items-center gap-4 mb-8">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input v-model="searchQuery" type="text" placeholder="Tìm kiếm món ăn..." class="w-full pl-12 pr-4 py-3 bg-[#132210] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#4ade80] transition-colors" />
        </div>
      </div>

      <!-- Menu Grid -->
      <div v-if="customerStore.isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="bg-[#132210] rounded-2xl overflow-hidden border border-white/5 animate-pulse">
          <div class="h-48 bg-white/5"></div>
          <div class="p-5">
            <div class="h-5 bg-white/10 rounded w-3/4 mb-3"></div>
            <div class="h-4 bg-white/5 rounded w-1/4 mb-6"></div>
            <div class="h-10 bg-white/10 rounded-lg w-full"></div>
          </div>
        </div>
      </div>
      
      <div v-else-if="filteredDishes.length === 0" class="text-center py-20">
        <UtensilsCrossed class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 class="text-2xl font-bold text-gray-300">Không tìm thấy món ăn nào</h3>
        <p class="text-gray-500 mt-2">Vui lòng thử từ khóa khác.</p>
      </div>
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="dish in filteredDishes" :key="dish.dish_code" class="bg-[#132210] rounded-2xl overflow-hidden border border-white/5 hover:border-[#22c55e]/40 transition-all group flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          <div class="relative h-48 bg-black/40 overflow-hidden">
            <img v-if="dish.image_url" :src="dish.image_url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div v-else class="w-full h-full flex items-center justify-center opacity-30">
              <Image class="w-12 h-12" />
            </div>
            <div v-if="dish.category" class="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-semibold text-gray-200 border border-white/10 capitalize">
               {{ dish.category }}
            </div>
          </div>
          
          <div class="p-5 flex-1 flex flex-col">
            <h3 class="text-lg font-bold text-white mb-2 line-clamp-1" :title="dish.name">{{ dish.name }}</h3>
            <p v-if="dish.description" class="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">{{ dish.description }}</p>
            <div class="flex-1" v-else></div>
            
            <div class="flex items-end justify-between mt-4">
              <span class="text-xl font-bold text-[#4ade80]">{{ (dish.selling_price || 0).toLocaleString('vi-VN') }}đ</span>
              
              <button @click="addToCartWithToast(dish)" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#4ade80] text-gray-300 hover:text-black flex items-center justify-center transition-all">
                <Plus class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Search, Image, Plus, UtensilsCrossed } from 'lucide-vue-next';
import CustomerNavbar from '../components/CustomerNavbar.vue';
import CartSidebar from '../components/CartSidebar.vue';
import { useCustomerStore } from '../store';
import { useToast } from 'primevue/usetoast';

const customerStore = useCustomerStore();
const toast = useToast();
const searchQuery = ref('');

const addToCartWithToast = (dish: any) => {
  customerStore.addToCart(dish);
  toast.add({ severity: 'success', summary: 'Thành công', detail: `Đã thêm ${dish.name} vào giỏ`, life: 2000 });
};

const filteredDishes = computed(() => {
  if (!searchQuery.value) return customerStore.dishes;
  const q = searchQuery.value.toLowerCase();
  return customerStore.dishes.filter(d => 
    d.name.toLowerCase().includes(q) || 
    (d.description && d.description.toLowerCase().includes(q))
  );
});

onMounted(() => {
  customerStore.fetchDishes();
});
</script>
