<template>
  <Transition name="slide-fade">
    <div v-if="customerStore.isCartOpen" class="fixed inset-0 z-[60] flex justify-end">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="customerStore.toggleCart"></div>
      
      <!-- Drawer -->
      <div class="relative w-full max-w-sm bg-[#0C160A] border-l border-white/10 h-full flex flex-col shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-white/5">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart class="w-5 h-5 text-[#4ade80]" />
            Đơn của bạn
          </h2>
          <button @click="customerStore.toggleCart" class="text-gray-400 hover:text-white transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-if="customerStore.cartCount === 0" class="text-center text-gray-500 py-12 flex flex-col items-center gap-4">
            <UtensilsCrossed class="w-12 h-12 opacity-20" />
            <p>Chưa có món nào được chọn.</p>
            <button @click="customerStore.toggleCart" class="text-[#4ade80] hover:text-[#22c55e] text-sm underline mt-2">
              Xem thực đơn ngay
            </button>
          </div>
          
          <div v-else v-for="item in customerStore.cart" :key="item.dish.dish_code" class="bg-[#132210] p-4 rounded-xl border border-white/5 flex gap-4 items-center">
            <img v-if="item.dish.image_url" :src="item.dish.image_url" class="w-16 h-16 object-cover rounded-lg bg-gray-800" />
            <div v-else class="w-16 h-16 bg-gray-800/50 rounded-lg flex items-center justify-center border border-white/5">
              <Utensils class="w-6 h-6 text-gray-600" />
            </div>
            
            <div class="flex-1">
              <h4 class="font-bold text-white text-sm line-clamp-1">{{ item.dish.name }}</h4>
              <p class="text-[#4ade80] font-semibold text-sm">{{ (item.dish.selling_price || item.dish.price || 0).toLocaleString('vi-VN') }}đ</p>
              
              <div class="flex items-center gap-3 mt-2">
                <button @click="customerStore.updateQuantity(item.dish.dish_code, item.quantity - 1)" :disabled="item.quantity <= 1" class="w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-[#4ade80] hover:text-black transition-colors disabled:opacity-50">
                  <Minus class="w-3 h-3" />
                </button>
                <span class="text-sm font-medium w-4 text-center">{{ item.quantity }}</span>
                <button @click="customerStore.updateQuantity(item.dish.dish_code, item.quantity + 1)" class="w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-[#4ade80] hover:text-black transition-colors">
                  <Plus class="w-3 h-3" />
                </button>
                <div class="flex-1"></div>
                <button @click="customerStore.removeFromCart(item.dish.dish_code)" class="text-red-400 hover:text-red-300 transition-colors p-1">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Checkout -->
        <div v-if="customerStore.cartCount > 0" class="p-6 border-t border-white/5 bg-[#132210]">
          <div class="flex justify-between items-center mb-6">
            <span class="text-gray-400 font-medium">Tổng cộng</span>
            <span class="text-2xl font-bold text-white">{{ customerStore.cartTotal.toLocaleString('vi-VN') }}đ</span>
          </div>

          <!-- Missing Booking Context Warning -->
          <div v-if="!customerStore.pendingReservation" class="p-4 bg-red-900/40 border border-red-500/30 rounded-xl mb-6 text-center">
            <p class="text-sm text-red-300 font-medium mb-3">Bạn chưa chọn bàn. Vui lòng đặt bàn trước khi gọi món.</p>
            <router-link to="/booking" @click="customerStore.toggleCart" class="inline-block px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-sm font-bold transition-colors">
              Quay lại Đặt Bàn
            </router-link>
          </div>

          <!-- Pending Booking Context & Countdown -->
          <div v-else class="space-y-3 mb-6 bg-[#1A2E16] p-4 flex flex-col rounded-xl border border-[#2A362C]">
            <div class="flex justify-between items-center mb-1">
              <h4 class="text-sm text-[#4ade80] font-bold uppercase tracking-wide">Thông tin Đặt Bàn</h4>
              <div class="bg-black/40 px-2 py-1 rounded text-[#4ade80] text-xs font-mono font-bold flex items-center gap-1.5 border border-[#4ade80]/20">
                <Clock class="w-3.5 h-3.5" />
                {{ formattedTimeLeft }}
              </div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">Khách hàng:</span>
              <span class="text-white font-medium">{{ customerStore.pendingReservation.customer_name }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">Thời gian:</span>
              <span class="text-white font-medium">{{ customerStore.pendingReservation.booking_time }} - {{ customerStore.pendingReservation.booking_date }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">Bàn chọn:</span>
              <span class="text-white font-medium bg-[#4ade80]/20 text-[#4ade80] px-2 py-0.5 rounded">Bàn {{ customerStore.pendingReservation.table_id }}</span>
            </div>
          </div>

          <button 
            @click="handleCheckout" 
            :disabled="isSubmitting || !customerStore.pendingReservation" 
            class="w-full py-3 px-4 bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" />
            <span v-else>Xác nhận Đặt Bàn & Gọi Món</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ShoppingCart, X, Plus, Minus, Trash2, Utensils, UtensilsCrossed, Loader2, Clock } from 'lucide-vue-next';
import { useCustomerStore } from '../store';
import { useToast } from 'primevue/usetoast';

const customerStore = useCustomerStore();
const toast = useToast();
const router = useRouter();

const isSubmitting = ref(false);

// Countdown Timer Logic
const timeLeft = ref(300); // 5 minutes in seconds
let timerInterval: any = null;

const formattedTimeLeft = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
});

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  
  const updateTimer = () => {
    if (!customerStore.pendingReservation || !customerStore.pendingReservation.created_at) {
      if (timerInterval) clearInterval(timerInterval);
      return;
    }
    
    const createdTime = new Date(customerStore.pendingReservation.created_at).getTime();
    const now = new Date().getTime();
    const elapsedSeconds = Math.floor((now - createdTime) / 1000);
    const remaining = 300 - elapsedSeconds;
    
    if (remaining <= 0) {
      clearInterval(timerInterval);
      timeLeft.value = 0;
      handleTimeout();
    } else {
      timeLeft.value = remaining;
    }
  };

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
};

const handleTimeout = async () => {
  customerStore.isCartOpen = false;
  await customerStore.cancelDraftReservation();
  toast.add({ severity: 'warn', summary: 'Hết giờ', detail: 'Đã hết 5 phút giữ bàn. Vui lòng đặt lại!', life: 5000 });
  router.push('/booking');
};

watch(() => customerStore.isCartOpen, (isOpen) => {
  if (isOpen && customerStore.pendingReservation) {
    startTimer();
  }
});

onMounted(() => {
  if (customerStore.isCartOpen && customerStore.pendingReservation) {
    startTimer();
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const handleCheckout = async () => {
  if (!customerStore.pendingReservation) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Chưa có thông tin đặt bàn.', life: 3000 });
     return;
  }
  
  isSubmitting.value = true;

  try {
    const success = await customerStore.submitUnifiedReservation();
    if (success) {
      if (timerInterval) clearInterval(timerInterval);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Yêu cầu Đặt bàn & Gọi món đã được gửi tới hệ thống!', life: 4000 });
      // Redirect handled or state cleared already
    }
  } catch(e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể gửi yêu cầu', life: 5000 });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-from .relative,
.slide-fade-leave-to .relative {
  transform: translateX(100%);
}
</style>
