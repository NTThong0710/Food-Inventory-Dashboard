<template>
  <div class="min-h-screen bg-[#0C160A] text-white flex flex-col font-sans relative">
    <CustomerNavbar />

    <main class="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
      <div class="flex items-center gap-4 mb-10">
        <div class="w-16 h-16 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-full flex items-center justify-center text-black shadow-lg">
          <User class="w-8 h-8" />
        </div>
        <div>
          <h2 class="text-3xl font-bold flex items-center gap-3">
            {{ authStore.displayName }}
            <button @click="openEditProfile" class="text-[#4ade80] hover:text-[#22c55e] transition-colors p-1" title="Chỉnh sửa hồ sơ">
              <Pencil class="w-5 h-5" />
            </button>
          </h2>
          <p class="text-gray-400 mt-1">Khách hàng thành viên</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Bookings Column -->
        <div class="bg-[#132210] p-6 rounded-3xl border border-white/5">
          <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
            <CalendarDays class="w-6 h-6 text-[#4ade80]" />
            Lịch Sử Đặt Bàn
          </h3>

          <div v-if="isLoadingData" class="flex justify-center p-8">
            <Loader2 class="w-8 h-8 text-[#4ade80] animate-spin" />
          </div>
          
          <div v-else-if="myBookings.length === 0" class="text-center p-8 text-gray-500">
            Chưa có lượt đặt bàn nào.
          </div>
          
          <div v-else class="space-y-4">
            <div v-for="booking in myBookings" :key="booking.id" class="p-4 rounded-xl border border-white/5 bg-[#0C160A]/50 flex justify-between items-center">
              <div>
                <p class="font-bold text-white mb-1">{{ new Date(booking.booking_date).toLocaleDateString('vi-VN') }} - {{ booking.booking_time.slice(0,5) }}</p>
                <div class="flex items-center gap-4 text-sm text-gray-400">
                  <span class="flex items-center gap-1"><Users class="w-3 h-3"/> {{ booking.num_guests }} người</span>
                  <span class="flex items-center gap-1"><User class="w-3 h-3"/> {{ booking.customer_name }}</span>
                </div>
              </div>
              <div :class="getStatusClass(booking.status)" class="px-3 py-1 rounded-full text-xs font-semibold capitalize border">
                {{ translateStatus(booking.status) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Orders Column -->
        <div class="bg-[#132210] p-6 rounded-3xl border border-white/5">
          <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
            <ShoppingBag class="w-6 h-6 text-[#4ade80]" />
            Đơn Đặt Món
          </h3>

          <div v-if="isLoadingData" class="flex justify-center p-8">
            <Loader2 class="w-8 h-8 text-[#4ade80] animate-spin" />
          </div>
          
          <div v-else-if="myOrders.length === 0" class="text-center p-8 text-gray-500">
            Bạn chưa đặt món nào.
          </div>
          
          <div v-else class="space-y-4">
            <div v-for="order in myOrders" :key="order.id" class="p-4 rounded-xl border border-white/5 bg-[#0C160A]/50 flex justify-between items-center">
              <div>
                <p class="font-bold text-[#4ade80] mb-1">{{ Number(order.total_amount).toLocaleString('vi-VN') }}đ</p>
                <div class="flex items-center gap-2 text-sm text-gray-400">
                  <span>{{ new Date(order.created_at).toLocaleDateString('vi-VN') }}</span>
                  <span v-if="order.table_number">• Bàn {{ order.table_number }}</span>
                </div>
              </div>
              <div :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-xs font-semibold capitalize border">
                {{ translateStatus(order.status) }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Edit Profile Modal -->
    <Dialog 
      v-model:visible="showEditModal" 
      modal 
      header="Chỉnh sửa Hồ sơ" 
      :style="{ width: '400px' }"
      class="edit-profile-dialog"
    >
      <form @submit.prevent="handleSaveProfile" class="flex flex-col gap-4 mt-2">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Họ và Tên</label>
          <input 
            v-model="editForm.fullName" 
            type="text" 
            required
            class="w-full px-4 py-3 bg-[#0C160A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4ade80] transition-colors"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Số điện thoại</label>
          <input 
            v-model="editForm.phone" 
            type="tel" 
            class="w-full px-4 py-3 bg-[#0C160A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4ade80] transition-colors"
          />
        </div>
        <div class="flex justify-end gap-3 mt-4">
          <Button label="Hủy" text @click="showEditModal = false" class="text-gray-400" />
          <Button type="submit" label="Lưu thay đổi" :loading="isSavingProfile" class="bg-[#4ade80] text-black border-none hover:bg-[#22c55e]" />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/features/auth/store';
import { supabase } from '@/shared/lib/supabase';
import { User, CalendarDays, ShoppingBag, Loader2, Users, Pencil } from 'lucide-vue-next';
import CustomerNavbar from '../components/CustomerNavbar.vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

const authStore = useAuthStore();
const toast = useToast();
const isLoadingData = ref(true);

const myBookings = ref<any[]>([]);
const myOrders = ref<any[]>([]);

const showEditModal = ref(false);
const isSavingProfile = ref(false);
const editForm = ref({ fullName: '', phone: '' });

const openEditProfile = () => {
  editForm.value.fullName = authStore.profile?.full_name || authStore.displayName || '';
  editForm.value.phone = authStore.profile?.phone || '';
  showEditModal.value = true;
};

const handleSaveProfile = async () => {
  if (!editForm.value.fullName.trim()) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Họ tên không được để trống.', life: 3000 });
    return;
  }
  isSavingProfile.value = true;
  try {
    await authStore.updateProfile(editForm.value.fullName, editForm.value.phone);
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật hồ sơ.', life: 3000 });
    showEditModal.value = false;
  } catch(e) {
    toast.add({ severity: 'error', summary: 'Cập nhật thất bại', detail: 'Vui lòng thử lại sau.', life: 3000 });
  } finally {
    isSavingProfile.value = false;
  }
};

onMounted(async () => {
  if (authStore.user) {
    try {
      const [bookingsRes, ordersRes] = await Promise.all([
        supabase.from('bookings').select('*').eq('customer_id', authStore.user.id).neq('status', 'draft_lock').order('created_at', { ascending: false }),
        supabase.from('customer_orders').select('*').eq('customer_id', authStore.user.id).order('created_at', { ascending: false })
      ]);
      
      myBookings.value = bookingsRes.data || [];
      myOrders.value = ordersRes.data || [];
    } catch(e) {
      console.error(e);
    } finally {
      isLoadingData.value = false;
    }
  }
});

const getStatusClass = (status: string) => {
  switch(status.toLowerCase()) {
    case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
    case 'confirmed': 
    case 'preparing': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/30';
    case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/30';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
  }
};

const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang nấu',
    completed: 'Hoàn tất',
    cancelled: 'Đã hủy'
  };
  return map[status.toLowerCase()] || status;
};
</script>

<style>
.edit-profile-dialog .p-dialog-content,
.edit-profile-dialog .p-dialog-header {
  background: #132210;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
