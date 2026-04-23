<template>
  <div class="min-h-screen bg-[#0C160A] text-white flex flex-col font-sans relative overflow-x-hidden">
    <div class="absolute inset-x-0 top-0 h-[50vh] bg-[#132210] pointer-events-none -skew-y-3 transform origin-top-left -translate-y-10"></div>
    
    <CustomerNavbar />

    <main class="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-24 mt-8">
      
      <!-- Left side: Text/Info -->
      <div class="flex-1 flex flex-col justify-center">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#132210] border border-[#22c55e]/20 mb-6 w-max">
          <CalendarDays class="w-4 h-4 text-[#4ade80]" />
          <span class="text-xs font-semibold uppercase tracking-widest text-[#86efac]">Reservation</span>
        </div>
        
        <h2 class="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-8 leading-tight">
          Đặt Bàn <br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#4ade80] to-[#22c55e]">Trải Nghiệm</span>
        </h2>
        
        <p class="text-gray-400 text-lg mb-10 leading-relaxed max-w-lg">
          Hãy để hệ thống giữ cho bạn một chỗ ngồi lý tưởng. Vui lòng đặt bàn trước ít nhất 2 giờ để chúng tôi có sự chuẩn bị chu đáo nhất cho trải nghiệm ẩm thực của bạn.
        </p>
        
        <div class="grid grid-cols-2 gap-6 max-w-md">
          <div class="bg-[#132210] p-5 rounded-2xl border border-white/5">
            <Clock class="w-6 h-6 text-[#4ade80] mb-3" />
            <h4 class="font-bold mb-1">Giờ Mở Cửa</h4>
            <p class="text-sm text-gray-400">10:00 - 22:30<br/>Cả tuần</p>
          </div>
          <div class="bg-[#132210] p-5 rounded-2xl border border-white/5">
            <MapPin class="w-6 h-6 text-[#4ade80] mb-3" />
            <h4 class="font-bold mb-1">Địa Chỉ</h4>
            <p class="text-sm text-gray-400">123 Nguyễn Văn Cừ<br/>Quận 5, TP.HCM</p>
          </div>
        </div>
      </div>

      <!-- Right side: Form -->
      <div class="flex-1 max-w-lg w-full">
        <div class="bg-[#132210]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h3 class="text-2xl font-bold mb-6">Thông Tin Đặt Bàn</h3>
          
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1.5">Họ và Tên *</label>
              <div class="relative">
                <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input v-model="form.customer_name" required type="text" placeholder="Nguyễn Văn A" class="w-full pl-12 pr-4 py-3 bg-[#0C160A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4ade80] transition-colors" />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1.5">Số điện thoại *</label>
                <div class="relative">
                  <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input v-model="form.customer_phone" required type="tel" placeholder="090..." class="w-full pl-12 pr-4 py-3 bg-[#0C160A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4ade80] transition-colors" />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1.5">Số người *</label>
                <div class="relative">
                  <Users class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input v-model="form.num_guests" required type="number" min="1" class="w-full pl-12 pr-4 py-3 bg-[#0C160A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4ade80] transition-colors" />
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1.5">Ngày *</label>
                <input v-model="form.booking_date" required type="date" :min="minDate" class="w-full px-4 py-3 bg-[#0C160A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4ade80] transition-colors" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1.5">Giờ *</label>
                <input v-model="form.booking_time" required type="time" class="w-full px-4 py-3 bg-[#0C160A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4ade80] transition-colors" />
              </div>
            </div>

            <!-- Chọn số bàn -->
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Chọn Bàn * <span v-if="isCheckingAvailability" class="text-[#4ade80] text-xs ml-2 animate-pulse">(Đang kiểm tra...)</span></label>
              <div class="grid grid-cols-3 gap-2 mb-1">
                <button
                  v-for="t in tableOptions"
                  :key="t.id"
                  type="button"
                  @click="!t.isBooked && (form.table_id = form.table_id === t.id ? null : t.id)"
                  :disabled="t.isBooked"
                  class="relative flex flex-col items-center py-2.5 px-2 rounded-xl border text-xs font-bold transition-all duration-200"
                  :class="[
                    t.isBooked ? 'bg-red-900/20 border-red-500/20 text-red-500/50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer',
                    form.table_id === t.id && !t.isBooked
                      ? 'bg-[#4ade80]/15 border-[#4ade80] text-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.2)]'
                      : !t.isBooked ? 'bg-[#0C160A] border-white/10 text-gray-400 hover:border-white/25' : ''
                  ]"
                >
                  <span class="text-base font-black">{{ t.id }}</span>
                  <span class="text-[9px] font-normal mt-0.5 opacity-70">{{ t.capacity }} chỗ</span>
                  <div v-if="form.table_id === t.id"
                    class="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#4ade80] flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div v-if="t.isBooked" class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-[1px]">
                    <span class="text-[10px] text-red-400">Đã đặt</span>
                  </div>
                </button>
              </div>
              <p class="text-[10px] text-gray-500 mt-1">Bắt buộc phải chọn 1 bàn trống trước khi gọi món.</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1.5">Yêu cầu đặc biệt (không bắt buộc)</label>
              <textarea v-model="form.special_requests" rows="2" placeholder="Ghi chú về dị ứng, vị trí bàn..." class="w-full px-4 py-3 bg-[#0C160A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4ade80] transition-colors resize-none"></textarea>
            </div>
            
            <button type="submit" :disabled="isSubmitting" class="w-full py-4 mt-2 bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold text-lg rounded-xl flex items-center justify-center gap-2 transition-transform transform hover:-translate-y-0.5 shadow-[0_0_15px_rgba(74,222,128,0.2)] disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
              <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" />
              <template v-else>
                <span>Đăng Ký Bàn & Tiếp Tục Chọn Món</span>
                <ArrowRight class="w-5 h-5 ml-1" />
              </template>
            </button>
          </form>

        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { CalendarDays, Clock, MapPin, User, Phone, Users, ArrowRight } from 'lucide-vue-next';
