<template>
  <nav class="w-full bg-sidebar border-b border-sidebar-border px-6 h-16 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-md bg-sidebar-accent text-sidebar-accent-foreground flex justify-center items-center shadow-[0_0_10px_rgba(46,125,50,0.5)]">
          <Utensils class="w-4 h-4" aria-hidden="true" />
        </div>
        <span class="text-sidebar-foreground font-bold text-lg tracking-tight">Nova<span class="text-accent">Resto</span> <span class="text-muted-foreground font-medium text-sm">ERP</span></span>
      </router-link>

      <!-- Nav Links -->
      <div class="flex md:flex items-center gap-1 bg-sidebar py-2 px-10 rounded-md transition-colors duration-300">
        <router-link 
          v-if="authStore.hasPermission('dashboard_read')"
          to="/dashboard" 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="$route.path === '/dashboard' ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'"
        >
          Tổng quan
        </router-link>
        <router-link 
          v-if="authStore.hasPermission('dashboard_read')"
          to="/ai-management" 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
          :class="$route.path.startsWith('/ai-management') ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'"
        >
          Quản lý AI
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent/20 text-accent border border-accent/30">Admin</span>
        </router-link>
        <router-link 
          v-if="authStore.hasPermission('ingredient_read')"
          to="/ingredients" 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="$route.path.startsWith('/ingredients') ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'"
        >
          Nguyên liệu
        </router-link>
        <router-link 
          v-if="authStore.hasPermission('dish_read')"
          to="/dishes" 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
          :class="$route.path.startsWith('/dishes') ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'"
        >
          Món ăn
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent/20 text-accent border border-accent/30">AI</span>
        </router-link>
        <router-link 
          v-if="authStore.hasPermission('supplier_read')"
          to="/suppliers" 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="$route.path.startsWith('/suppliers') ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'"
        >
          Nhà cung cấp
        </router-link>
        <!-- Kho Dropdown -->
        <div 
          v-if="authStore.hasPermission('sale_read') || authStore.hasPermission('batch_read')"
          class="relative group"
        >
          <button 
            type="button"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
            :class="($route.path.startsWith('/sales') || $route.path.startsWith('/batches')) ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'"
          >
            Kho
            <ChevronDown class="w-4 h-4 transition-transform group-hover:rotate-180" />
          </button>
          
          <div class="absolute top-full left-0 mt-1 w-40 bg-popover border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden flex flex-col">
            <router-link 
              v-if="authStore.hasPermission('sale_read')"
              to="/sales" 
              class="px-4 py-3 text-sm font-medium transition-colors"
              :class="$route.path.startsWith('/sales') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'"
            >
              Xuất kho
            </router-link>
            <router-link 
              v-if="authStore.hasPermission('batch_read')"
              to="/batches" 
              class="px-4 py-3 text-sm font-medium transition-colors flex items-center justify-between"
              :class="$route.path.startsWith('/batches') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'"
            >
              Nhập kho
              <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent/20 text-accent border border-accent/30">AI</span>
            </router-link>
          </div>
        </div>
        <!-- Phục vụ dropdown: POS + Sơ đồ bàn + Báo giá -->
        <div
          v-if="authStore.hasPermission('pos_read') || authStore.hasPermission('table_read') || authStore.hasPermission('booking_read')"
          class="relative group"
        >
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
            :class="($route.path.startsWith('/pos') || $route.path.startsWith('/table-map') || $route.path.startsWith('/quotations')) ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'"
          >
            Phục vụ
            <ChevronDown class="w-4 h-4 transition-transform group-hover:rotate-180" />
          </button>

          <div class="absolute top-full left-0 mt-1 w-44 bg-popover border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden flex flex-col">
            <router-link
              v-if="authStore.hasPermission('pos_read')"
              to="/pos"
              class="flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors"
              :class="$route.path === '/pos' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'"
            >
              <MonitorSmartphone class="w-4 h-4" /> Order POS
            </router-link>
            <router-link
              v-if="authStore.hasPermission('table_read')"
              to="/table-map"
              class="flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors"
              :class="$route.path.startsWith('/table-map') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'"
            >
              <LayoutGrid class="w-4 h-4" /> Sơ đồ Bàn
            </router-link>
            <router-link
              v-if="authStore.hasPermission('booking_read')"
              to="/quotations"
              class="flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors"
              :class="$route.path.startsWith('/quotations') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'"
            >
              <FileText class="w-4 h-4" /> Báo giá
            </router-link>
          </div>
        </div>
      </div>

   

    <!-- Profile & Theme Toggle -->
    <div class="flex items-center gap-4">
      <div class="flex-col text-right hidden md:block">
        <span class="text-sm font-medium text-sidebar-foreground">{{ username }}</span>
        <!-- <span class="text-xs text-gray-400">{{ authStore.userEmail }}</span> -->
      </div>
      <router-link to="/account" class="w-10 h-10 rounded-full bg-sidebar-accent border-2 border-sidebar-ring flex items-center justify-center text-sidebar-accent-foreground font-bold cursor-pointer hover:bg-accent/90 transition-colors" :title="username">
        {{ userInitial }}
      </router-link>
      <button @click="handleLogout" class="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Đăng xuất" aria-label="Sign Out">
        <LogOut class="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, nextTick } from 'vue'
import { Utensils, LogOut, ChevronDown, MonitorSmartphone, LayoutGrid, FileText } from 'lucide-vue-next'
import { useAuthStore } from '@/features/auth/store'
import { useThemeStore } from "@/shared/stores/theme";

const themeStore = useThemeStore();

const $route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

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

/**
 * Hiệu ứng lan tỏa (ripple) khi chuyển chế độ sáng/tối
 */
const toggleTheme = async (event: MouseEvent) => {
  // Kiểm tra xem trình duyệt có hỗ trợ View Transition API không
  if (!document.startViewTransition) {
    themeStore.toggleTheme()
    return
  }

  // Lấy tọa độ click
  const x = event.clientX
  const y = event.clientY
  
  // Tính toán bán kính tối đa (đường chéo màn hình từ điểm click)
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  // Bắt đầu view transition
  const transition = document.startViewTransition(async () => {
    themeStore.toggleTheme()
    // Đợi Vue cập nhật DOM
    await nextTick()
  })

  // Chờ cho transition sẵn sàng
  await transition.ready

  // Thực hiện animation clip-path
  const isDark = themeStore.isDark
  
  document.documentElement.animate(
    {
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ]
    },
    {
      duration: 500,
      easing: 'ease-in-out',
      // Nếu chuyển sang tối, animate element mới (dark)
      // Nếu chuyển sang sáng, animate element mới (light)
      pseudoElement: '::view-transition-new(root)'
    }
  )
}
</script>
