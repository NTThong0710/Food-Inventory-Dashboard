<template>
  <div class="h-[calc(100vh-64px)] bg-[#0C160A] text-white flex overflow-hidden">

    <!-- ═══════════════════════════════════════════════════
         LEFT PANEL: Active orders list
    ═══════════════════════════════════════════════════ -->
    <div class="w-[330px] bg-[#132210] border-r border-[#2A362C] flex flex-col flex-shrink-0 shadow-2xl">
      <!-- Header -->
      <div class="p-4 border-b border-[#2A362C] flex justify-between items-center bg-[#1A2E16]">
        <h2 class="text-lg font-bold flex items-center gap-2 text-white">
          <LayoutDashboard class="w-5 h-5 text-[#37EC13]" />
          Phiếu Đang Phục Vụ
        </h2>
        <button
          class="w-8 h-8 rounded-lg bg-[#1B5E20] hover:bg-[#2e7d32] text-white flex items-center justify-center transition-colors shadow-sm"
          @click="showNewOrderDialog = true"
          title="Tạo order mới"
        >
          <Plus class="w-4 h-4" />
        </button>
      </div>

      <!-- Orders list -->
      <div class="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        <div
          v-for="order in posStore.activeOrders"
          :key="order.id"
          @click="posStore.selectOrder(order)"
          class="p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01]"
          :class="posStore.selectedOrder?.id === order.id
            ? 'bg-[#1B5E20]/25 border-[#37EC13] shadow-[0_0_12px_rgba(55,236,19,0.1)]'
            : 'bg-[#1A2E16] border-[#2A362C] hover:border-[#1B5E20]/50'"
        >
          <div class="flex justify-between items-start mb-1.5">
            <span class="font-bold text-white">
              {{ order.table_number ? `Bàn ${order.table_number}` : 'Sảnh' }}
            </span>
            <span
              class="text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
              :class="order.status === 'preparing'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'"
            >
              {{ order.status === 'preparing' ? 'Phục vụ' : 'Chờ món' }}
            </span>
          </div>
          <p class="text-xs text-gray-400 flex items-center gap-1 mb-2">
            <User class="w-3 h-3" /> {{ order.customer_name }}
          </p>
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500">{{ order.items?.length || 0 }} món</span>
            <span class="text-sm font-bold text-[#37EC13]">{{ formatCurrency(order.total_amount) }}</span>
          </div>
        </div>

        <div v-if="posStore.activeOrders.length === 0 && !posStore.isLoading" class="text-center py-12 text-gray-600">
          <Utensils class="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p class="text-sm">Chưa có bàn nào đang phục vụ</p>
          <button
            @click="showNewOrderDialog = true"
            class="mt-4 px-4 py-2 rounded-lg bg-[#1B5E20]/50 hover:bg-[#1B5E20] text-[#37EC13] text-xs font-bold transition-colors"
          >
            + Tạo order đầu tiên
          </button>
        </div>
        <div v-else-if="posStore.isLoading" class="text-center py-10">
          <i class="pi pi-spinner pi-spin text-[#37EC13] text-2xl"></i>
        </div>
      </div>

      <!-- Quick nav to table map -->
      <div class="p-3 border-t border-[#2A362C]">
        <router-link
          to="/table-map"
          class="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-[#2A362C] text-gray-400 hover:text-[#37EC13] hover:border-[#37EC13]/30 text-xs font-bold transition-colors"
        >
          <LayoutGrid class="w-3.5 h-3.5" /> Xem Sơ Đồ Bàn
        </router-link>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════
         RIGHT: Bill detail (or empty state)
    ═══════════════════════════════════════════════════ -->
    <div class="flex-1 flex flex-col overflow-hidden" v-if="posStore.selectedOrder">

      <!-- Bill header -->
      <div id="printable-bill" class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div class="p-5 bg-[#1A2E16] border-b border-[#2A362C] shrink-0 print:bg-white print:text-black">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-bold text-white text-xl flex items-center gap-2 print:text-black">
                <Receipt class="w-5 h-5 text-[#37EC13] print:hidden" />
                Bàn {{ posStore.selectedOrder.table_number || 'Sảnh' }}
              </h3>
              <p class="text-sm text-gray-400 mt-0.5">{{ posStore.selectedOrder.customer_name }}</p>
            </div>

            <!-- Status toggle + Add dish button -->
            <div class="flex gap-2 items-center print:hidden">
              <button
                @click="updateStatus('pending')"
                :disabled="posStore.isUpdating"
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                :class="posStore.selectedOrder.status === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#132210] text-gray-400 border border-[#2A362C] hover:border-blue-500/40'"
              >
                <Clock class="w-3.5 h-3.5 inline mr-1" />Chờ món
              </button>
              <button
                @click="updateStatus('preparing')"
                :disabled="posStore.isUpdating"
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                :class="posStore.selectedOrder.status === 'preparing'
                  ? 'bg-orange-600 text-white'
                  : 'bg-[#132210] text-gray-400 border border-[#2A362C] hover:border-orange-500/40'"
              >
                <CheckCircle class="w-3.5 h-3.5 inline mr-1" />Phục vụ
              </button>
              <!-- ADD DISH BUTTON -->
              <button
                @click="showMenuModal = true"
                :disabled="posStore.isUpdating"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#37EC13] hover:bg-[#2ecc11] text-black text-xs font-black transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Plus class="w-3.5 h-3.5" /> Thêm Món
              </button>
            </div>
          </div>
        </div>

        <!-- Items list -->
        <div class="flex-1 min-h-0 overflow-y-auto p-5 custom-scrollbar print:bg-white">
          <div v-if="!posStore.selectedOrder.items?.length" class="text-center py-14 text-gray-600 print:hidden">
            <Receipt class="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p class="text-sm mb-4">Chưa có món nào được gọi.</p>
            <button
              @click="showMenuModal = true"
              class="px-5 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-[#2e7d32] text-white text-sm font-bold transition-colors"
            >
              + Thêm Món Ăn
            </button>
          </div>

          <div
            v-for="item in posStore.selectedOrder.items"
            :key="item.id"
            class="flex items-center gap-3 bg-[#132210]/60 hover:bg-[#132210] p-3.5 rounded-xl border border-[#2A362C] mb-2.5 transition-colors print:bg-white print:border-b print:border-gray-200 print:rounded-none"
          >
            <div class="w-10 h-10 bg-[#1A2E16] rounded-lg hidden sm:flex items-center justify-center overflow-hidden border border-[#2A362C] shrink-0 print:hidden">
              <img v-if="item.dish?.image_url" :src="item.dish.image_url" class="w-full h-full object-cover opacity-80" />
              <Utensils v-else class="w-4 h-4 text-gray-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm text-white truncate print:text-black">{{ item.dish?.name }}</p>
              <p class="text-xs text-gray-500 print:text-gray-600">{{ formatCurrency(item.price_at_time) }}</p>
            </div>
            <!-- Qty stepper -->
            <div class="flex items-center gap-2 bg-[#0C160A] rounded-lg border border-[#2A362C] p-1 print:hidden">
              <button :disabled="posStore.isUpdating" class="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-[#37EC13] hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed" @click="updateQty(item, -1)">
                <Minus class="w-3.5 h-3.5" />
              </button>
              <span class="w-6 text-center font-bold text-sm text-white">{{ item.quantity }}</span>
              <button :disabled="posStore.isUpdating" class="w-6 h-6 rounded flex items-center justify-center text-[#37EC13] hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed" @click="updateQty(item, 1)">
                <Plus class="w-3.5 h-3.5" />
              </button>
            </div>
            <div class="hidden print:block font-bold text-sm">x{{ item.quantity }}</div>
            <div class="w-24 text-right font-black text-[#37EC13] text-sm print:text-black">
              {{ formatCurrency(item.price_at_time * item.quantity) }}
            </div>
          </div>
        </div>

        <!-- Checkout panel -->
        <div class="flex-shrink-0 bg-[#1A2E16] p-5 border-t border-[#2A362C] print:bg-white print:border-t-2 print:border-black">
          <div class="space-y-2 mb-4 text-sm print:text-black">
            <div class="flex justify-between text-gray-400">
              <span>Tạm tính</span>
              <span class="text-white font-medium">{{ formatCurrency(posStore.selectedOrder.total_amount) }}</span>
            </div>
            <div class="flex justify-between text-gray-400">
              <span>VAT (10%)</span>
              <span class="text-white font-medium">{{ formatCurrency(posStore.selectedOrder.total_amount * 0.1) }}</span>
            </div>
          </div>
          <div class="border-t border-dashed border-[#2A362C] mb-4 print:border-black" />
          <div class="flex justify-between items-center bg-[#132210] p-4 rounded-xl border border-[#37EC13]/20 mb-4 print:bg-gray-100">
            <span class="font-black text-sm uppercase tracking-wider text-white print:text-black">TỔNG CỘNG</span>
            <span class="text-2xl font-black text-[#37EC13] print:text-black">{{ formatCurrency(posStore.selectedOrder.total_amount * 1.1) }}</span>
          </div>
          <div class="flex gap-3 print:hidden">
            <button
              @click="printBill"
              class="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer class="w-4 h-4" /> In hóa đơn
            </button>
            <button
              @click="handleCheckout"
              :disabled="posStore.isUpdating"
              class="flex-1 py-2.5 rounded-xl bg-[#37EC13] hover:bg-[#2ecc11] text-black font-black text-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Wallet class="w-4 h-4" /> Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div class="flex-1 flex flex-col items-center justify-center bg-[#0C160A] relative" v-else>
      <div class="absolute w-125 h-125 bg-[#1B5E20]/5 rounded-full blur-[100px] pointer-events-none" />
      <div class="relative z-10 flex flex-col items-center text-center">
        <div class="w-28 h-28 rounded-full border border-[#1B5E20]/30 flex items-center justify-center bg-[#132210] mb-6 shadow-[0_0_40px_rgba(27,94,32,0.2)]">
          <Receipt class="w-11 h-11 text-[#37EC13] opacity-70" />
        </div>
        <h2 class="text-2xl font-black text-white mb-2">Hệ thống Phục Vụ</h2>
        <p class="text-gray-500 text-base max-w-xs mb-8">Chọn một phiếu từ danh sách bên trái hoặc tạo mới để bắt đầu.</p>
        <button
          @click="showNewOrderDialog = true"
          class="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B5E20] hover:bg-[#2e7d32] text-white font-bold text-sm transition-colors shadow-lg"
        >
          <Plus class="w-4 h-4" /> Tạo Order Mới
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════
         DIALOG: Create new order — with table selector
    ═══════════════════════════════════════════════════ -->
    <Dialog
      v-model:visible="showNewOrderDialog"
      header="Tạo Order Mới"
      :style="{ width: '480px' }"
      modal
      class="pos-dark-dialog"
      :pt="{
        root: 'bg-[#132210] border border-[#2A362C] rounded-2xl overflow-hidden',
        header: 'bg-[#1A2E16] text-white border-b border-[#2A362C] px-6 py-4',
        content: 'bg-[#132210] px-6 py-5',
        footer: 'bg-[#1A2E16] border-t border-[#2A362C] px-6 py-4'
      }"
    >
      <div class="flex flex-col gap-5">

        <!-- Table selector grid -->
        <div>
          <label class="block text-sm font-bold text-gray-300 mb-3">
            Chọn Bàn <span class="text-[#37EC13]">*</span>
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="t in tableSlots"
              :key="t.id"
              type="button"
              @click="selectedTableSlot = t.id"
              :disabled="t.occupied"
              class="relative flex flex-col items-center py-3 rounded-xl border text-xs font-bold transition-all duration-200"
              :class="t.occupied
                ? 'bg-red-950/20 border-red-500/20 text-red-400/50 cursor-not-allowed'
                : selectedTableSlot === t.id
                  ? 'bg-[#1B5E20]/30 border-[#37EC13] text-[#37EC13] shadow-[0_0_10px_rgba(55,236,19,0.15)]'
                  : 'bg-[#0C160A] border-[#2A362C] text-gray-400 hover:border-[#36ec1350] hover:text-gray-200 cursor-pointer'"
            >
              <!-- Occupied/Booked badge -->
              <span v-if="t.isBooked" class="absolute top-1 right-1 text-[8px] bg-orange-500/20 text-orange-400 px-1 rounded font-bold z-10 w-max">Khách đặt</span>
              <span v-else-if="t.occupied" class="absolute top-1 right-1 text-[8px] bg-red-500/20 text-red-400 px-1 rounded font-bold z-10 w-max">Đang dùng</span>
              <span class="text-xl font-black mb-0.5" :class="t.occupied ? 'opacity-40' : ''">{{ t.id }}</span>
              <span class="text-[10px] opacity-60">{{ t.capacity }} chỗ</span>
              <!-- Selected check -->
              <div v-if="selectedTableSlot === t.id && !t.occupied"
                class="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#37EC13] flex items-center justify-center">
                <svg class="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>
          <p class="text-[10px] text-gray-600 mt-2">Bàn đỏ/cam đang bận. Bàn xanh có thể tạo mới.</p>
        </div>

        <!-- Customer name with autocomplete -->
        <div>
          <label for="custName2" class="block text-sm font-bold text-gray-300 mb-1.5">Tên Khách Hàng</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              id="custName2"
              v-model="newCustomerName"
              list="past-customers-list"
              placeholder="Nhập tên hoặc chọn khách cũ..."
              @keyup.enter="createNewOrder"
              class="w-full bg-[#0C160A] border border-[#2A362C] text-white pl-10 p-3 rounded-lg focus:outline-none focus:border-[#37EC13] transition-colors text-sm"
              autocomplete="off"
            />
            <datalist id="past-customers-list">
              <option v-for="name in posStore.pastCustomers" :key="name" :value="name" />
            </datalist>
          </div>
          <p class="text-[10px] text-gray-600 mt-1.5">Để trống sẽ dùng "Khách vãng lai"</p>
        </div>
      </div>

      <template #footer>
        <Button label="Hủy" icon="pi pi-times" text @click="closeNewOrderDialog" class="text-gray-400 hover:bg-white/5" />
        <Button
          label="Bắt đầu phục vụ"
          icon="pi pi-check"
          @click="createNewOrder"
          class="bg-[#37EC13] text-black border-none font-bold"
          :loading="posStore.isUpdating"
          :disabled="!selectedTableSlot"
        />
      </template>
    </Dialog>

    <OrderMenuModal
      :visible="showMenuModal"
      :dishes="posStore.dishes"
      :table-label="posStore.selectedOrder?.table_number || 'Sảnh'"
      :current-items="posStore.selectedOrder?.items"
      @close="showMenuModal = false"
      @add="addDishToOrder"
    />

    <!-- ═══════════════════════════════════════════════════
         DIALOG: Checkout Confirmation
    ═══════════════════════════════════════════════════ -->
    <Dialog
      v-model:visible="showCheckoutConfirm"
      header="Xác nhận thanh toán"
      :style="{ width: '400px' }"
      modal
      dismissable-mask
      class="pos-dark-dialog"
      :pt="{
        root: 'bg-[#132210] border border-[#2A362C] rounded-2xl overflow-hidden',
        header: 'bg-[#1A2E16] text-white border-b border-[#2A362C] px-6 py-4',
        content: 'bg-[#132210] px-6 py-6 text-center',
        footer: 'bg-[#1A2E16] border-t border-[#2A362C] px-6 py-4 flex justify-between'
      }"
    >
      <div v-if="posStore.selectedOrder" class="py-4">
        <Wallet class="w-16 h-16 text-[#37EC13] mx-auto mb-4 opacity-80" />
        <h3 class="text-xl font-bold text-white mb-2">Thanh toán phiếu <span class="text-[#37EC13]">Bàn {{ posStore.selectedOrder.table_number || 'Sảnh' }}</span>?</h3>
        <p class="text-gray-400 mb-5 text-sm">Vui lòng kiểm tra kỹ số tiền. Hành động này không thể hoàn tác.</p>
        <div class="inline-block bg-[#1A2E16] px-6 py-4 rounded-2xl border border-[#2A362C] mb-2 shadow-inner">
          <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Tổng Tiền Cần Thu</p>
          <div class="text-4xl font-black text-[#37EC13] tracking-tighter">
            {{ formatCurrency(posStore.selectedOrder.total_amount * 1.1) }}
          </div>
        </div>
      </div>
      
      <template #footer class="">
        <div class="pt-4 flex justify-end gap-3">
          <Button label="Hủy thao tác" text @click="showCheckoutConfirm = false" class="text-gray-400 hover:text-white" />
          <Button
            label="Xác nhận thu tiền"
            icon="pi pi-check"
            @click="proceedCheckout"
            class="bg-[#37EC13] hover:bg-[#2ecc11] text-black border-none font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-[#37EC13]/20"
            :loading="posStore.isUpdating"
          />
        </div>
      </template>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePosStore } from '../store';
