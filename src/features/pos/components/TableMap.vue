  <template>
    <div class="grid grid-cols-3 gap-5">
      <button
        v-for="table in tables"
        :key="table.id"
        @click="$emit('select', table)"
        class="relative group flex flex-col items-center rounded-2xl border-2 p-5 select-none transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl focus:outline-none"
        :class="tableCardClass(table)"
      >
        <!-- Status glow ring -->
        <div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            :class="glowClass(table)" />

        <!-- Status badge -->
        <span
          class="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
          :class="badgeClass(table)"
        >{{ statusLabel(table) }}</span>

        <!-- Table icon / number -->
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-colors duration-300 relative"
          :class="iconBgClass(table)"
        >
          <span class="text-2xl font-black" :class="iconTextClass(table)">{{ table.id }}</span>

          <!-- Occupied: pulse ring -->
          <span v-if="table.status === 'occupied'"
            class="absolute -inset-1 rounded-2xl border-2 border-red-400/40 animate-ping" />
        </div>

        <!-- Table name -->
        <p class="font-bold text-sm mb-0.5" :class="labelClass(table)">{{ table.label }}</p>

        <!-- Capacity -->
        <p class="text-[11px] flex items-center gap-1" :class="subLabelClass(table)">
          <Users class="w-3 h-3" /> {{ table.capacity }} chỗ
        </p>

        <!-- Booked: mini info -->
        <div v-if="table.status === 'booked' && table.todayBookings.length > 0"
          class="mt-3 w-full bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-left">
          <p class="text-yellow-300 text-[10px] font-semibold truncate">
            {{ table.todayBookings[0].customer_name }}
          </p>
          <p class="text-yellow-500/70 text-[9px] mt-0.5">
            {{ table.todayBookings[0].booking_time?.substring(0,5) }} • {{ table.todayBookings[0].num_guests }} người
          </p>
          <div v-if="table.todayBookings[0].preordered_items?.length" class="mt-1 pt-1 border-t border-yellow-500/20">
            <p class="text-yellow-400 text-[9px] font-bold">Menu đã đặt ({{ table.todayBookings[0].preordered_items.length }} món):</p>
            <p class="text-yellow-500/70 text-[8px] italic truncate mt-0.5">
              {{ table.todayBookings[0].preordered_items.map((i: any) => i.name).join(', ') }}
            </p>
          </div>
        </div>

        <!-- Occupied: mini info -->
        <div v-if="table.status === 'occupied' && table.activeOrder"
          class="mt-3 w-full bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-left">
          <p class="text-red-300 text-[10px] font-semibold truncate">
            {{ table.activeOrder.customer_name }}
          </p>
          <p class="text-red-400/70 text-[9px] mt-0.5">
            {{ formatCurrency(table.activeOrder.total_amount) }}
          </p>
        </div>

        <!-- Draft Lock (Giữ chỗ 5p): mini info -->
        <div v-if="table.status === 'draft_lock'"
          class="mt-3 w-full bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2 text-left flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <p class="text-cyan-300 text-[10px] font-semibold truncate">
            Mới giữ chỗ (5p)
          </p>
        </div>
      </button>
    </div>
  </template>

  <script setup lang="ts">
  import { Users } from 'lucide-vue-next';
  import type { RestaurantTable } from '../tableMapStore';

  defineProps<{ tables: RestaurantTable[] }>();
  defineEmits<{ (e: 'select', table: RestaurantTable): void }>();

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

  const statusLabel = (t: RestaurantTable) => {
    if (t.status === 'occupied') return 'Đang dùng';
    if (t.status === 'booked')   return 'Đã đặt';
    if (t.status === 'draft_lock') return 'Giữ chỗ';
    return 'Trống';
  };

  // ── Card ────────────────────────────────────────────────────
  const tableCardClass = (t: RestaurantTable) => ({
    // occupied
    'bg-red-950/40 border-red-500/50 hover:border-red-400':    t.status === 'occupied',
    // booked
    'bg-yellow-950/30 border-yellow-500/40 hover:border-yellow-400': t.status === 'booked',
    // draft_lock
    'bg-cyan-950/30 border-cyan-500/40 hover:border-cyan-400': t.status === 'draft_lock',
    // available
    'bg-[#132210] border-[#2A362C] hover:border-[#37EC13]/60': t.status === 'available',
  });

  const glowClass = (t: RestaurantTable) => ({
    'shadow-[inset_0_0_30px_rgba(239,68,68,0.08)]':   t.status === 'occupied',
    'shadow-[inset_0_0_30px_rgba(234,179,8,0.08)]':   t.status === 'booked',
    'shadow-[inset_0_0_30px_rgba(6,182,212,0.08)]':   t.status === 'draft_lock',
    'shadow-[inset_0_0_30px_rgba(55,236,19,0.06)]':   t.status === 'available',
  });

  // ── Badge ───────────────────────────────────────────────────
  const badgeClass = (t: RestaurantTable) => ({
    'bg-red-500/20 text-red-300 border-red-500/30':       t.status === 'occupied',
    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30': t.status === 'booked',
    'bg-cyan-500/20 text-cyan-300 border-cyan-500/30': t.status === 'draft_lock',
    'bg-green-500/20 text-green-400 border-green-500/30': t.status === 'available',
  });

  // ── Icon bg ─────────────────────────────────────────────────
  const iconBgClass = (t: RestaurantTable) => ({
    'bg-red-500/20 group-hover:bg-red-500/30':      t.status === 'occupied',
    'bg-yellow-500/15 group-hover:bg-yellow-500/25': t.status === 'booked',
    'bg-cyan-500/15 group-hover:bg-cyan-500/25': t.status === 'draft_lock',
    'bg-[#1A2E16] group-hover:bg-[#1B5E20]/50':    t.status === 'available',
  });

  const iconTextClass = (t: RestaurantTable) => ({
    'text-red-300':    t.status === 'occupied',
    'text-yellow-300': t.status === 'booked',
    'text-cyan-300':   t.status === 'draft_lock',
    'text-[#37EC13]':  t.status === 'available',
  });

  // ── Labels ──────────────────────────────────────────────────
  const labelClass = (t: RestaurantTable) => ({
    'text-red-200':    t.status === 'occupied',
    'text-yellow-200': t.status === 'booked',
    'text-cyan-200':   t.status === 'draft_lock',
    'text-white':      t.status === 'available',
  });

  const subLabelClass = (t: RestaurantTable) => ({
    'text-red-400/70':    t.status === 'occupied',
    'text-yellow-500/70': t.status === 'booked',
    'text-cyan-400/70':   t.status === 'draft_lock',
    'text-gray-500':      t.status === 'available',
  });
  </script>
