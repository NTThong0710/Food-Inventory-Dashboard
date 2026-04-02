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
        <h1 class="text-3xl font-black text-amber-50 tracking-wider">Quên mật khẩu</h1>
        <p class="text-gray-400 text-sm mt-2">Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu.</p>
      </div>

      <!-- Form -->
      <form v-if="!isSuccess" @submit.prevent="handleReset" class="space-y-6 relative z-10" novalidate>
        
        <!-- Error Message -->
        <div v-if="errorMsg" class="p-4 bg-red-900/30 border border-red-900/50 rounded-lg flex items-start gap-3 text-sm text-red-200" aria-live="polite" role="alert">
          <AlertCircle class="w-5 h-5 shrink-0 text-red-400" aria-hidden="true" />
          <p>{{ errorMsg }}</p>
        </div>

        <!-- Info banner -->
        <div class="p-3 bg-blue-900/20 border border-blue-800/40 rounded-lg flex items-start gap-2 text-blue-200 text-sm">
          <Info class="w-4 h-4 shrink-0 mt-0.5 text-blue-400" aria-hidden="true" />
          <p>Liên kết đặt lại mật khẩu sẽ được gửi đến email của bạn và có hiệu lực trong <span class="font-semibold text-blue-100">60 phút</span>.</p>
        </div>

        <div class="space-y-4">
          <div>
            <label for="forgot-email" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Địa chỉ Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-gray-500" aria-hidden="true" />
              </div>
              <input 
                id="forgot-email"
                v-model.trim="email"
                type="email"
                name="email"
                autocomplete="email"
                spellcheck="false"
                @blur="validateEmail"
                @input="emailError = ''"
                :class="[
                  'w-full bg-[#1B241D] border text-white rounded-lg focus:ring-2 focus:border-[#37EC13] block pl-10 p-3 transition-colors',
                  emailError 
                    ? 'border-red-500 focus:ring-red-500/30' 
                    : 'border-[#2A362C] focus:ring-[#37EC13]/50'
                ]"
                placeholder="chef@kitchenops.com"
              >
            </div>
            <p v-if="emailError" class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" />
              {{ emailError }}
            </p>
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full bg-[#37EC13] text-[#132210] font-bold py-3 px-4 rounded-lg hover:bg-green-500 focus:ring-4 focus:ring-green-500/30 transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-wait"
        >
          <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" aria-hidden="true" />
          <template v-else>
            <Send class="w-4 h-4" aria-hidden="true" />
            <span>Gửi liên kết đặt lại</span>
          </template>
        </button>

        <div class="text-center mt-4">
          <router-link to="/login" class="text-[#37EC13] text-sm hover:underline">← Quay lại Đăng nhập</router-link>
        </div>
      </form>

      <!-- Success Message -->
      <div v-else class="text-center space-y-6 relative z-10">
        <div class="p-5 bg-green-900/30 border border-green-900/50 rounded-lg flex flex-col items-center gap-3 text-green-200">
          <div class="w-14 h-14 rounded-full bg-[#1B241D] border border-[#2A362C] flex items-center justify-center">
            <CheckCircle class="w-8 h-8 text-[#37EC13]" />
          </div>
          <p class="font-bold text-lg text-white">Kiểm tra Email của bạn!</p>
          <p class="text-sm text-gray-300 leading-relaxed">
            Chúng tôi đã gửi liên kết đặt lại mật khẩu đến:<br>
            <span class="text-white font-bold">{{ email }}</span>
          </p>
          <p class="text-xs text-gray-400 mt-1">Không tìm thấy email? Kiểm tra thư mục Spam hoặc chờ vài phút.</p>
        </div>

        <button
          @click="handleResend"
          :disabled="resendCooldown > 0 || isSubmitting"
          class="w-full border border-[#2A362C] text-gray-300 font-medium py-2.5 px-4 rounded-lg hover:bg-[#1B241D] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <template v-if="resendCooldown > 0">Gửi lại sau {{ resendCooldown }}s</template>
          <template v-else-if="isSubmitting"><Loader2 class="inline w-4 h-4 animate-spin mr-1" />Đang gửi...</template>
          <template v-else>Gửi lại email</template>
        </button>

        <router-link to="/login" class="inline-block text-[#37EC13] text-sm hover:underline">
          ← Quay lại Đăng nhập
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { Mail, KeyRound, Loader2, AlertCircle, CheckCircle, Info, Send } from 'lucide-vue-next';
import { useAuthStore } from '@/features/auth/store';

const authStore = useAuthStore();
const email = ref('');
const emailError = ref('');
const isSubmitting = ref(false);
const errorMsg = ref('');
const isSuccess = ref(false);
const resendCooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(): boolean {
  if (!email.value) {
    emailError.value = 'Email không được để trống.';
    return false;
  }
  if (!EMAIL_REGEX.test(email.value)) {
    emailError.value = 'Địa chỉ email không hợp lệ.';
    return false;
  }
  emailError.value = '';
  return true;
}

function startCooldown() {
  resendCooldown.value = 60;
  cooldownTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer!);
      cooldownTimer = null;
    }
  }, 1000);
}

async function sendReset() {
  isSubmitting.value = true;
  errorMsg.value = '';
  try {
    await authStore.sendPasswordResetEmail(email.value);
    isSuccess.value = true;
    startCooldown();
  } catch (error: any) {
    const msg: string = error.message || '';
    if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many')) {
      errorMsg.value = 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ.';
    } else {
      errorMsg.value = msg || 'Gửi email đặt lại thất bại. Vui lòng thử lại.';
    }
    console.error('Password reset error:', error);
  } finally {
    isSubmitting.value = false;
  }
}

const handleReset = async () => {
  if (!validateEmail()) return;
  await sendReset();
};

const handleResend = async () => {
  if (resendCooldown.value > 0 || isSubmitting.value) return;
  isSuccess.value = false;
  await sendReset();
};

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});
</script>