import { useTableMapStore } from '../tableMapStore';
import {
  LayoutDashboard, Utensils, Receipt, User, Plus, Clock,
  CheckCircle, Printer, Wallet, Minus, LayoutGrid,
} from 'lucide-vue-next';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import OrderMenuModal from '../components/OrderMenuModal.vue';

const posStore = usePosStore();
const tableMapStore = useTableMapStore();
const toast = useToast();

const showNewOrderDialog = ref(false);
const showMenuModal = ref(false);
const showCheckoutConfirm = ref(false);
const newCustomerName = ref('');
const selectedTableSlot = ref<number | null>(null);

// ── Table slots for the dialog ──────────────────────────────
const TABLE_CONFIG = [
  { id: 1, capacity: 2 }, { id: 2, capacity: 4 }, { id: 3, capacity: 4 },
  { id: 4, capacity: 6 }, { id: 5, capacity: 6 }, { id: 6, capacity: 6 },
  { id: 7, capacity: 8 }, { id: 8, capacity: 8 }, { id: 9, capacity: 10 },
];

const tableSlots = computed(() =>
  TABLE_CONFIG.map(cfg => {
    const isOccupied = posStore.activeOrders.some(o => o.table_number === String(cfg.id));
    const isBooked = tableMapStore.tables.find(t => t.id === cfg.id)?.status === 'booked';
    return {
      ...cfg,
      occupied: isOccupied || isBooked,
      isBooked: !isOccupied && isBooked
    };
  })
);

