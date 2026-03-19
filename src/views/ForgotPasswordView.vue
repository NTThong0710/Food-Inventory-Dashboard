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
        <h1 class="text-3xl font-black text-amber-50 tracking-wider">Forgot Password</h1>
        <p class="text-gray-400 text-sm mt-2">Enter your email address to receive a password reset link.</p>
      </div>

      <!-- Form -->
      <form v-if="!isSuccess" @submit.prevent="handleReset" class="space-y-6 relative z-10">
        
        <!-- Error Message -->
        <div v-if="errorMsg" class="p-4 bg-red-900/30 border border-red-900/50 rounded-lg flex items-start gap-3 text-sm text-red-200" aria-live="polite">
          <AlertCircle class="w-5 h-5 shrink-0 text-red-400" aria-hidden="true" />
          <p>{{ errorMsg }}</p>
        </div>

        <div class="space-y-4">
          <div>
            <label for="forgot-email" class="block text-xs font-bold text-gray-400 shadow-text uppercase tracking-wider mb-2">Email Address</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-gray-500" aria-hidden="true" />
              </div>
              <input 
                id="forgot-email"
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
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full bg-[#37EC13] text-[#132210] font-bold py-3 px-4 rounded-lg hover:bg-green-500 focus:ring-4 focus:ring-green-500/30 transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-wait"
        >
          <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" aria-hidden="true" />
          <span v-else>Send Reset Link</span>
        </button>

        <div class="text-center mt-4">
          <router-link to="/login" class="text-[#37EC13] text-sm hover:underline">Return to Login</router-link>
        </div>
      </form>

      <!-- Success Message -->
      <div v-else class="text-center space-y-6 relative z-10">
        <div class="p-4 bg-green-900/30 border border-green-900/50 rounded-lg flex flex-col items-center gap-3 text-green-200">
          <CheckCircle class="w-8 h-8 text-[#37EC13]" />
          <p class="font-medium text-lg">Check Your Email</p>
          <p class="text-sm">We've sent a password reset link to <br> <span class="text-white font-bold">{{ email }}</span></p>
        </div>
        <router-link to="/login" class="inline-block mt-4 text-[#37EC13] text-sm hover:underline">
          Return to Login
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Mail, KeyRound, Loader2, AlertCircle, CheckCircle } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const email = ref('');
const isSubmitting = ref(false);
const errorMsg = ref('');
const isSuccess = ref(false);

const handleReset = async () => {
  errorMsg.value = '';
  isSubmitting.value = true;
  
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      throw new Error('Please enter a valid email address.');
    }

    await authStore.sendPasswordResetEmail(email.value);
    isSuccess.value = true;
  } catch (error: any) {
    const message = error.message || 'Failed to send reset email. Please try again.';
    errorMsg.value = message;
    
    // Log for debugging
    console.error('Password reset error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
