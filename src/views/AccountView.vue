<template>
  <div class="flex flex-col gap-6 w-full">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold text-amber-50">Cài đặt tài khoản</h2>
        <p class="text-gray-400 text-sm mt-1">Quản lý hồ sơ và cài đặt bảo mật</p>
      </div>
      <router-link to="/dashboard"
        class="px-4 py-2 bg-[#1B5E20] text-[#37EC13] border border-[#37EC13] rounded-lg hover:bg-[#2a7c2e] transition-colors text-sm font-medium"
      >
        ← Về Tổng quan
      </router-link>
    </div>

    <!-- Profile Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Card -->
      <div class="lg:col-span-1">
        <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6 flex flex-col items-center text-center">
          <div class="w-20 h-20 rounded-full bg-[#1B5E20] border-4 border-[#37EC13] flex items-center justify-center text-3xl font-bold text-[#37EC13] mb-4">
            {{ userInitial }}
          </div>
          <h3 class="text-xl font-bold text-amber-50">{{ username }}</h3>
          <p class="text-gray-400 text-sm break-all mt-1">{{ authStore.userEmail }}</p>
          <div class="mt-4 w-full h-px bg-[#2A362C]"></div>
          <div class="mt-4 w-full text-left">
            <p class="text-xs text-gray-500 uppercase font-bold">Thành viên từ</p>
            <p class="text-sm text-amber-50 mt-1">{{ memberSince }}</p>
          </div>
        </div>
      </div>

      <!-- Settings Form -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Email Info -->
        <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6">
          <h4 class="text-lg font-bold text-amber-50 mb-4">Thông tin Email</h4>
          <div class="space-y-3">
            <div>
              <label class="block text-xs text-gray-400 uppercase font-bold mb-2">Email hiện tại</label>
              <div class="w-full p-4 bg-[#0F1A10] border border-[#2A362C] rounded-lg text-amber-50 text-sm cursor-not-allowed opacity-70">
                {{ authStore.userEmail }}
              </div>
              <p class="text-xs text-gray-500 mt-2">Không thể đổi Email lúc này. Vui lòng liên hệ bộ phận hỗ trợ nếu cần.</p>
            </div>
          </div>
        </div>

        <!-- Security Section -->
        <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6">
          <h4 class="text-lg font-bold text-amber-50 mb-4">Bảo mật</h4>
          <div class="space-y-3">
            <button class="w-full px-4 py-3 bg-[#1B5E20] text-[#37EC13] border border-[#37EC13] rounded-lg hover:bg-[#2a7c2e] transition-colors font-medium text-sm"
              @click="changePassword"
            >
              Đổi mật khẩu
            </button>
            <button class="w-full px-4 py-3 bg-[#2A362C] text-gray-400 border border-[#2A362C] rounded-lg hover:bg-[#1B241D] transition-colors font-medium text-sm cursor-not-allowed opacity-50"
              disabled
            >
              Bật Xác thực hai yếu tố (Sắp ra mắt)
            </button>
          </div>
        </div>

        <!-- Preferences -->
        <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6">
          <h4 class="text-lg font-bold text-amber-50 mb-4">Tùy chọn</h4>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-amber-50">Giao diện</p>
                <p class="text-xs text-gray-400">{{ themeStore.isDark ? 'Chế độ tối' : 'Chế độ sáng' }}</p>
              </div>
              <button @click="toggleTheme"
                class="px-3 py-1.5 bg-[#1B5E20] text-[#37EC13] border border-[#37EC13] rounded-lg hover:bg-[#2a7c2e] transition-colors text-xs font-medium"
              >
                Đổi
              </button>
            </div>
            <div class="h-px bg-[#2A362C]"></div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-amber-50">Ngôn ngữ</p>
                <p class="text-xs text-gray-400">Tiếng Việt</p>
              </div>
              <span class="text-xs text-gray-500">Cố định</span>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
          <h4 class="text-lg font-bold text-red-400 mb-4">Vùng nguy hiểm</h4>
          <button class="w-full px-4 py-3 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg hover:bg-red-600/30 transition-colors font-medium text-sm"
            @click="logout"
          >
            Đăng xuất khỏi mọi thiết bị
          </button>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6 max-w-md w-full">
        <h3 class="text-xl font-bold text-amber-50 mb-4">Đổi mật khẩu</h3>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Mật khẩu mới</label>
            <input v-model="newPassword" type="password" placeholder="Nhập mật khẩu mới"
              class="w-full p-3 bg-[#0F1A10] border border-[#2A362C] text-amber-50 rounded-lg focus:outline-none focus:border-[#37EC13] transition-colors"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Xác nhận mật khẩu</label>
            <input v-model="confirmPassword" type="password" placeholder="Xác nhận mật khẩu"
              class="w-full p-3 bg-[#0F1A10] border border-[#2A362C] text-amber-50 rounded-lg focus:outline-none focus:border-[#37EC13] transition-colors"
            />
          </div>
          <p v-if="passwordError" class="text-sm text-red-400">{{ passwordError }}</p>
        </div>

        <div class="flex gap-3">
          <button @click="showPasswordModal = false"
            class="flex-1 px-4 py-2 bg-[#2A362C] text-gray-300 border border-[#2A362C] rounded-lg hover:bg-[#1B241D] transition-colors font-medium"
          >
            Hủy
          </button>
          <button @click="updatePassword"
            class="flex-1 px-4 py-2 bg-[#37EC13] text-black border border-[#37EC13] rounded-lg hover:bg-green-500 transition-colors font-medium disabled:opacity-50"
            :disabled="!newPassword || !confirmPassword"
          >
            Cập nhật mật khẩu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const showPasswordModal = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')

const username = computed(() => {
  const email = authStore.userEmail
  if (!email) return 'User'
  const name = email.split('@')[0] || ''
  return name.charAt(0).toUpperCase() + name.slice(1)
})

const userInitial = computed(() => username.value.charAt(0).toUpperCase())

const memberSince = computed(() => {
  if (!authStore.user?.created_at) return 'Unknown'
  return new Date(authStore.user.created_at).toLocaleDateString('vi-VN')
})

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const changePassword = () => {
  passwordError.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showPasswordModal.value = true
}

const updatePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Mật khẩu không khớp'
    return
  }
  if (newPassword.value.length < 6) {
    passwordError.value = 'Mật khẩu phải chứa ít nhất 6 ký tự'
    return
  }

  try {
    await authStore.updatePassword(newPassword.value)
    showPasswordModal.value = false
    alert('Cập nhật mật khẩu thành công')
  } catch (error) {
    passwordError.value = 'Cập nhật mật khẩu thất bại'
  }
}

const logout = async () => {
  if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi mọi thiết bị không?')) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>
