<template>
  <div class="min-h-screen flex items-center justify-center bg-[#132210] p-4 text-white font-sans">

    <div class="w-full max-w-md bg-[#131A14] border border-[#2A362C] rounded-2xl shadow-2xl p-8 relative overflow-hidden">
      <!-- Glow -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#37EC13]/10 blur-[50px] pointer-events-none" />

      <!-- Header -->
      <div class="text-center mb-8 relative z-10">
        <div class="inline-flex justify-center items-center w-16 h-16 rounded-full bg-[#1B241D] border border-[#2A362C] shadow-inner mb-4">
          <Utensils class="w-8 h-8 text-[#37EC13]" />
        </div>
        <h1 class="text-3xl font-black text-amber-50 uppercase tracking-wider">
          KitchenOps
        </h1>
        <p class="text-gray-400 text-sm mt-2">
          {{ isLogin ? 'Đăng nhập để quản lý không gian ẩm thực của bạn.' : 'Tạo tài khoản thành viên mới' }}
        </p>
      </div>

      <!-- Tab switcher -->
      <div v-if="!isSuccess" class="flex bg-[#0C160A] rounded-xl p-1 mb-6 relative z-10 border border-[#2A362C]">
        <button
          @click="isLogin = true"
          class="flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200"
          :class="isLogin ? 'bg-[#1B5E20] text-[#37EC13] shadow-md' : 'text-gray-500 hover:text-gray-300'"
        >
          Đăng Nhập
        </button>
        <button
          @click="isLogin = false"
          class="flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200"
          :class="!isLogin ? 'bg-[#1B5E20] text-[#37EC13] shadow-md' : 'text-gray-500 hover:text-gray-300'"
        >
          Đăng Ký
        </button>
      </div>

      <!-- Success Message For Registration -->
      <div v-if="!isLogin && isSuccess" class="relative z-10 text-center space-y-6">
        <div class="w-20 h-20 mx-auto bg-[#37EC13]/10 border border-[#37EC13]/30 rounded-full flex items-center justify-center">
          <MailCheck class="w-10 h-10 text-[#37EC13]" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-white mb-2">Đăng ký thành công!</h2>
          <p class="text-gray-400 text-sm leading-relaxed">
            Chúng tôi đã gửi một email xác thực đến địa chỉ <strong class="text-gray-200">{{ form.email }}</strong>. <br/><br/>
            Vui lòng kiểm tra hộp thư đến (hoặc thư rác) và click vào nút xác nhận để kích hoạt tài khoản của bạn.
          </p>
        </div>
        <button @click="resetToLogin" class="inline-flex items-center justify-center w-full bg-[#1B241D] hover:bg-[#2A362C] text-white border border-[#2A362C] font-bold py-3 px-4 rounded-lg transition-colors gap-2 mt-4">
          <ArrowLeft class="w-5 h-5" /> Về trang đăng nhập
        </button>
      </div>

      <!-- Error -->
      <div v-if="errorMsg && !isSuccess" class="mb-4 p-4 bg-red-900/30 border border-red-900/50 rounded-lg flex items-start gap-3 text-sm text-red-200 relative z-10">
        <AlertCircle class="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
        <p>{{ errorMsg }}</p>
      </div>

      <!-- Form -->
      <form v-if="!(!isLogin && isSuccess)" @submit.prevent="handleSubmit" class="space-y-4 relative z-10" novalidate>

        <!-- Register only fields -->
        <Transition name="slide-fade">
          <div v-if="!isLogin" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Họ và Tên <span class="text-red-400">*</span></label>
              <div class="relative">
                <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input v-model="form.fullName" type="text" required placeholder="Nguyễn Văn A"
                  class="w-full bg-[#1B241D] border border-[#2A362C] text-white rounded-lg focus:ring-2 focus:border-[#37EC13] focus:ring-[#37EC13]/30 pl-10 p-3 transition-colors" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Số điện thoại</label>
              <div class="relative">
                <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input v-model="form.phone" type="tel" placeholder="09xx..."
                  class="w-full bg-[#1B241D] border border-[#2A362C] text-white rounded-lg focus:ring-2 focus:border-[#37EC13] focus:ring-[#37EC13]/30 pl-10 p-3 transition-colors" />
              </div>
            </div>
          </div>
        </Transition>

        <!-- Email -->
        <div>
          <label for="auth-email" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Địa chỉ Email <span v-if="!isLogin" class="text-red-400">*</span></label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              id="auth-email"
              v-model.trim="form.email"
              type="email"
              autocomplete="email"
              placeholder="bancua@novaresto.com"
              @blur="validateEmail"
              @input="clearFieldError('email')"
              :class="['w-full bg-[#1B241D] border text-white rounded-lg focus:ring-2 focus:border-[#37EC13] pl-10 p-3 transition-colors',
                fieldErrors.email ? 'border-red-500 focus:ring-red-500/30' : 'border-[#2A362C] focus:ring-[#37EC13]/50']"
            />
          </div>
          <p v-if="fieldErrors.email" class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle class="w-3.5 h-3.5" /> {{ fieldErrors.email }}
          </p>
        </div>

        <!-- Password -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label for="auth-password" class="block text-xs font-bold text-gray-400 uppercase tracking-wider">Mật khẩu <span v-if="!isLogin" class="text-red-400">*</span></label>
            <router-link v-if="isLogin" to="/forgot-password" class="text-xs text-[#37EC13] hover:underline">Quên mật khẩu?</router-link>
          </div>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              id="auth-password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              @blur="validatePassword"
              @input="clearFieldError('password')"
              :class="['w-full bg-[#1B241D] border text-white rounded-lg focus:ring-2 focus:border-[#37EC13] pl-10 pr-11 p-3 transition-colors',
                fieldErrors.password ? 'border-red-500 focus:ring-red-500/30' : 'border-[#2A362C] focus:ring-[#37EC13]/50']"
            />
            <button type="button" @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#37EC13] transition-colors">
              <Eye v-if="!showPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          <p v-if="fieldErrors.password" class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle class="w-3.5 h-3.5" /> {{ fieldErrors.password }}
          </p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full bg-[#37EC13] text-[#132210] font-bold py-3 px-4 rounded-lg hover:bg-green-500 focus:ring-4 focus:ring-green-500/30 transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-wait mt-2"
        >
          <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" />
          <span v-else>{{ isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản' }}</span>
          <ArrowRight v-if="!isSubmitting" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Utensils, Mail, Lock, ArrowRight, ArrowLeft, Loader2, AlertCircle, Eye, EyeOff, User, Phone, MailCheck } from 'lucide-vue-next';
import { supabase } from '@/shared/lib/supabase';
import { useCustomerStore } from '@/features/customer/store';
import { useAuthStore } from '@/features/auth/store';

const router = useRouter();
const route = useRoute();
const customerStore = useCustomerStore();
const authStore = useAuthStore();

const isLogin = ref(true);
const isSuccess = ref(false);
const showPassword = ref(false);
const isSubmitting = ref(false);
const errorMsg = ref('');

const form = reactive({
  email: '',
  password: '',
  fullName: '',
  phone: '',
});

const fieldErrors = reactive({ email: '', password: '' });
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Reset errors on tab switch
watch(isLogin, () => {
  errorMsg.value = '';
  fieldErrors.email = '';
  fieldErrors.password = '';
  isSuccess.value = false;
});

function resetToLogin() {
  isLogin.value = true;
}

function validateEmail(): boolean {
  if (!form.email) { fieldErrors.email = 'Email không được để trống.'; return false; }
  if (!EMAIL_REGEX.test(form.email)) { fieldErrors.email = 'Địa chỉ email không hợp lệ.'; return false; }
  fieldErrors.email = ''; return true;
}
function validatePassword(): boolean {
  if (!form.password) { fieldErrors.password = 'Mật khẩu không được để trống.'; return false; }
  if (form.password.length < 6) { fieldErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.'; return false; }
  fieldErrors.password = ''; return true;
}
function clearFieldError(f: 'email' | 'password') { fieldErrors[f] = ''; }

const handleSubmit = async () => {
  errorMsg.value = '';
  if (!validateEmail() || !validatePassword()) return;

  if (!isLogin.value && !form.fullName) {
    errorMsg.value = "Vui lòng nhập Họ Tên đầy đủ.";
    return;
  }
  
  isSubmitting.value = true;
  try {
    if (isLogin.value) {
      // Admin / staff login
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) throw error;
      // Wait for authStore to load role/permissions
      await authStore.initAuthListener();
      const redirectTo = (route.query.redirect as string) || null;
      if (authStore.role === 'customer') {
        router.push(redirectTo || '/menu');
      } else {
        if (redirectTo) {
          router.push(redirectTo);
        } else if (authStore.hasPermission('dashboard_read')) {
          router.push('/dashboard');
        } else if (authStore.hasPermission('pos_read')) {
          router.push('/pos');
        } else {
          router.push('/account');
        }
      }
    } else {
      // Register new account (with the improved error handling from customerStore)
      await customerStore.register(form.email, form.password, form.fullName, form.phone);
      isSuccess.value = true;
    }
  } catch (error: any) {
    const msg: string = error.message || '';
    if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
      errorMsg.value = 'Email hoặc mật khẩu không chính xác.';
    } else if (msg.includes('Email not confirmed')) {
      errorMsg.value = 'Email chưa được xác thực. Kiểm tra hộp thư của bạn.';
    } else if (msg.includes('Email này đã được đăng ký') || msg.includes('User already registered')) {
      errorMsg.value = 'Email này đã được đăng ký. Vui lòng đăng nhập.';
    } else if (msg.includes('Too many requests') || msg.includes('rate limit')) {
      errorMsg.value = 'Quá nhiều yêu cầu. Vui lòng đợi rồi thử lại.';
    } else {
      errorMsg.value = error.message || 'Có một lỗi không xác định. Vui lòng thử lại.';
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.slide-fade-enter-active { transition: all 0.25s ease-out; }
.slide-fade-leave-active { transition: all 0.15s ease-in; }
.slide-fade-enter-from { opacity: 0; transform: translateY(-8px); }
.slide-fade-leave-to   { opacity: 0; transform: translateY(-4px); }
</style>
