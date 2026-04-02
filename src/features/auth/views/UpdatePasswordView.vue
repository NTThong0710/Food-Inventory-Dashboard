<template>
  <div class="min-h-screen flex items-center justify-center bg-[#132210] p-4 text-white font-sans">
    
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
      <form v-if="!isSuccess" @submit.prevent="handleUpdate" class="space-y-6 relative z-10" novalidate>
        
        <!-- Error Message -->
        <div v-if="errorMsg" class="p-4 bg-red-900/30 border border-red-900/50 rounded-lg flex items-start gap-3 text-sm text-red-200" role="alert">
          <AlertCircle class="w-5 h-5 shrink-0 text-red-400" />
          <p>{{ errorMsg }}</p>
        </div>

        <div class="space-y-4">
          <!-- New Password -->
          <div>
            <label for="update-password" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mật khẩu mới</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-500" />
              </div>
              <input 
                id="update-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                @blur="validatePassword"
                @input="fieldErrors.password = ''"
                :class="[
                  'w-full bg-[#1B241D] border text-white rounded-lg focus:ring-2 focus:border-[#37EC13] block pl-10 pr-11 p-3 transition-colors',
                  fieldErrors.password 
                    ? 'border-red-500 focus:ring-red-500/30' 
                    : 'border-[#2A362C] focus:ring-[#37EC13]/50'
                ]"
                placeholder="••••••••"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#37EC13] transition-colors"
                :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
              >
                <Eye v-if="!showPassword" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
            <!-- Password strength indicator -->
            <div class="mt-2 space-y-1">
              <div class="flex gap-1">
                <div v-for="i in 4" :key="i" :class="['h-1 flex-1 rounded-full transition-colors duration-300', strengthBarColor(i)]"></div>
              </div>
              <p v-if="password" class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>
            </div>
            <p v-if="fieldErrors.password" class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" />
              {{ fieldErrors.password }}
            </p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="update-confirm-password" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Xác nhận mật khẩu</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheck class="h-5 w-5 text-gray-500" />
              </div>
              <input 
                id="update-confirm-password"
                v-model="confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                autocomplete="new-password"
                @blur="validateConfirm"
                @input="fieldErrors.confirm = ''"
                :class="[
                  'w-full bg-[#1B241D] border text-white rounded-lg focus:ring-2 focus:border-[#37EC13] block pl-10 pr-11 p-3 transition-colors',
                  fieldErrors.confirm 
                    ? 'border-red-500 focus:ring-red-500/30' 
                    : confirmPassword && confirmPassword === password
                      ? 'border-[#37EC13]/60 focus:ring-[#37EC13]/50'
                      : 'border-[#2A362C] focus:ring-[#37EC13]/50'
                ]"
                placeholder="••••••••"
              >
              <button
                type="button"
                @click="showConfirm = !showConfirm"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#37EC13] transition-colors"
                :aria-label="showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
              >
                <Eye v-if="!showConfirm" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
            <p v-if="fieldErrors.confirm" class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" />
              {{ fieldErrors.confirm }}
            </p>
            <p v-else-if="confirmPassword && confirmPassword === password" class="mt-1.5 text-xs text-[#37EC13] flex items-center gap-1">
              <CheckCircle class="w-3.5 h-3.5 flex-shrink-0" />
              Mật khẩu khớp
            </p>
          </div>
        </div>

        <!-- Requirements -->
        <ul class="space-y-1.5 text-xs text-gray-400 bg-[#1B241D] p-3 rounded-lg border border-[#2A362C]">
          <li :class="password.length >= 8 ? 'text-[#37EC13]' : ''" class="flex items-center gap-2 transition-colors">
            <CheckCircle v-if="password.length >= 8" class="w-3.5 h-3.5" />
            <span v-else class="w-3.5 h-3.5 rounded-full border border-gray-600 flex-shrink-0"></span>
            Ít nhất 8 ký tự
          </li>
          <li :class="hasUppercase ? 'text-[#37EC13]' : ''" class="flex items-center gap-2 transition-colors">
            <CheckCircle v-if="hasUppercase" class="w-3.5 h-3.5" />
            <span v-else class="w-3.5 h-3.5 rounded-full border border-gray-600 flex-shrink-0"></span>
            Có ít nhất 1 chữ hoa (A-Z)
          </li>
          <li :class="hasNumber ? 'text-[#37EC13]' : ''" class="flex items-center gap-2 transition-colors">
            <CheckCircle v-if="hasNumber" class="w-3.5 h-3.5" />
            <span v-else class="w-3.5 h-3.5 rounded-full border border-gray-600 flex-shrink-0"></span>
            Có ít nhất 1 chữ số (0-9)
          </li>
        </ul>

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
        <router-link to="/login" class="w-full block bg-[#37EC13] text-[#132210] font-bold py-3 px-4 rounded-lg hover:bg-green-500 focus:ring-4 focus:ring-green-500/30 transition-all text-center mt-6">
          Đi đến Đăng nhập
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { Lock, KeyRound, Loader2, AlertCircle, CheckCircle, Eye, EyeOff, ShieldCheck } from 'lucide-vue-next';
import { useAuthStore } from '@/features/auth/store';