// ── Helpers ──────────────────────────────────────────────────
const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

// ── Actions ──────────────────────────────────────────────────
function closeNewOrderDialog() {
  showNewOrderDialog.value = false;
  selectedTableSlot.value = null;
  newCustomerName.value = '';
}

async function createNewOrder() {
  if (!selectedTableSlot.value) return;
  const cName = newCustomerName.value.trim() || 'Khách vãng lai';
  await posStore.createWalkinOrder(String(selectedTableSlot.value), cName);
  closeNewOrderDialog();
}

async function addDishToOrder(dish: any) {
  if (!posStore.selectedOrder) return;
  try {
    await posStore.addItemToOrder(
      posStore.selectedOrder.id,
      dish.dish_code,
      1,
      dish.selling_price || dish.price || 0
    );
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm món', life: 2000 });
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể thêm món', life: 3000 });
  }
}

async function updateQty(item: any, change: number) {
  if (!posStore.selectedOrder) return;
  try {
    const newQty = item.quantity + change;
    
    if (newQty <= 0) {
      toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Số lượng phải lớn hơn 0', life: 3000 });
      return;
    }
    
    await posStore.updateItemQuantity(item.id, posStore.selectedOrder.id, newQty);
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể cập nhật số lượng', life: 3000 });
  }
}