import CustomerNavbar from '../components/CustomerNavbar.vue';
import { useCustomerStore } from '../store';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/shared/lib/supabase';

const customerStore = useCustomerStore();
const router = useRouter();
const toast = useToast();

const isCheckingAvailability = ref(false);
const isSubmitting = ref(false);

const tableOptions = ref([
  { id: 1, capacity: 2, isBooked: false }, { id: 2, capacity: 4, isBooked: false }, { id: 3, capacity: 4, isBooked: false },
  { id: 4, capacity: 6, isBooked: false }, { id: 5, capacity: 6, isBooked: false }, { id: 6, capacity: 6, isBooked: false },
  { id: 7, capacity: 8, isBooked: false }, { id: 8, capacity: 8, isBooked: false }, { id: 9, capacity: 10, isBooked: false },
]);

const form = reactive({
  customer_name: '',
  customer_phone: '',
  num_guests: 2,
  booking_date: '',
  booking_time: '18:00',
  special_requests: '',
  table_id: null as number | null,
});

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const minDate = `${year}-${month}-${day}`;

const fetchAvailability = async () => {
  if (!form.booking_date || !form.booking_time) return;
  isCheckingAvailability.value = true;
  
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('table_id, booking_time, status, created_at')
      .eq('booking_date', form.booking_date)
      .neq('status', 'cancelled')
      .neq('status', 'completed');
      
    if (error) {
      console.error('Error fetching bookings:', error);
      return;
    }

    // A table is considered booked if there is a booking within +/- 2 hours
    const targetTime = new Date(`1970-01-01T${form.booking_time}`);
    
    tableOptions.value.forEach(t => {
      t.isBooked = false; // reset
      if (bookings) {
        for (const b of bookings) {
          // If the booking is a draft lock, check if it has expired (5 minutes)
          if (b.status === 'draft_lock') {
             const createdTime = new Date(b.created_at).getTime();
             const now = new Date().getTime();
             // If more than 5 minutes have passed, ignore this lock
             if (now - createdTime > 5 * 60 * 1000) {
               continue;
             }
          }

          if (b.table_id === t.id && b.booking_time) {
            const bTime = new Date(`1970-01-01T${b.booking_time}`);
            const diffInHours = Math.abs(targetTime.getTime() - bTime.getTime()) / (1000 * 60 * 60);
            if (diffInHours < 2) {
              t.isBooked = true;
              break;
            }
          }
        }
      }
    });
    
    // If currently selected table becomes booked, unselect it
    if (form.table_id) {
       const selected = tableOptions.value.find(t => t.id === form.table_id);
       if (selected && selected.isBooked) {
         form.table_id = null;
         toast.add({ severity: 'warn', summary: 'Bàn đã bị đặt', detail: 'Bàn bạn chọn không còn trống ở khung giờ này.', life: 3000 });
       }
    }
    
  } finally {
    isCheckingAvailability.value = false;
  }
};

watch(() => form.booking_date, fetchAvailability);
watch(() => form.booking_time, fetchAvailability);

onMounted(() => {
  fetchAvailability();
});

const handleSubmit = async () => {
  // Validate table selection
  if (!form.table_id) {
    toast.add({ severity: 'warn', summary: 'Chưa chọn bàn', detail: 'Vui lòng chọn một bàn trống trước khi gọi món!', life: 4000 });
    return;
  }

  // Validate time if booking today
  if (form.booking_date === minDate) {
    const selectedTimeStr = form.booking_time; // HH:mm
    const now = new Date();
    // Add 1 hour buffer for same day booking
    const minHours = now.getHours() + 1;
    const minMinutes = now.getMinutes();
    
    const [selHoursRaw, selMinsRaw] = selectedTimeStr.split(':').map(Number);
    const selHours = selHoursRaw ?? 0;
    const selMins = selMinsRaw ?? 0;
    if (selHours < minHours || (selHours === minHours && selMins < minMinutes)) {
      toast.add({ severity: 'error', summary: 'Lỗi thời gian', detail: 'Vui lòng chọn thời gian đặt bàn sau ít nhất 1 tiếng kể từ hiện tại!', life: 4000 });
      return;
    }
  }

  isSubmitting.value = true;
  try {
    // 1. Insert a draft_lock reservation to hold the table
    await customerStore.createDraftReservation({ ...form });
    // 2. Head to menu
    router.push('/menu');
    toast.add({ severity: 'info', summary: 'Giữ bàn', detail: 'Bàn của bạn sẽ được giữ trong 5 phút. Vui lòng chọn món thanh toán.', life: 4000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể giữ chỗ lúc này. Vui lòng thử lại sau.', life: 4000 });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* style override for date/time inputs in dark mode */
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
}
</style>
