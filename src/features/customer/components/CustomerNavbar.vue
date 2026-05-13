<template>
  <nav class="relative z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full bg-[#0C160A]/80 backdrop-blur-md sticky top-0 border-b border-white/5">
    <div class="flex items-center gap-6">
      <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div class="w-10 h-10 rounded-full bg-linear-to-br from-[#4ade80] to-[#22c55e] flex items-center justify-center text-[#0C160A]">
          <ChefHat class="w-6 h-6" />
        </div>
        <h1 class="text-xl font-bold tracking-wider text-white hidden sm:block">NOVA<span class="text-[#4ade80]">RESTO</span></h1>
      </router-link>

      <div class="hidden md:flex gap-1 ml-8">
        <router-link v-if="authStore.isAuthenticated" to="/booking" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#132210] transition-colors" exact-active-class="text-white bg-[#132210] border border-[#22c55e]/30">Đặt Bàn</router-link>
        <router-link to="/menu" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#132210] transition-colors" exact-active-class="text-white bg-[#132210] border border-[#22c55e]/30">Thực Đơn</router-link>
      </div>
    </div>
    
    <div class="flex items-center gap-4">
      <button v-if="$route.path === '/menu'" @click="customerStore.toggleCart" class="relative p-2 text-gray-300 hover:text-white transition-colors group">
        <ShoppingCart class="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span v-if="customerStore.cartCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full shadow-lg">
          {{ customerStore.cartCount }}
        </span>
      </button>
      
      <div v-if="!authStore.isAuthenticated" class="hidden sm:flex gap-3">
        <router-link to="/login" class="px-6 py-2 rounded-full bg-[#132210] border border-[#22c55e]/30 hover:border-[#4ade80]/60 text-white text-sm font-medium transition-all">
          Đăng Nhập
        </router-link>
      </div>

      <div v-else class="hidden sm:flex items-center gap-3">
        <!-- Notification Bell -->
        <div class="relative">
          <button @click="customerStore.toggleNotifications" class="relative p-2 text-gray-400 hover:text-white transition-colors group">
            <Bell class="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span v-if="customerStore.unreadNotificationsCount > 0" class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg border border-[#0C160A]"></span>
          </button>
          
          <!-- Notifications Dropdown -->
          <div v-if="customerStore.isNotificationsOpen" class="absolute right-0 mt-2 w-80 bg-[#132210] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div class="p-4 border-b border-white/5 flex justify-between items-center bg-[#1A2E16]">
              <h3 class="font-bold text-white">Cập nhật lúc {{ new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) }}</h3>
              <span class="text-xs text-[#4ade80]">{{ customerStore.notifications.length }} thông báo</span>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div v-if="customerStore.notifications.length === 0" class="p-6 text-center text-gray-500 text-sm">
                Bạn chưa có thông báo nào.
              </div>
              <div v-for="notif in customerStore.notifications" :key="notif.id" class="p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-3">
                <div class="mt-0.5">
                  <div v-if="notif.type === 'error'" class="w-2 h-2 rounded-full bg-red-500 mt-1"></div>
                  <div v-else-if="notif.type === 'success'" class="w-2 h-2 rounded-full bg-green-500 mt-1"></div>
                  <div v-else class="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white" :class="{'text-red-400': notif.type === 'error', 'text-green-400': notif.type === 'success'}">{{ notif.title }}</h4>
                  <p class="text-xs text-gray-400 mt-1 leading-relaxed">{{ notif.message }}</p>
                  <p class="text-[10px] text-gray-500 mt-2">{{ new Date(notif.created_at).toLocaleString('vi-VN') }}</p>
                </div>
                <button @click.stop="customerStore.deleteNotification(notif.id)" class="ml-auto text-gray-500 hover:text-red-400 transition-colors p-1" title="Xóa">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <router-link to="/c-profile" class="flex items-center gap-2 group px-3 py-1.5 rounded-full bg-[#132210] border border-white/5 hover:border-[#22c55e]/30 transition-all">
          <div class="w-7 h-7 rounded-full bg-[#4ade80] text-black flex justify-center items-center font-bold text-xs">
            {{ authStore.displayName?.charAt(0).toUpperCase() }}
          </div>
          <span class="text-sm font-medium text-white">{{ authStore.displayName }}</span>
        </router-link>
        
        <button @click="handleLogout" class="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Đăng Xuất">
          <LogOut class="w-5 h-5" />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { ChefHat, ShoppingCart, LogOut, Bell, Trash2 } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useCustomerStore } from '../store';
import { useAuthStore } from '@/features/auth/store';

const customerStore = useCustomerStore();
const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  if (authStore.isAuthenticated) {
    customerStore.fetchNotifications();
  }
});

watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) customerStore.fetchNotifications();
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
