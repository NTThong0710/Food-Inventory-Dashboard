<template>
  <aside class="w-64 bg-[#1F2E1C] min-h-screen text-[#132210] flex flex-col shadow-lg">
    <!-- Header / Logo -->
    <div class="px-6 pt-8 pb-6 flex items-center gap-4">
      <!-- Icon -->
      <div class="w-12 h-12 rounded-full bg-[#fde8dd] flex shrink-0 items-center justify-center border-2 border-[#d3ecd7]">
        <div class="w-6 h-6 border-2 border-[#c59e7e] rounded-sm bg-white"></div>
      </div>
      <div class="flex flex-col">
        <h2 class="text-xl font-bold leading-tight tracking-tight text-white">Tran Thong</h2>
        <span class="text-sm text-gray-400 font-medium">Manager Admin</span>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 px-4 mt-4 space-y-2">
      <router-link 
        to="/dashboard" 
        class="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium text-[16px]"
        active-class="bg-[#eaf5e6] text-[#1e6f30]"
        :class="$route.path === '/dashboard' ? 'bg-[#eaf5e6] text-[#1e6f30] font-semibold' : 'text-white hover:bg-gray-100 hover:text-[#1e6f30]'"
      >
        <LayoutDashboard class="w-6 h-6" :class="$route.path === '/dashboard' ? 'text-[#1e6f30]' : 'text-[#5a6b63]'" />
        Dashboard
      </router-link>

      <router-link 
        to="/ingredients" 
        class="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium text-[16px]"
        active-class="bg-[#eaf5e6] text-[#1e6f30]"
         :class="$route.path.startsWith('/ingredients') ? 'bg-[#eaf5e6] text-[#1e6f30] font-semibold' : 'text-white hover:bg-gray-100 hover:text-[#1e6f30]'"
      >
        <Apple class="w-6 h-6" :class="$route.path.startsWith('/ingredients') ? 'text-[#1e6f30]' : 'text-[#5a6b63]'" />
        Ingredients
      </router-link>

      <router-link 
        to="/dishes" 
        class="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium text-[16px]"
        active-class="bg-[#eaf5e6] text-[#1e6f30]"
        :class="$route.path.startsWith('/dishes') ? 'bg-[#eaf5e6] text-[#1e6f30] font-semibold' : 'text-white hover:bg-gray-100 hover:text-[#1e6f30]'"
      >
        <Utensils class="w-6 h-6" :class="$route.path.startsWith('/dishes') ? 'text-[#1e6f30]' : 'text-[#5a6b63]'" />
        Dishes
      </router-link>

      <!-- <router-link 
        to="/inventory" 
        class="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium text-[16px]"
        active-class="bg-[#eaf5e6] text-[#1e6f30]"
        :class="$route.path.startsWith('/inventory') ? 'bg-[#eaf5e6] text-[#1e6f30] font-semibold' : 'text-white hover:bg-gray-100 hover:text-[#1e6f30]'"
      >
        <Package class="w-6 h-6" :class="$route.path.startsWith('/inventory') ? 'text-[#1e6f30]' : 'text-[#5a6b63]'" />
        Inventory
      </router-link> -->

      <router-link 
        to="/reports" 
        class="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium text-[16px]"
        active-class="bg-[#eaf5e6] text-[#1e6f30]"
        :class="$route.path.startsWith('/reports') ? 'bg-[#eaf5e6] text-[#1e6f30] font-semibold' : 'text-white hover:bg-gray-100 hover:text-[#1e6f30]'"
      >
        <BarChart2 class="w-6 h-6" :class="$route.path.startsWith('/reports') ? 'text-[#1e6f30]' : 'text-[#5a6b63]'" />
        Reports
      </router-link>
    </nav>

    <!-- Footer / Log Out -->
    <div class="p-6 hover:text-[#1e6f30]">
      <button class="w-full flex items-center justify-center gap-2 py-3 border group border-gray-200 rounded-xl text-white font-bold hover:bg-gray-50 hover:text-[#1e6f30] transition-colors shadow-sm">
        <LogOut class="w-5 h-5 group-hover:text-[#1e6f30]" />
        Log Out
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { 
  LayoutDashboard, 
  Apple, 
  Utensils, 
  Package, 
  BarChart2, 
  LogOut 
} from 'lucide-vue-next'

const $route = useRoute()
</script>
