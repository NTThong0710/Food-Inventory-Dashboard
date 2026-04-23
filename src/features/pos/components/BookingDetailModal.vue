<template>
  <!-- Booking Detail Modal -->
  <Transition name="modal">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')" />

      <!-- Panel -->
      <div class="relative bg-[#132210] border border-[#2A362C] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        <!-- Header -->
        <div class="px-6 py-4 bg-[#1A2E16] border-b border-[#2A362C] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div :class="headerIconClass" class="w-10 h-10 rounded-xl flex items-center justify-center">
              <CalendarDays class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-white text-lg">{{ table.label }}</h3>
              <p class="text-xs" :class="statusTextClass">{{ statusLabel }}</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-5">

          <!-- ── Đang phục vụ ── -->
          <div v-if="table.status === 'occupied' && table.activeOrder" class="space-y-4">
            <InfoRow icon-component="User" label="Khách hàng" :value="table.activeOrder.customer_name" />
            <InfoRow v-if="table.activeOrder.customer_phone" icon-component="Phone" label="Điện thoại" :value="table.activeOrder.customer_phone" />
            <InfoRow icon-component="Clock" label="Giờ vào" :value="formatTime(table.activeOrder.created_at)" />
            <InfoRow icon-component="Utensils" label="Tổng hóa đơn" :value="formatCurrency(table.activeOrder.total_amount)" value-class="text-[#37EC13] font-bold" />

            <div class="mt-6 pt-4 border-t border-[#2A362C] flex gap-3">
              <button
                @click="goToPos"
                class="flex-1 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-[#2e7d32] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Receipt class="w-4 h-4" /> Xem Order
              </button>
            </div>
          </div>

          <!-- ── Đã đặt trước ── -->
          <div v-else-if="table.status === 'booked' && table.todayBookings.length > 0">
            <div
              v-for="(booking, idx) in table.todayBookings"
              :key="booking.id"
              class="mb-4 p-4 rounded-xl bg-[#1A2E16] border border-[#2A362C]"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold uppercase tracking-wider text-yellow-400">
                  Đặt bàn #{{ idx + 1 }}
                </span>
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                  :class="booking.status === 'confirmed'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'"
                >
                  {{ booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận' }}
                </span>
              </div>

              <div class="space-y-2">
                <InfoRow icon-component="User" label="Khách" :value="booking.customer_name" />
                <InfoRow icon-component="Phone" label="SĐT" :value="booking.customer_phone" />
                <InfoRow icon-component="Users" label="Số người" :value="`${booking.num_guests} người`" />
                <InfoRow icon-component="Clock" label="Giờ đặt" :value="booking.booking_time?.substring(0,5) + ' - ' + booking.booking_date" />
                <InfoRow v-if="booking.special_requests" icon-component="MessageSquare" label="Ghi chú" :value="booking.special_requests" />
              </div>

              <!-- Danh sách món đã đặt trước -->
              <div v-if="booking.preordered_items && booking.preordered_items.length > 0" class="mt-4 pt-3 border-t border-[#2A362C]">
                <p class="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1.5"><Utensils class="w-3.5 h-3.5" /> Món đã gọi trước:</p>
                <div class="space-y-1.5">
                  <div v-for="(item, iIdx) in booking.preordered_items" :key="iIdx" class="flex justify-between text-sm">
                    <span class="text-gray-300"><span class="text-gray-500 mr-1">{{ item.quantity }}x</span> {{ item.name }}</span>
                    <span class="text-gray-400">{{ formatCurrency(item.price * item.quantity) }}</span>
                  </div>
                </div>
                <div class="mt-2 pt-2 border-t border-dashed border-[#2A362C] flex justify-between text-sm font-bold text-[#4ade80]">
                  <span>Tổng tiền món:</span>
                  <span>{{ formatCurrency(booking.preordered_items.reduce((acc: number, curr: any) => acc + curr.price * curr.quantity, 0)) }}</span>
                </div>
              </div>

              <!-- Assign bàn -->
              <div v-if="!booking.table_id" class="mt-3 flex items-center gap-2">
                <label class="text-xs text-gray-400 font-medium whitespace-nowrap">Gán bàn:</label>
                <select
                  v-model="assignTableId[booking.id]"
                  class="flex-1 bg-[#0C160A] border border-[#2A362C] text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#37EC13]"
                >
                  <option :value="null">-- Chọn bàn --</option>
                  <option v-for="n in 9" :key="n" :value="n">Bàn {{ n }}</option>
                </select>
                <button
                  @click="doAssign(booking.id)"
                  :disabled="!assignTableId[booking.id] || isWorking"
                  class="px-3 py-1.5 bg-[#1B5E20] hover:bg-[#37EC13] hover:text-black text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-40"
                >
                  <Check class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Action buttons -->
              <div class="mt-3 flex gap-2">
                <button
                  v-if="booking.status !== 'confirmed'"
                  @click="doConfirm(booking.id)"
                  :disabled="isWorking"
                  class="flex-1 py-2 rounded-lg bg-[#1B5E20] hover:bg-[#37EC13] hover:text-black text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Check class="w-3.5 h-3.5" /> Xác nhận
                </button>
                <button
                  v-if="booking.table_id"
                  @click="doCheckIn(booking)"
                  :disabled="isWorking"
                  class="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <LogIn class="w-3.5 h-3.5" /> Check-in
                </button>
                <button
                  @click="doCancel(booking.id)"
                  :disabled="isWorking"
                  class="py-2 px-3 rounded-lg bg-red-900/40 hover:bg-red-700/50 text-red-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- ── Trống ── -->
          <div v-else class="text-center py-8">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
              <Check class="w-8 h-8 text-green-400" />
            </div>
            <p class="text-gray-300 font-semibold">Bàn đang trống</p>
            <p class="text-sm text-gray-500 mt-1">Sức chứa: {{ table.capacity }} người</p>
            <button
              @click="goToPos"
              class="mt-5 px-6 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-[#2e7d32] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <Plus class="w-4 h-4" /> Tạo order ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { X, Check, LogIn, Plus, CalendarDays, Receipt } from 'lucide-vue-next';
import { useTableMapStore, type RestaurantTable } from '../tableMapStore';

// Simple inline component to avoid repetition
import { defineComponent, h } from 'vue';
import { User, Phone, Users, Clock, Utensils, MessageSquare } from 'lucide-vue-next';

const iconMap: Record<string, any> = { User, Phone, Users, Clock, Utensils, MessageSquare };

const InfoRow = defineComponent({
  props: {
    iconComponent: String,
    label: String,
    value: String,
    valueClass: { type: String, default: 'text-white' },
  },
  setup(props) {
    return () => h('div', { class: 'flex items-start gap-3' }, [
      h('div', { class: 'w-7 h-7 rounded-lg bg-[#0C160A] border border-[#2A362C] flex items-center justify-center flex-shrink-0 mt-0.5' }, [
        h(iconMap[props.iconComponent!] || User, { class: 'w-3.5 h-3.5 text-gray-400' })
      ]),
      h('div', {}, [
        h('p', { class: 'text-xs text-gray-500 font-medium' }, props.label),
        h('p', { class: `text-sm font-semibold ${props.valueClass}` }, props.value),
      ])
    ]);
  }
});

const props = defineProps<{ table: RestaurantTable; visible: boolean }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'checkin', order: any): void }>();

