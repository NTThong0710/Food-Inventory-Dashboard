<template>
  <div class="min-h-screen flex items-center justify-center bg-[#0C160A] p-4 text-white font-sans">
    
    <div class="w-full max-w-md bg-[#131A14] border border-[#2A362C] rounded-2xl shadow-2xl p-8 relative overflow-hidden">
      <!-- Glow effect -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#37EC13]/10 blur-[50px] pointer-events-none"></div>

      <!-- Header -->
      <div class="text-center mb-8 relative z-10">
        <div class="inline-flex justify-center items-center w-16 h-16 rounded-full bg-[#1B241D] border border-[#2A362C] shadow-inner mb-4">
          <Utensils class="w-8 h-8 text-[#37EC13]" aria-hidden="true" />
        </div>
        <h1 class="text-3xl font-black text-amber-50 uppercase tracking-wider">Kitchen<span class="text-[#37EC13]">Ops</span></h1>
        <p class="text-gray-400 text-sm mt-2">Đăng nhập để quản lý không gian làm việc ẩm thực thống nhất của bạn.</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-6 relative z-10">
        
        <!-- Error Message -->
        <div v-if="errorMsg" class="p-4 bg-red-900/30 border border-red-900/50 rounded-lg flex items-start gap-3 text-sm text-red-200" aria-live="polite">
          <AlertCircle class="w-5 h-5 flex-shrink-0 text-red-400" aria-hidden="true" />
          <p>{{ errorMsg }}</p>
        </div>

        <div class="space-y-4">
          <div>
            <label for="login-email" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Địa chỉ Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-gray-500" aria-hidden="true" />
              </div>
              <input 
                id="login-email"
                v-model="email"
                type="email"
                name="email"
                autocomplete="email"
                spellcheck="false"
                required
                class="w-full bg-[#1B241D] border border-[#2A362C] text-white rounded-lg focus:ring-2 focus:ring-[#37EC13]/50 focus:border-[#37EC13] block pl-10 p-3 transition-colors" 
                placeholder="chef@kitchenops.com"
              >
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="login-password" class="block text-xs font-bold text-gray-400 uppercase tracking-wider">Mật khẩu</label>
              <router-link to="/forgot-password" class="text-xs text-[#37EC13] hover:underline">Quên mật khẩu?</router-link>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-500" aria-hidden="true" />
              </div>
              <input 
                id="login-password"
                v-model="password"
                type="password"
                name="password"
                autocomplete="current-password"
                required 
                class="w-full bg-[#1B241D] border border-[#2A362C] text-white rounded-lg focus:ring-2 focus:ring-[#37EC13]/50 focus:border-[#37EC13] block pl-10 p-3 transition-colors" 
                placeholder="••••••••"
              >
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full bg-[#37EC13] text-[#132210] font-bold py-3 px-4 rounded-lg hover:bg-green-500 focus:ring-4 focus:ring-green-500/30 transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-wait"
        >
          <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" aria-hidden="true" />
          <span v-else>Đăng nhập</span>
          <ArrowRight v-if="!isSubmitting" class="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </button>
      </form>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Utensils, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-vue-next';
import { supabase } from '@/lib/supabase';

const router = useRouter();
const email = ref('');
const password = ref('');
const isSubmitting = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
  errorMsg.value = '';
  isSubmitting.value = true;
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) throw error;
    
    // Auth Store's onAuthStateChange listener will pick this up automatically.
    // We just need to route away from the login page.
    router.push('/');
    
  } catch (error: any) {
    errorMsg.value = error.message || 'Xác thực thất bại.';
    console.error('Login error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