async function updateStatus(status: string) {
  if (!posStore.selectedOrder) return;
  try {
    await posStore.updateOrderStatus(posStore.selectedOrder.id, status);
    toast.add({ severity: 'success', summary: 'Thành công', detail: `Đã cập nhật trạng thái thành "${status === 'preparing' ? 'Phục vụ' : 'Chờ món'}"`, life: 2000 });
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể cập nhật trạng thái', life: 3000 });
  }
}

async function handleCheckout() {
  if (!posStore.selectedOrder) return;
  showCheckoutConfirm.value = true;
}

async function proceedCheckout() {
  if (!posStore.selectedOrder) return;
  try {
    showCheckoutConfirm.value = false;
    await posStore.checkoutOrder(posStore.selectedOrder.id);
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thanh toán và xuất kho thành công', life: 3000 });
  } catch (error: any) {
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi thanh toán', 
      detail: error.message || 'Có lỗi xảy ra khi thanh toán', 
      life: 5000 
    });
  }
}

const printBill = () => window.print();

onMounted(() => {
  posStore.fetchActiveOrders();
  posStore.fetchMenu();
  posStore.fetchPastCustomers();
  tableMapStore.fetchTableStatuses();
});
</script>

<style>
@media print {
  body * { visibility: hidden; }
  #printable-bill, #printable-bill * { visibility: visible; }
  #printable-bill {
    position: absolute;
    left: 0; top: 0;
    width: 300px !important;
    height: max-content;
    border: none !important;
    box-shadow: none !important;
  }
  .custom-scrollbar { overflow: visible !important; }
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #1B5E20 rgba(12, 22, 10, 0.5);
}
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(12, 22, 10, 0.5); }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #1B5E20; border-radius: 10px; }

.pos-dark-dialog .p-dialog-title { color: white !important; }
</style>