const authStore = useAuthStore();
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirm = ref(false);
const isSubmitting = ref(false);
const errorMsg = ref('');
const isSuccess = ref(false);

const fieldErrors = reactive({
  password: '',
  confirm: '',
});

// --- Password strength ---
const hasUppercase = computed(() => /[A-Z]/.test(password.value));
const hasNumber = computed(() => /\d/.test(password.value));

const strengthScore = computed(() => {
  let score = 0;
  const p = password.value;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (hasUppercase.value) score++;
  if (hasNumber.value) score++;
  return score;
});

const strengthLabel = computed(() => {
  const s = strengthScore.value;
  if (s <= 1) return 'Yếu';
  if (s === 2) return 'Trung bình';
  if (s === 3) return 'Mạnh';
  return 'Rất mạnh';
});

const strengthTextColor = computed(() => {
  const s = strengthScore.value;
  if (s <= 1) return 'text-red-400';
  if (s === 2) return 'text-yellow-400';
  if (s === 3) return 'text-blue-400';
  return 'text-[#37EC13]';
});

function strengthBarColor(index: number): string {
  if (!password.value) return 'bg-[#2A362C]';
  const s = strengthScore.value;
  if (index > s) return 'bg-[#2A362C]';
  if (s <= 1) return 'bg-red-500';
  if (s === 2) return 'bg-yellow-500';
  if (s === 3) return 'bg-blue-500';
  return 'bg-[#37EC13]';
}

// --- Validators ---
function validatePassword(): boolean {
  if (!password.value) {
    fieldErrors.password = 'Mật khẩu không được để trống.';
    return false;
  }
  if (password.value.length < 8) {
    fieldErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
    return false;
  }
  if (!hasUppercase.value) {
    fieldErrors.password = 'Mật khẩu phải có ít nhất 1 chữ hoa.';
    return false;
  }
  if (!hasNumber.value) {
    fieldErrors.password = 'Mật khẩu phải có ít nhất 1 chữ số.';
    return false;
  }
  fieldErrors.password = '';
  return true;
}

function validateConfirm(): boolean {
  if (!confirmPassword.value) {
    fieldErrors.confirm = 'Vui lòng xác nhận mật khẩu.';
    return false;
  }
  if (confirmPassword.value !== password.value) {
    fieldErrors.confirm = 'Mật khẩu xác nhận không khớp.';
    return false;
  }
  fieldErrors.confirm = '';
  return true;
}

// --- Submit ---
const handleUpdate = async () => {
  errorMsg.value = '';
  const pwOk = validatePassword();
  const cfOk = validateConfirm();
  if (!pwOk || !cfOk) return;

  isSubmitting.value = true;
  try {
    await authStore.updatePassword(password.value);
    isSuccess.value = true;
  } catch (error: any) {
    const msg: string = error.message || '';
    if (msg.includes('expired') || msg.includes('invalid')) {
      errorMsg.value = 'Liên kết đặt lại đã hết hạn. Vui lòng yêu cầu liên kết mới.';
    } else {
      errorMsg.value = msg || 'Cập nhật mật khẩu thất bại. Vui lòng thử lại.';
    }
    console.error('Password update error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
