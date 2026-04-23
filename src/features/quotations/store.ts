import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/shared/lib/supabase';

export interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  num_guests: number;
  special_requests: string;
  status: string;
  customer_id: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  dish_code: string;
  quantity: number;
  price_at_time: number;
  dish?: {
    name: string;
    image_url: string;
    description: string;
  };
}

export interface CustomerOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  table_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

export const useQuotationStore = defineStore('quotation', () => {
  const bookings = ref<Booking[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchBookings() {
    isLoading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: false });

      if (err) throw err;
      bookings.value = data || [];
    } catch (err: any) {
      error.value = err.message;
      console.error('Error fetching bookings:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchOrderForCustomer(customerId: string) {
    try {
      // Fetch the most recent order for this customer
      const { data, error: err } = await supabase
        .from('customer_orders')
        .select(`
          *,
          items:customer_order_items(
            *,
            dish:dishes(name, image_url, description)
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (err) throw err;
      return data;
    } catch (err) {
      console.error('Error fetching order for customer:', err);
      return null;
    }
  }

  async function updateBookingStatus(id: string, status: string) {
    try {
      // 1. Fetch booking to get customer_id and details
      const { data: booking, error: fetchErr } = await supabase.from('bookings').select('*').eq('id', id).single();
      if (fetchErr) throw fetchErr;

      // 2. Update status
      const { error: err } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      if (err) throw err;

      // 3. Send Notification if applicable
      if (booking && booking.customer_id) {
        let title = '';
        let message = '';
        let type = 'info';

        if (status === 'cancelled') {
           title = 'Đặt bàn bị hủy';
           message = `Rất tiếc, yêu cầu đặt bàn của bạn vào lúc ${booking.booking_time} - ${new Date(booking.booking_date).toLocaleDateString('vi-VN')} đã bị từ chối/hủy.`;
           type = 'error';
        } else if (status === 'confirmed') {
           title = 'Đặt bàn thành công';
           message = `Tuyệt vời! Bàn của bạn lúc ${booking.booking_time} - ${new Date(booking.booking_date).toLocaleDateString('vi-VN')} đã được xác nhận.`;
           type = 'success';
        }

        if (title) {
          await supabase.from('notifications').insert({
             customer_id: booking.customer_id,
             title,
             message,
             type
          });
        }
      }

      await fetchBookings();
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  }

  return {
    bookings,
    isLoading,
    error,
    fetchBookings,
    fetchOrderForCustomer,
    updateBookingStatus
  };
});