const tableMapStore = useTableMapStore();
const router = useRouter();
const toast = useToast();
const isWorking = ref(false);
const assignTableId = ref<Record<string, number | null>>({});

const statusLabel = computed(() => {
  if (props.table.status === 'occupied') return 'Đang phục vụ';
  if (props.table.status === 'booked') return `${props.table.todayBookings.length} đặt trước hôm nay`;
  return 'Trống';
});

const headerIconClass = computed(() => ({
  'bg-red-500/20 text-red-400': props.table.status === 'occupied',
  'bg-yellow-500/20 text-yellow-400': props.table.status === 'booked',
  'bg-green-500/20 text-green-400': props.table.status === 'available',
}));

const statusTextClass = computed(() => ({
  'text-red-400': props.table.status === 'occupied',
  'text-yellow-400': props.table.status === 'booked',
  'text-green-400': props.table.status === 'available',
}));

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

async function doConfirm(bookingId: string) {
  isWorking.value = true;
  try {
    await tableMapStore.confirmBooking(bookingId);
    toast.add({ severity: 'success', summary: 'Xác nhận', detail: 'Đã xác nhận đặt bàn!', life: 3000 });
  } catch { toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xác nhận.', life: 3000 }); }
  finally { isWorking.value = false; }
}

async function doAssign(bookingId: string) {
  const tid = assignTableId.value[bookingId];
  if (!tid) return;
  isWorking.value = true;
  try {
    await tableMapStore.assignTableToBooking(bookingId, tid);
    toast.add({ severity: 'success', summary: 'Thành công', detail: `Đã gán Bàn ${tid}!`, life: 3000 });
    assignTableId.value[bookingId] = null;
  } catch { toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể gán bàn.', life: 3000 }); }
  finally { isWorking.value = false; }
}

async function doCheckIn(booking: any) {
  isWorking.value = true;
  try {
    const order = await tableMapStore.checkInFromBooking(booking);
    toast.add({ severity: 'success', summary: 'Check-in', detail: `Đã tạo order cho ${booking.customer_name}!`, life: 3000 });
    emit('checkin', order);
    emit('close');
  } catch { toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể check-in.', life: 3000 }); }
  finally { isWorking.value = false; }
}

async function doCancel(bookingId: string) {
  if (!confirm('Xác nhận huỷ đặt bàn này?')) return;
  isWorking.value = true;
  try {
    await tableMapStore.cancelBooking(bookingId);
    toast.add({ severity: 'warn', summary: 'Đã huỷ', detail: 'Đặt bàn đã bị huỷ.', life: 3000 });
    emit('close');
  } catch { toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể huỷ.', life: 3000 }); }
  finally { isWorking.value = false; }
}

function goToPos() {
  emit('close');
  router.push('/pos');
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-enter-from .relative {
  transform: scale(0.9) translateY(10px);
}
.modal-leave-to .relative {
  transform: scale(0.95) translateY(5px);
}
</style>
