<template>
  <div class="flex flex-col gap-6 w-full">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold text-amber-50">Account Settings</h2>
        <p class="text-gray-400 text-sm mt-1">Manage your profile and security settings</p>
      </div>
      <router-link to="/dashboard"
        class="px-4 py-2 bg-[#1B5E20] text-[#37EC13] border border-[#37EC13] rounded-lg hover:bg-[#2a7c2e] transition-colors text-sm font-medium"
      >
        ← Back to Dashboard
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
            <p class="text-xs text-gray-500 uppercase font-bold">Member Since</p>
            <p class="text-sm text-amber-50 mt-1">{{ memberSince }}</p>
          </div>
        </div>
      </div>

      <!-- Settings Form -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Email Info -->
        <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6">
          <h4 class="text-lg font-bold text-amber-50 mb-4">Email Information</h4>
          <div class="space-y-3">
            <div>
              <label class="block text-xs text-gray-400 uppercase font-bold mb-2">Current Email</label>
              <div class="w-full p-4 bg-[#0F1A10] border border-[#2A362C] rounded-lg text-amber-50 text-sm cursor-not-allowed opacity-70">
                {{ authStore.userEmail }}
              </div>
              <p class="text-xs text-gray-500 mt-2">Email cannot be changed at this time. Contact support if needed.</p>
            </div>
          </div>
        </div>

        <!-- Security Section -->
        <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6">
          <h4 class="text-lg font-bold text-amber-50 mb-4">Security</h4>
          <div class="space-y-3">
            <button class="w-full px-4 py-3 bg-[#1B5E20] text-[#37EC13] border border-[#37EC13] rounded-lg hover:bg-[#2a7c2e] transition-colors font-medium text-sm"
              @click="changePassword"
            >
              Change Password
            </button>
            <button class="w-full px-4 py-3 bg-[#2A362C] text-gray-400 border border-[#2A362C] rounded-lg hover:bg-[#1B241D] transition-colors font-medium text-sm cursor-not-allowed opacity-50"
              disabled
            >
              Enable Two-Factor Authentication (Coming Soon)
            </button>
          </div>
        </div>

        <!-- Preferences -->
        <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6">
          <h4 class="text-lg font-bold text-amber-50 mb-4">Preferences</h4>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-amber-50">Theme</p>
                <p class="text-xs text-gray-400">{{ themeStore.isDark ? 'Dark Mode' : 'Light Mode' }}</p>
              </div>
              <button @click="toggleTheme"
                class="px-3 py-1.5 bg-[#1B5E20] text-[#37EC13] border border-[#37EC13] rounded-lg hover:bg-[#2a7c2e] transition-colors text-xs font-medium"
              >
                Toggle
              </button>
            </div>
            <div class="h-px bg-[#2A362C]"></div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-amber-50">Language</p>
                <p class="text-xs text-gray-400">Vietnamese</p>
              </div>
              <span class="text-xs text-gray-500">Fixed</span>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
          <h4 class="text-lg font-bold text-red-400 mb-4">Danger Zone</h4>
          <button class="w-full px-4 py-3 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg hover:bg-red-600/30 transition-colors font-medium text-sm"
            @click="logout"
          >
            Sign Out from All Devices
          </button>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6 max-w-md w-full">
        <h3 class="text-xl font-bold text-amber-50 mb-4">Change Password</h3>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <input v-model="newPassword" type="password" placeholder="Enter new password"
              class="w-full p-3 bg-[#0F1A10] border border-[#2A362C] text-amber-50 rounded-lg focus:outline-none focus:border-[#37EC13] transition-colors"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
            <input v-model="confirmPassword" type="password" placeholder="Confirm password"
              class="w-full p-3 bg-[#0F1A10] border border-[#2A362C] text-amber-50 rounded-lg focus:outline-none focus:border-[#37EC13] transition-colors"
            />
          </div>
          <p v-if="passwordError" class="text-sm text-red-400">{{ passwordError }}</p>
        </div>

        <div class="flex gap-3">
          <button @click="showPasswordModal = false"
            class="flex-1 px-4 py-2 bg-[#2A362C] text-gray-300 border border-[#2A362C] rounded-lg hover:bg-[#1B241D] transition-colors font-medium"
          >
            Cancel
          </button>
          <button @click="updatePassword"
            class="flex-1 px-4 py-2 bg-[#37EC13] text-black border border-[#37EC13] rounded-lg hover:bg-green-500 transition-colors font-medium disabled:opacity-50"
            :disabled="!newPassword || !confirmPassword"
          >
            Update Password
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
    passwordError.value = 'Passwords do not match'
    return
  }
  if (newPassword.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }

  try {
    await authStore.updatePassword(newPassword.value)
    showPasswordModal.value = false
    alert('Password updated successfully')
  } catch (error) {
    passwordError.value = 'Failed to update password'
  }
}

const logout = async () => {
  if (confirm('Are you sure you want to sign out from all devices?')) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>
