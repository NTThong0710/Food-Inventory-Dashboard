import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/shared/lib/supabase';

export type TableStatus = 'available' | 'booked' | 'occupied' | 'draft_lock';

export interface RestaurantTable {
  id: number;          // 1 – 9
  label: string;       // "Bàn 1", "Bàn 2", …
  capacity: number;    // số ghế tối đa
  status: TableStatus;
  activeOrder: any | null;    // customer_orders row nếu đang phục vụ
  todayBookings: any[];       // bookings của hôm nay
}

const TABLE_CONFIG: { id: number; capacity: number }[] = [
  { id: 1, capacity: 2 },
  { id: 2, capacity: 4 },
  { id: 3, capacity: 4 },
  { id: 4, capacity: 6 },
  { id: 5, capacity: 6 },
  { id: 6, capacity: 6 },
  { id: 7, capacity: 8 },
  { id: 8, capacity: 8 },
  { id: 9, capacity: 10 },
];

export const useTableMapStore = defineStore('tableMap', () => {
  const tables = ref<RestaurantTable[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const selectedTable = ref<RestaurantTable | null>(null);

  // ─── Derived stats ───────────────────────────────────────
  const availableCount = computed(() => tables.value.filter(t => t.status === 'available').length);
  const bookedCount    = computed(() => tables.value.filter(t => t.status === 'booked').length);
  const occupiedCount  = computed(() => tables.value.filter(t => t.status === 'occupied').length);

  // ─── Fetch tất cả trạng thái bàn ─────────────────────────
  async function fetchTableStatuses() {
    isLoading.value = true;
    error.value = null;

    try {
      const nowLocal = new Date();
      const today = nowLocal.getFullYear() + '-' + String(nowLocal.getMonth() + 1).padStart(2, '0') + '-' + String(nowLocal.getDate()).padStart(2, '0');

      // Fetch active orders (pending/preparing)
      const { data: orders, error: orderErr } = await supabase
        .from('customer_orders')
        .select('id, table_number, customer_name, customer_phone, status, total_amount, created_at')
        .in('status', ['pending', 'preparing']);
      if (orderErr) throw orderErr;

      // Fetch today's bookings (pending/confirmed/draft_lock)
      const { data: bookings, error: bookingErr } = await supabase
        .from('bookings')
        .select('id, customer_name, customer_phone, num_guests, booking_date, booking_time, special_requests, status, table_id, preordered_items, created_at')
        .eq('booking_date', today)
        .in('status', ['pending', 'confirmed', 'draft_lock']);
      if (bookingErr) throw bookingErr;

      // Build table map
      tables.value = TABLE_CONFIG.map(cfg => {
        const tableLabel = String(cfg.id);

        // Tìm order đang active cho bàn này
        const activeOrder = (orders || []).find(o => o.table_number === tableLabel) || null;

        // Tìm bookings của hôm nay cho bàn này
        const todayBookings = (bookings || []).filter(b => b.table_id === cfg.id);

        let status: TableStatus = 'available';
        if (activeOrder) {
          status = 'occupied';
        } else {
          // Check for valid draft_lock first
          const validDraft = todayBookings.find(b => {
             if (b.status === 'draft_lock') {
               const elapsed = Date.now() - new Date(b.created_at).getTime();
               return elapsed <= 5 * 60 * 1000;
             }
             return false;
          });

          if (validDraft) {
            status = 'draft_lock';
          } else {
            // Check for actual confirmed/pending bookings
            const actualBookings = todayBookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
            if (actualBookings.length > 0) {
               status = 'booked';
            }
          }
        }

        return {
          id: cfg.id,
          label: `Bàn ${cfg.id}`,
          capacity: cfg.capacity,
          status,
          activeOrder,
          todayBookings,
        };
      });
    } catch (err: any) {
      error.value = err.message;
      console.error('Error fetching table statuses:', err);
    } finally {
      isLoading.value = false;
    }
  }

  // ─── Chọn bàn ────────────────────────────────────────────
  function selectTable(table: RestaurantTable | null) {
    selectedTable.value = table;
  }

  // ─── Confirm booking ──────────────────────────────────────
  async function confirmBooking(bookingId: string) {
    try {
      const { error: err } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);
      if (err) throw err;
      await fetchTableStatuses();
    } catch (err: any) {
      console.error('Error confirming booking:', err);
      throw err;
    }
  }

  // ─── Assign bàn cho booking (admin) ─────────────────────
  async function assignTableToBooking(bookingId: string, tableId: number) {
    try {
      const { error: err } = await supabase
        .from('bookings')
        .update({ table_id: tableId, status: 'confirmed' })
        .eq('id', bookingId);
      if (err) throw err;
      await fetchTableStatuses();
    } catch (err: any) {
      console.error('Error assigning table:', err);
      throw err;
    }
  }

  // ─── Tạo order từ booking (admin check-in) ───────────────
  async function checkInFromBooking(booking: any) {
    try {
      const items = booking.preordered_items || [];
      const total_amount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      
      const { data, error: err } = await supabase
        .from('customer_orders')
        .insert([{
          customer_name: booking.customer_name,
          customer_phone: booking.customer_phone,
          table_number: String(booking.table_id),
          total_amount: total_amount,
          status: 'pending',
          customer_id: booking.customer_id || null,
        }])
        .select()
        .single();
      if (err) throw err;

      // Nếu có món đặt trước, bắn vào customer_order_items
      if (items.length > 0) {
        const orderItems = items.map((item: any) => ({
          order_id: data.id,
          dish_code: item.dish_code,
          quantity: item.quantity,
          price_at_time: item.price
        }));
        const { error: itemsErr } = await supabase.from('customer_order_items').insert(orderItems);
        if (itemsErr) console.error('Error inserting preordered items:', itemsErr);
      }

      // Mark booking as completed (người đến rồi)
      await supabase.from('bookings').update({ status: 'completed' }).eq('id', booking.id);
      await fetchTableStatuses();
      return data;
    } catch (err: any) {
      console.error('Error checking in from booking:', err);
      throw err;
    }
  }

  // ─── Cancel booking ───────────────────────────────────────
  async function cancelBooking(bookingId: string) {
    try {
      const { error: err } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      if (err) throw err;
      await fetchTableStatuses();
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      throw err;
    }
  }

  return {
    tables,
    isLoading,
    error,
    selectedTable,
    availableCount,
    bookedCount,
    occupiedCount,
    fetchTableStatuses,
    selectTable,
    confirmBooking,
    assignTableToBooking,
    checkInFromBooking,
    cancelBooking,
  };
});
