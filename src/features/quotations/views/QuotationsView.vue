<template>
  <div class="p-6 bg-[#0C160A] min-h-screen">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white flex items-center gap-3">
          <Receipt class="w-8 h-8 text-[#37EC13]" /> Quản lý Báo giá & Đặt bàn
        </h1>
        <p class="text-gray-400 mt-1">Quản lý các yêu cầu đặt bàn và xuất báo giá PDF cho khách hàng.</p>
      </div>
      <div class="flex gap-3">
        <Button 
          @click="quotationStore.fetchBookings()" 
          class="bg-[#1B5E20] text-white border-none hover:bg-[#253D1F] px-4 py-2 font-medium flex items-center gap-2 rounded-lg" 
          :loading="quotationStore.isLoading"
        >
          <RefreshCw class="w-4 h-4" /> Làm mới
        </Button>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-[#132210] p-6 rounded-2xl border border-[#1B5E20]/20 flex items-center gap-6">
        <div class="w-14 h-14 rounded-xl bg-[#1B5E20]/20 flex items-center justify-center text-[#37EC13]">
          <CalendarDays class="w-8 h-8" />
        </div>
        <div>
          <p class="text-gray-400 text-sm font-medium">Tổng đặt bàn</p>
          <p class="text-2xl font-bold text-white">{{ quotationStore.bookings.length }}</p>
        </div>
      </div>
      <div class="bg-[#132210] p-6 rounded-2xl border border-[#1B5E20]/20 flex items-center gap-6">
        <div class="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
          <Clock class="w-8 h-8" />
        </div>
        <div>
          <p class="text-gray-400 text-sm font-medium">Chờ xác nhận</p>
          <p class="text-2xl font-bold text-white">{{ pendingBookings }}</p>
        </div>
      </div>
      <div class="bg-[#132210] p-6 rounded-2xl border border-[#1B5E20]/20 flex items-center gap-6">
        <div class="w-14 h-14 rounded-xl bg-[#37EC13]/10 flex items-center justify-center text-[#37EC13]">
          <CheckCircle2 class="w-8 h-8" />
        </div>
        <div>
          <p class="text-gray-400 text-sm font-medium">Đã hoàn tất</p>
          <p class="text-2xl font-bold text-white">{{ completedBookings }}</p>
        </div>
      </div>
    </div>

    <!-- Bookings Table -->
    <div class="bg-[#132210] rounded-2xl border border-[#1B5E20]/10 shadow-xl overflow-hidden">
      <DataTable 
        :value="quotationStore.bookings" 
        :loading="quotationStore.isLoading"
        paginator :rows="10" 
        class="p-datatable-custom"
        responsiveLayout="stack" 
        breakpoint="960px"
      >
        <template #empty>
          <div class="py-12 text-center">
            <div class="text-gray-500 mb-2">Không tìm thấy dữ liệu đặt bàn</div>
          </div>
        </template>

        <Column field="customer_name" header="Khách hàng" sortable>
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="font-bold text-white">{{ data.customer_name }}</span>
              <span class="text-xs text-gray-500 flex items-center gap-1"><Phone class="w-3 h-3"/> {{ data.customer_phone }}</span>
            </div>
          </template>
        </Column>

        <Column field="booking_date" header="Thời gian" sortable>
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="text-gray-200">{{ data.booking_date }}</span>
              <span class="text-xs font-bold text-[#37EC13]">{{ data.booking_time }}</span>
            </div>
          </template>
        </Column>

        <Column field="num_guests" header="Số khách" sortable>
          <template #body="{ data }">
            <Tag :value="data.num_guests + ' Khách'" severity="success" class="bg-[#1B5E20]/30 text-[#37EC13] border border-[#1B5E20]/50" />
          </template>
        </Column>

        <Column field="status" header="Trạng thái">
          <template #body="{ data }">
            <span v-if="data.status?.toLowerCase() === 'completed'" class="px-3 py-1 bg-[#37EC13]/10 text-[#37EC13] border border-[#37EC13]/20 rounded-md text-xs font-bold uppercase tracking-wider">Đã hoàn tất</span>
            <span v-else-if="data.status?.toLowerCase() === 'cancelled'" class="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-xs font-bold uppercase tracking-wider">Đã hủy</span>
            <span v-else class="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-md text-xs font-bold uppercase tracking-wider">Chờ xác nhận</span>
          </template>
        </Column>

        <Column header="Hành động" class="text-right">
          <template #body="{ data }">
            <div class="flex gap-2 justify-end">
              <Button 
                v-tooltip.top="'Xem trước Báo giá'"
                class="p-button-rounded p-button-text hover:bg-[#1B5E20]/20 w-10 h-10 flex items-center justify-center p-0"
                :class="isOpeningPreview && selectedBooking?.id === data.id ? 'text-gray-400' : 'text-[#37EC13]'" 
                :loading="isOpeningPreview && selectedBooking?.id === data.id"
                @click="openPreview(data)"
              >
                <i v-if="isOpeningPreview && selectedBooking?.id === data.id" class="pi pi-spinner pi-spin"></i>
                <Eye v-else class="w-5 h-5" />
              </Button>
              <!-- Nút Xác nhận -->
              <Button 
                v-if="data.status?.toLowerCase() === 'pending'"
                v-tooltip.top="'Xác nhận'"
                class="p-button-rounded p-button-text text-blue-400 hover:bg-blue-500/20 w-10 h-10 flex items-center justify-center p-0" 
                @click="quotationStore.updateBookingStatus(data.id, 'confirmed')"
              >
                <Check class="w-5 h-5" />
              </Button>

              <!-- Nút Hoàn tất (check-in) -->
              <Button 
                v-if="data.status?.toLowerCase() === 'confirmed'"
                v-tooltip.top="'Hoàn tất (Check-in)'"
                class="p-button-rounded p-button-text text-[#37EC13] hover:bg-[#1B5E20]/20 w-10 h-10 flex items-center justify-center p-0" 
                @click="quotationStore.updateBookingStatus(data.id, 'completed')"
              >
                <CheckCircle2 class="w-5 h-5" />
              </Button>

              <!-- Nút Từ chối / Hủy -->
              <Button 
                v-if="data.status?.toLowerCase() === 'pending' || data.status?.toLowerCase() === 'confirmed'"
                v-tooltip.top="'Từ chối / Hủy'"
                class="p-button-rounded p-button-text text-red-500 hover:bg-red-500/20 w-10 h-10 flex items-center justify-center p-0" 
                @click="quotationStore.updateBookingStatus(data.id, 'cancelled')"
              >
                <X class="w-5 h-5" />
              </Button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Preview Modal -->
    <QuotationPreviewModal 
      v-model:visible="isPreviewVisible"
      :booking="selectedBooking"
      :order="selectedOrder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuotationStore } from '../store';
import { Receipt, CalendarDays, Clock, CheckCircle2, Phone, RefreshCw, Eye, Check, X } from 'lucide-vue-next';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import QuotationPreviewModal from '../components/QuotationPreviewModal.vue';

const quotationStore = useQuotationStore();

const isPreviewVisible = ref(false);
const isOpeningPreview = ref(false);
const selectedBooking = ref<any>(null);
const selectedOrder = ref<any>(null);

const pendingBookings = computed(() => quotationStore.bookings.filter(b => b.status === 'pending' || !b.status).length);
const completedBookings = computed(() => quotationStore.bookings.filter(b => b.status === 'completed').length);

const openPreview = async (booking: any) => {
  if (isOpeningPreview.value) return;
  
  selectedBooking.value = booking;
  selectedOrder.value = null; // Reset
  
  if (booking.customer_id && booking.status === 'completed') {
    isOpeningPreview.value = true;
    try {
      // Try to fetch order for customer
      const order = await quotationStore.fetchOrderForCustomer(booking.customer_id);
      selectedOrder.value = order;
    } finally {
      isOpeningPreview.value = false;
    }
  }
  
  isPreviewVisible.value = true;
};

onMounted(() => {
  quotationStore.fetchBookings();
});
</script>

<style>
.p-datatable-custom .p-datatable-thead > tr > th {
  background: #1A2E16;
  color: #gray-400;
  border-bottom: 1px solid #2A362C;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.p-datatable-custom .p-datatable-tbody > tr {
  background: transparent;
  color: white;
  border-bottom: 1px solid rgba(42, 54, 44, 0.5);
  transition: background 0.2s;
}

.p-datatable-custom .p-datatable-tbody > tr:hover {
  background: rgba(27, 94, 32, 0.1);
}

.p-datatable-custom .p-paginator {
  background: #1A2E16;
  border-top: 1px solid #2A362C;
}
</style>
