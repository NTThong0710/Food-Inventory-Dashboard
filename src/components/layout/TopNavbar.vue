<template>
  <nav class="w-full bg-[#1A2E16] border-b border-[#2A362C] px-6 h-16 flex items-center justify-between sticky top-0 z-50">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-md bg-[#1B5E20] text-white flex justify-center items-center shadow-[0_0_10px_rgba(46,125,50,0.5)]">
          <Utensils class="w-4 h-4" aria-hidden="true" />
        </div>
        <span class="text-white font-bold text-lg tracking-tight">KitchenOps <span class="text-gray-300 font-medium text-sm">ERP</span></span>
      </router-link>

      <!-- Nav Links -->
      <div class="flex md:flex items-center gap-1 bg-[#1A2E16] py-2 px-10 rounded-md">
        <router-link 
          to="/dashboard" 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="$route.path === '/dashboard' ? 'bg-[#1B5E20] text-[#37EC13] shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1B241D]'"
        >
          Dashboard
        </router-link>
        <router-link 
          to="/ingredients" 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="$route.path.startsWith('/ingredients') ? 'bg-[#1B5E20] text-[#37EC13] shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1B241D]'"
        >
          Ingredients
        </router-link>
        <router-link 
          to="/dishes" 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="$route.path.startsWith('/dishes') ? 'bg-[#1B5E20] text-[#37EC13] shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1B241D]'"
        >
          Dishes
        </router-link>
        <router-link 
          to="/suppliers" 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="$route.path.startsWith('/suppliers') ? 'bg-[#1B5E20] text-[#37EC13] shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1B241D]'"
        >
          Suppliers
        </router-link>
      </div>

   

    <!-- Profile & Theme Toggle -->
    <div class="flex items-center gap-4">
      <div class="flex-col text-right hidden md:block">
        <span class="text-sm font-medium text-white">{{ username }}</span>
        <!-- <span class="text-xs text-gray-400">{{ authStore.userEmail }}</span> -->
      </div>
      <router-link to="/account" class="w-10 h-10 rounded-full bg-[#1B5E20] border-2 border-[#37EC13] flex items-center justify-center text-white font-bold cursor-pointer hover:bg-[#2a7c2e] transition-colors" :title="username">
        {{ userInitial }}
      </router-link>
      <!-- Theme Toggle Button -->
      <button
        @click="themeStore.toggleTheme"
        class="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#1B241D] rounded-lg transition-colors"
        :title="themeStore.isDark ? 'Chế độ sáng' : 'Chế độ tối'"
      >
        <Sun v-if="themeStore.isDark" class="w-5 h-5 text-yellow-400" />
        <Moon v-else class="w-5 h-5 text-blue-400" />
      </button>
      <button @click="handleLogout" class="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Sign Out" aria-label="Sign Out">
        <LogOut class="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { Utensils, LogOut, Sun, Moon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const $route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const username = computed(() => {
  return authStore.displayName
})

const userInitial = computed(() => {
  return username.value.charAt(0).toUpperCase()
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
