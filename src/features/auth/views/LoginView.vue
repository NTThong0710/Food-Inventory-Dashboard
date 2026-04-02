<template>
  <div class="min-h-screen flex items-center justify-center bg-[#132210] p-4 text-white font-sans">
    
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
      <form @submit.prevent="handleLogin" class="space-y-6 relative z-10" novalidate>
        
        <!-- Error Message -->
        <div v-if="errorMsg" class="p-4 bg-red-900/30 border border-red-900/50 rounded-lg flex items-start gap-3 text-sm text-red-200" aria-live="polite" role="alert">
          <AlertCircle class="w-5 h-5 flex-shrink-0 text-red-400" aria-hidden="true" />
          <p>{{ errorMsg }}</p>
        </div>

        <div class="space-y-4">
          <!-- Email Field -->
          <div>
            <label for="login-email" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Địa chỉ Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-gray-500" aria-hidden="true" />
              </div>
              <input 
                id="login-email"
                v-model.trim="email"
                type="email"
                name="email"
                autocomplete="email"
                spellcheck="false"
                @blur="validateEmail"
                @input="clearFieldError('email')"
                :class="[
                  'w-full bg-[#1B241D] border text-white rounded-lg focus:ring-2 focus:border-[#37EC13] block pl-10 p-3 transition-colors',
                  fieldErrors.email 
                    ? 'border-red-500 focus:ring-red-500/30' 
                    : 'border-[#2A362C] focus:ring-[#37EC13]/50'
                ]"
                placeholder="chef@kitchenops.com"
              >
            </div>
            <p v-if="fieldErrors.email" class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" />
              {{ fieldErrors.email }}
            </p>
          </div>

          <!-- Password Field -->
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
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="current-password"
                @blur="validatePassword"
                @input="clearFieldError('password')"
                :class="[
                  'w-full bg-[#1B241D] border text-white rounded-lg focus:ring-2 focus:border-[#37EC13] block pl-10 pr-11 p-3 transition-colors',
                  fieldErrors.password 
                    ? 'border-red-500 focus:ring-red-500/30' 
                    : 'border-[#2A362C] focus:ring-[#37EC13]/50'
                ]"
                placeholder="••••••••"
              >
              <!-- Toggle Password Visibility -->
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#37EC13] transition-colors"
                :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
              >
                <Eye v-if="!showPassword" class="h-5 w-5" aria-hidden="true" />
                <EyeOff v-else class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p v-if="fieldErrors.password" class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" />
              {{ fieldErrors.password }}
            </p>
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Utensils, Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-vue-next';
import { supabase } from '@/shared/lib/supabase';

const router = useRouter();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isSubmitting = ref(false);
const errorMsg = ref('');

const fieldErrors = reactive({
  email: '',
  password: '',
});

// --- Validators ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(): boolean {
  if (!email.value) {
    fieldErrors.email = 'Email không được để trống.';
    return false;
  }
  if (!EMAIL_REGEX.test(email.value)) {
    fieldErrors.email = 'Địa chỉ email không hợp lệ.';
    return false;
  }
  fieldErrors.email = '';
  return true;
}

function validatePassword(): boolean {
  if (!password.value) {
    fieldErrors.password = 'Mật khẩu không được để trống.';
    return false;
  }
  if (password.value.length < 6) {
    fieldErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    return false;
  }
  fieldErrors.password = '';
  return true;
}

function clearFieldError(field: 'email' | 'password') {
  fieldErrors[field] = '';
}

function validateAll(): boolean {
  const emailOk = validateEmail();
  const passwordOk = validatePassword();
  return emailOk && passwordOk;
}

// --- Submit ---
const handleLogin = async () => {
  errorMsg.value = '';

  if (!validateAll()) return;

  isSubmitting.value = true;
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) throw error;
    
    router.push('/');
    
  } catch (error: any) {
    // Map Supabase error messages to Vietnamese
    const msg: string = error.message || '';
    if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
      errorMsg.value = 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.';
    } else if (msg.includes('Email not confirmed')) {
      errorMsg.value = 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư của bạn.';
    } else if (msg.includes('Too many requests') || msg.includes('rate limit')) {
      errorMsg.value = 'Quá nhiều lần thử. Vui lòng đợi một lúc rồi thử lại.';
    } else {
      errorMsg.value = 'Đăng nhập thất bại. Vui lòng thử lại sau.';
    }
    console.error('Login error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
