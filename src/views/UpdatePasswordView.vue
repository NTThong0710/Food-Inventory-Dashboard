<template>
  <div class="min-h-screen flex items-center justify-center bg-[#0C160A] p-4 text-white font-sans">
    
    <div class="w-full max-w-md bg-[#131A14] border border-[#2A362C] rounded-2xl shadow-2xl p-8 relative overflow-hidden">
      <!-- Glow effect -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#37EC13]/10 blur-[50px] pointer-events-none"></div>

      <!-- Header -->
      <div class="text-center mb-8 relative z-10">
        <div class="inline-flex justify-center items-center w-16 h-16 rounded-full bg-[#1B241D] border border-[#2A362C] shadow-inner mb-4">
          <KeyRound class="w-8 h-8 text-[#37EC13]" />
        </div>
        <h1 class="text-3xl font-black text-amber-50 tracking-wider">Cập nhật mật khẩu</h1>
        <p class="text-gray-400 text-sm mt-2">Nhập mật khẩu mới của bạn dưới đây.</p>
      </div>

      <!-- Form -->
      <form v-if="!isSuccess" @submit.prevent="handleUpdate" class="space-y-6 relative z-10">
        
        <!-- Error Message -->
        <div v-if="errorMsg" class="p-4 bg-red-900/30 border border-red-900/50 rounded-lg flex items-start gap-3 text-sm text-red-200">
          <AlertCircle class="w-5 h-5 flex-shrink-0 text-red-400" />
          <p>{{ errorMsg }}</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-400 shadow-text uppercase tracking-wider mb-2">Mật khẩu mới</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-500" />
              </div>
              <input 
                v-model="password"
                type="password" 
                required
                minlength="6"
                class="w-full bg-[#1B241D] border border-[#2A362C] text-white rounded-lg focus:ring-2 focus:ring-[#37EC13]/50 focus:border-[#37EC13] block pl-10 p-3 transition-colors" 
                placeholder="••••••••"
              >
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full bg-[#37EC13] text-[#132210] font-bold py-3 px-4 rounded-lg hover:bg-green-500 focus:ring-4 focus:ring-green-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-wait"
        >
          <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" />
          <span v-else>Lưu mật khẩu mới</span>
        </button>

      </form>

      <!-- Success Message -->
      <div v-else class="text-center space-y-6 relative z-10">
        <div class="p-4 bg-green-900/30 border border-green-900/50 rounded-lg flex flex-col items-center gap-3 text-green-200">
          <CheckCircle class="w-8 h-8 text-[#37EC13]" />
          <p class="font-medium text-lg">Cập nhật thành công</p>
          <p class="text-sm">Mật khẩu của bạn đã được cập nhật thành công.</p>
        </div>
        <router-link to="/dashboard" class="w-full block bg-[#37EC13] text-[#132210] font-bold py-3 px-4 rounded-lg hover:bg-green-500 focus:ring-4 focus:ring-green-500/30 transition-all justify-center mt-6">
          Đi đến Trang chủ
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Lock, KeyRound, Loader2, AlertCircle, CheckCircle } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const password = ref('');
const isSubmitting = ref(false);
const errorMsg = ref('');
const isSuccess = ref(false);

const handleUpdate = async () => {
  errorMsg.value = '';
  isSubmitting.value = true;
  
  try {
    // Attempt to update the password using the authStore
    await authStore.updatePassword(password.value);
    isSuccess.value = true;
  } catch (error: any) {
    errorMsg.value = error.message || 'Cập nhật mật khẩu thất bại. Liên kết của bạn có thể đã hết hạn.';
    console.error('Password update error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
