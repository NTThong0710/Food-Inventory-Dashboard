<template>
  <div class="min-h-[calc(100vh-64px)] bg-[#0C160A] text-white">
    <!-- Hero Header -->
    <div class="bg-[#132210] border-b border-[#2A362C] px-8 py-6">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
        <!-- Title -->
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-1">
            <div class="w-9 h-9 rounded-xl bg-[#1B5E20] border border-[#37EC13]/30 flex items-center justify-center shadow-[0_0_12px_rgba(55,236,19,0.2)]">
              <LayoutGrid class="w-5 h-5 text-[#37EC13]" />
            </div>
            <h1 class="text-2xl font-black text-white tracking-tight">Sơ Đồ Bàn</h1>
          </div>
          <p class="text-gray-400 text-sm ml-12">
            {{ today }} &nbsp;•&nbsp; Cập nhật lúc {{ lastUpdated }}
          </p>
        </div>

        <!-- Stats chips -->
        <div class="flex items-center gap-3">
          <StatChip color="green" :count="tableMapStore.availableCount" label="Trống" />
          <StatChip color="yellow" :count="tableMapStore.bookedCount" label="Đã đặt" />
          <StatChip color="red" :count="tableMapStore.occupiedCount" label="Đang dùng" />

          <!-- Refresh -->
          <button
            @click="refresh"
            :class="{ 'animate-spin': tableMapStore.isLoading }"
            class="w-9 h-9 rounded-xl bg-[#1A2E16] border border-[#2A362C] flex items-center justify-center text-gray-400 hover:text-[#37EC13] hover:border-[#37EC13]/40 transition-all ml-2"
            title="Làm mới"
          >
            <RefreshCw class="w-4 h-4" />
          </button>

          <!-- Go to POS -->
          <router-link
            to="/pos"
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B5E20] hover:bg-[#2e7d32] text-white text-sm font-bold transition-colors shadow-md"
          >
            <MonitorSmartphone class="w-4 h-4" /> POS
          </router-link>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-8 py-8">

      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 text-xs text-gray-500">
        <LegendItem color="green" label="Trống — Chưa có lịch" />
        <LegendItem color="cyan" label="Đang giữ chỗ (5 phút)" />
        <LegendItem color="yellow" label="Đã đặt trước hôm nay" />
        <LegendItem color="red" label="Đang phục vụ khách" />
        <div class="ml-auto text-gray-600 hidden sm:block">Nhấn vào bàn để xem chi tiết</div>
      </div>

      <!-- Loading State -->
      <div v-if="tableMapStore.isLoading && tableMapStore.tables.length === 0"
        class="grid grid-cols-3 gap-5">
        <div v-for="n in 9" :key="n"
          class="h-44 bg-[#132210] border-2 border-[#2A362C] rounded-2xl animate-pulse" />
      </div>

      <!-- Error State -->
      <div v-else-if="tableMapStore.error"
        class="text-center py-20 text-red-400">
        <AlertCircle class="w-12 h-12 mx-auto mb-3 opacity-60" />
        <p class="font-bold">Lỗi tải dữ liệu</p>
        <p class="text-sm text-red-400/70 mt-1">{{ tableMapStore.error }}</p>
        <button @click="refresh" class="mt-4 px-5 py-2 rounded-lg bg-red-900/30 hover:bg-red-800/40 text-red-300 text-sm font-bold transition-colors">
          Thử lại
        </button>
      </div>

      <!-- Table Grid -->
      <TableMap
        v-else
        :tables="tableMapStore.tables"
        @select="openModal"
      />

      <!-- Unassigned bookings banner -->
      <div v-if="unassignedBookings.length > 0"
        class="mt-8 p-5 rounded-2xl bg-yellow-900/20 border border-yellow-500/30">
        <div class="flex items-start gap-3">
          <AlertCircle class="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="text-yellow-300 font-bold text-sm">
              {{ unassignedBookings.length }} đặt bàn hôm nay chưa được gán số bàn
            </p>
            <p class="text-yellow-500/70 text-xs mt-1">
              Vào từng bàn để xác nhận và gán bàn phù hợp cho khách.
            </p>
          </div>
          <router-link to="/quotations"
            class="text-yellow-400 text-xs font-bold hover:underline whitespace-nowrap">
            Xem tất cả →
          </router-link>
        </div>
      </div>

    </div>

    <!-- Detail Modal -->
    <BookingDetailModal
      v-if="selectedTable"
      :table="selectedTable"
      :visible="showModal"
      @close="closeModal"
      @checkin="onCheckin"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineComponent, h } from 'vue';
import { LayoutGrid, RefreshCw, MonitorSmartphone, AlertCircle } from 'lucide-vue-next';
import { useTableMapStore, type RestaurantTable } from '../tableMapStore';
import TableMap from '../components/TableMap.vue';
import BookingDetailModal from '../components/BookingDetailModal.vue';

type ColorEntry = { chip: string; dot: string };
const colorMap: Record<string, ColorEntry> = {
  green:  { chip: 'bg-green-500/15 border-green-500/30 text-green-400', dot: 'bg-green-400' },
  yellow: { chip: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400', dot: 'bg-yellow-400' },
  red:    { chip: 'bg-red-500/15 border-red-500/30 text-red-400', dot: 'bg-red-400' },
  cyan:   { chip: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400', dot: 'bg-cyan-400' },
};
const getColor = (key: string | undefined): ColorEntry => colorMap[key ?? ''] ?? colorMap['green'] as ColorEntry;

const StatChip = defineComponent({
  props: { color: String, count: Number, label: String },
  setup(p) {
    return () => {
      const entry = getColor(p.color);
      return h('div', {
        class: `flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${entry.chip}`
      }, [
        h('span', { class: `w-2 h-2 rounded-full ${entry.dot}` }),
        h('span', {}, p.count),
        h('span', { class: 'font-normal opacity-70 text-xs' }, p.label),
      ]);
    };
  }
});

const LegendItem = defineComponent({
  props: { color: String, label: String },
  setup(p) {
    return () => {
      const entry = getColor(p.color);
      return h('div', { class: 'flex items-center gap-1.5' }, [
        h('span', { class: `w-2.5 h-2.5 rounded-full ${entry.dot}` }),
        h('span', {}, p.label),
      ]);
    };
  }
});

const tableMapStore = useTableMapStore();
const selectedTable = ref<RestaurantTable | null>(null);
const showModal = ref(false);
const lastUpdated = ref('');

// All today bookings without table_id assigned
const unassignedBookings = computed(() =>
  tableMapStore.tables.flatMap(t => t.todayBookings).filter(b => !b.table_id)
);

const today = computed(() => {
  return new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
});

function openModal(table: RestaurantTable) {
  selectedTable.value = table;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  setTimeout(() => { selectedTable.value = null; }, 300);
}

async function refresh() {
  if (tableMapStore.isLoading) return;
  await tableMapStore.fetchTableStatuses();
  lastUpdated.value = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function onCheckin(order: any) {
  // Could navigate to POS with order selected — for now just refresh
  refresh();
}

// Auto-refresh every 30 seconds
let refreshTimer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  await refresh();
  refreshTimer = setInterval(refresh, 30_000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>
