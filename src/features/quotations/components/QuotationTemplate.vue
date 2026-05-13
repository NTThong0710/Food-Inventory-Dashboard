<template>
  <div ref="quotationRef" class="quotation-container bg-[#ffffff] text-[#000000] p-12 font-sans overflow-hidden border border-[#e5e7eb]" style="width: 800px; min-height: 1100px;">
    <!-- Header Section -->
    <div class="flex justify-between items-start mb-10 border-b-2 border-[#f3f4f6] pb-8">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-14 h-14 rounded-lg bg-[#1B5E20] flex items-center justify-center">
            <Utensils class="w-8 h-8 text-[#ffffff]" />
          </div>
          <h1 class="text-3xl font-black tracking-tight text-[#111827] uppercase">Nova<span class="text-[#1B5E20]">Resto</span></h1>
        </div>
        <p class="text-[#4b5563] text-sm max-w-xs leading-relaxed font-medium">
          123 Street Gourmet, Dist. 1, Ho Chi Minh City<br />
          Hotline: +84 (0) 900 123 456<br />
          Email: hello@kitchenops.erp
        </p>
      </div>
      <div class="text-right">
        <h2 class="text-5xl font-black text-[#1B5E20] mb-3 uppercase tracking-widest leading-none">BÁO GIÁ</h2>
        <p class="text-[#6b7280] font-bold text-lg mb-2">#BQ-{{ booking?.id?.slice(0, 8).toUpperCase() || 'NEW' }}</p>
        <p class="text-[#6b7280] text-sm font-medium">Ngày lập: <span class="text-[#111827] ml-1">{{ formatDate(new Date()) }}</span></p>
      </div>
    </div>

    <!-- Client Info -->
    <div class="grid grid-cols-2 gap-8 mb-10">
      <div class="bg-[#f9fafb] p-6 rounded-xl border border-[#f3f4f6]">
        <h3 class="text-[#1B5E20] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <User class="w-4 h-4" /> THÔNG TIN KHÁCH HÀNG
        </h3>
        <p class="text-xl font-black text-[#111827] mb-2">{{ booking?.customer_name }}</p>
        <p class="text-[#4b5563] flex items-center gap-2 mb-1 text-sm font-medium"><Phone class="w-4 h-4 text-[#9ca3af]" /> {{ booking?.customer_phone }}</p>
        <p v-if="booking?.customer_email" class="text-[#4b5563] flex items-center gap-2 text-sm font-medium"><Mail class="w-4 h-4 text-[#9ca3af]" /> {{ booking?.customer_email }}</p>
      </div>
      <div class="bg-[#f9fafb] p-6 rounded-xl border border-[#f3f4f6]">
        <h3 class="text-[#1B5E20] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <Calendar class="w-4 h-4" /> CHI TIẾT ĐẶT BÀN
        </h3>
        <p class="text-[#4b5563] mb-2 text-sm font-medium">Ngày: <span class="text-[#111827] font-bold ml-2">{{ booking?.booking_date }}</span></p>
        <p class="text-[#4b5563] mb-2 text-sm font-medium">Giờ: <span class="text-[#111827] font-bold ml-2">{{ booking?.booking_time }}</span></p>
        <p class="text-[#4b5563] text-sm font-medium">Số khách: <span class="text-[#1B5E20] font-bold ml-2">{{ booking?.num_guests }} người</span></p>
      </div>
    </div>

    <!-- Items Section -->
    <div class="mb-12">
      <h3 class="text-[#1f2937] text-sm font-black uppercase tracking-widest mb-4 pb-2 border-b-2 border-[#1f2937] flex items-center gap-2">
        <LayoutGrid class="w-4 h-4" /> CHI TIẾT THỰC ĐƠN & DỊCH VỤ
      </h3>
      
      <table class="w-full text-left border-collapse" v-if="invoiceItems.length > 0">
        <thead>
          <tr class="bg-[#f3f4f6] text-[#374151] text-xs uppercase tracking-wider font-bold">
            <th class="py-3 px-4 rounded-tl-lg">STT</th>
            <th class="py-3 px-4">Tên Món</th>
            <th class="py-3 px-4 text-right">Đơn giá</th>
            <th class="py-3 px-4 text-center">Số lượng</th>
            <th class="py-3 px-4 text-right rounded-tr-lg">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in invoiceItems" :key="index" class="border-b border-[#f3f4f6]">
            <td class="py-4 px-4 text-[#6b7280] font-medium">{{ Number(index) + 1 }}</td>
            <td class="py-4 px-4 font-bold text-[#111827]">{{ item.name }}</td>
            <td class="py-4 px-4 text-right text-[#4b5563] font-medium">{{ formatCurrency(item.price) }}</td>
            <td class="py-4 px-4 text-center font-bold text-[#374151]">{{ item.quantity }}</td>
            <td class="py-4 px-4 text-right font-black text-[#111827]">{{ formatCurrency(item.price * item.quantity) }}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Default booking fee if no order -->
      <div v-else class="bg-[#f9fafb] p-8 rounded-xl border-2 border-dashed border-[#e5e7eb] text-center">
        <p class="text-[#6b7280] text-sm font-medium mb-4">Chưa có món ăn được chọn trước. Báo giá này bao gồm phí dịch vụ giữ chỗ.</p>
        <div class="flex justify-between items-center bg-[#ffffff] p-4 rounded-lg border border-[#f3f4f6] max-w-md mx-auto">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded bg-[#e8efe9] flex items-center justify-center text-[#1B5E20]">
              <UserCheck class="w-5 h-5" />
            </div>
            <div class="text-left">
              <p class="text-[#111827] font-bold">Phí dịch vụ đặt bàn</p>
              <p class="text-xs text-[#6b7280] font-medium">Số lượng: {{ booking?.num_guests }} khách</p>
            </div>
          </div>
          <p class="text-[#1B5E20] font-black text-lg">{{ formatCurrency(booking?.num_guests * 50000) }}</p>
        </div>
      </div>
    </div>

    <!-- Summary Section -->
    <div class="flex justify-end">
      <div class="w-80">
        <div class="flex justify-between mb-3 px-4 text-sm">
          <span class="text-[#4b5563] font-medium">Tạm tính đồ ăn:</span>
          <span class="text-[#111827] font-bold">{{ formatCurrency(foodTotal) }}</span>
        </div>
        <div v-if="!hasOrder && booking?.num_guests > 0" class="flex justify-between mb-3 px-4 text-sm">
          <span class="text-[#4b5563] font-medium">Phí dịch vụ đặt bàn:</span>
          <span class="text-[#111827] font-bold">{{ formatCurrency(booking.num_guests * bookingFeeRate) }}</span>
        </div>
        <div class="flex justify-between mb-4 px-4 text-sm">
          <span class="text-[#4b5563] font-medium">Thuế (VAT 10%):</span>
          <span class="text-[#111827] font-bold">{{ formatCurrency(vatAmount) }}</span>
        </div>
        <div class="flex justify-between items-center bg-[#111827] p-5 rounded-xl text-[#ffffff]">
          <span class="font-bold uppercase tracking-wider text-sm text-[#d1d5db]">TỔNG CỘNG:</span>
          <span class="text-2xl font-black text-[#37EC13]">{{ formatCurrency(finalTotal) }}</span>
        </div>
      </div>
    </div>

    <!-- Footer Memo -->
    <div class="mt-20 pt-8 border-t-2 border-[#f3f4f6]">
      <h4 class="text-[#111827] text-sm font-black uppercase mb-3">Ghi chú & Điều khoản</h4>
      <div class="text-xs text-[#4b5563] leading-relaxed font-medium">
        <p class="mb-1">• Báo giá này có giá trị trong vòng 07 ngày kể từ ngày xuất.</p>
        <p class="mb-1">• Quý khách vui lòng đặt cọc 30% giá trị báo giá để xác nhận đơn hàng.</p>
        <p class="mb-1">• Mọi thay đổi về số lượng món ăn/khách vui lòng báo trước 04 giờ.</p>
        <p>• Cảm ơn Quý khách đã tin tưởng và sử dụng dịch vụ của NovaResto!</p>
      </div>
    </div>

    <!-- Signatures -->
    <div class="mt-16 grid grid-cols-2 gap-8 text-center">
      <div>
        <p class="font-bold text-[#111827] mb-20 uppercase text-sm">Khách hàng xác nhận</p>
        <p class="text-[#9ca3af] text-xs italic">(Ký, ghi rõ họ tên)</p>
      </div>
      <div>
        <p class="font-bold text-[#111827] mb-20 uppercase text-sm">Đại diện NovaResto</p>
        <p class="text-[#9ca3af] text-xs italic">(Ký, ghi rõ họ tên)</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Utensils, User, Phone, Mail, Calendar, LayoutGrid, UserCheck } from 'lucide-vue-next';

const props = defineProps<{
  booking: any;
  order: any;
}>();

const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const bookingFeeRate = 50000;

const hasOrder = computed(() => !!props.order);

const invoiceItems = computed(() => {
  if (props.order?.items) {
    return props.order.items.map((i: any) => ({
      name: i.dish?.name || 'Món ăn',
      price: i.price_at_time,
      quantity: i.quantity
    }));
  }
  if (props.booking?.preordered_items) {
    return props.booking.preordered_items.map((i: any) => ({
      name: i.name,
      price: i.price,
      quantity: i.quantity
    }));
  }
  return [];
});

const foodTotal = computed(() => {
  return invoiceItems.value.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
});

const subTotal = computed(() => {
  let total = foodTotal.value;
  // If not checked in (no pos order), add a booking fee
  if (!hasOrder.value && props.booking?.num_guests) {
    total += props.booking.num_guests * bookingFeeRate;
  }
  return total;
});

const vatAmount = computed(() => subTotal.value * 0.1);
const finalTotal = computed(() => subTotal.value + vatAmount.value);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.quotation-container {
  font-family: 'Inter', sans-serif;
  position: relative;
  box-sizing: border-box;
}

/* Print optimizations */
@media print {
  .quotation-container {
    box-shadow: none;
    border: none;
    border-radius: 0;
  }
}
</style>
