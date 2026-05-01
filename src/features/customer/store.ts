import { defineStore } from 'pinia';
import { supabase } from '@/shared/lib/supabase';
import { useAuthStore } from '@/features/auth/store';

export interface CartItem {
  dish: any;
  quantity: number;
}

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    dishes: [] as any[],
    isLoading: false,
    cart: [] as CartItem[],
    isCartOpen: false,
    pendingReservation: null as any | null,
    notifications: [] as any[],
    isNotificationsOpen: false,
  }),
  getters: {
    cartTotal: (state) => state.cart.reduce((total, item) => total + ((item.dish.selling_price || item.dish.price) * item.quantity), 0),
    cartCount: (state) => state.cart.reduce((count, item) => count + item.quantity, 0),
    unreadNotificationsCount: (state) => state.notifications.filter(n => !n.is_read).length,
  },
  actions: {
    async login(email: string, password: string) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return true;
    },
    async register(email: string, password: string, fullName: string, phone: string) {
      const { data, error } = await supabase.auth.signUp({
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
            phone: phone,
            role: 'customer'
          }
        }
      });
      if (error) throw error;
      
      // Check if email is already registered (identities length is 0 when prevent email enumeration is ON)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('Email này đã được đăng ký. Vui lòng sử dụng email khác.');
      }
      
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
          phone: phone,
          role: 'customer'
        });
        if (profileError) throw profileError;
      }
      return true;
    },
    toggleCart() {
      this.isCartOpen = !this.isCartOpen;
      if (this.isCartOpen) this.isNotificationsOpen = false;
    },
    toggleNotifications() {
      this.isNotificationsOpen = !this.isNotificationsOpen;
      if (this.isNotificationsOpen) {
        this.isCartOpen = false;
        this.markNotificationsAsRead();
      }
    },
    addToCart(dish: any) {
      const existing = this.cart.find(i => i.dish.dish_code === dish.dish_code);
      if (existing) {
        existing.quantity++;
      } else {
        this.cart.push({ dish, quantity: 1 });
      }
    },
    removeFromCart(dishCode: string) {
      this.cart = this.cart.filter(i => i.dish.dish_code !== dishCode);
    },
    updateQuantity(dishCode: string, quantity: number) {
      const item = this.cart.find(i => i.dish.dish_code === dishCode);
      if (item && quantity > 0) {
        item.quantity = quantity;
      }
    },
    clearCart() {
      this.cart = [];
      this.isCartOpen = false;
    },
    async fetchDishes() {
      this.isLoading = true;
      try {
        const { data, error } = await supabase.from('dishes').select('*').order('name').is('deleted_at', null);
        if (error) throw error;
        this.dishes = data || [];
      } catch (err) {
        console.error('Error fetching dishes:', err);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchNotifications() {
      const authStore = useAuthStore();
      if (!authStore.user) return;
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('customer_id', authStore.user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        this.notifications = data || [];
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    },
    async markNotificationsAsRead() {
      const authStore = useAuthStore();
      if (!authStore.user) return;
      const unreadIds = this.notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;
      
      try {
        await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
        this.notifications.forEach(n => n.is_read = true);
      } catch (err) {
        console.error('Error marking notifications read:', err);
      }
    },
    async deleteNotification(id: string) {
      try {
        await supabase.from('notifications').delete().eq('id', id);
        this.notifications = this.notifications.filter(n => n.id !== id);
      } catch (err) {
        console.error('Error deleting notification:', err);
      }
    },
    // Step 1: Request a 5-minute table lock
    async createDraftReservation(bookingData: any) {
      const authStore = useAuthStore();
      const payload = { 
        ...bookingData, 
        customer_id: authStore.user?.id || null,
        status: 'draft_lock' 
      };

      try {
        const { data, error } = await supabase.from('bookings').insert([payload]).select().single();
        if (error) throw error;
        
        // Save the actual row data including 'id' and 'created_at' for the timer
        this.pendingReservation = data;
        return data;
      } catch (err) {
        console.error('Error creating draft reservation:', err);
        throw err;
      }
    },
    
    // Step 2 & 3: Submit unified reservation (Table + Dishes) -> Update existing draft
    async submitUnifiedReservation() {
      if (!this.pendingReservation || !this.pendingReservation.id) throw new Error("Missing reservation context.");
      
      // format cart items for json column
      const preorderedItems = this.cart.map(item => ({
        dish_code: item.dish.dish_code,
        name: item.dish.name,
        price: item.dish.selling_price || item.dish.price,
        quantity: item.quantity,
      }));

      try {
        const { error } = await supabase.from('bookings')
          .update({
            status: 'pending',
            preordered_items: preorderedItems
          })
          .eq('id', this.pendingReservation.id);
          
        if (error) throw error;
        
        // Success: clear state
        this.clearCart();
        this.pendingReservation = null;
        return true;
      } catch (err) {
        console.error('Error submitting unified reservation:', err);
        throw err;
      }
    },

    // Step 4: Clear draft
    async cancelDraftReservation() {
      if (this.pendingReservation && this.pendingReservation.id) {
        // optionally update status to 'cancelled' so we have a paper trail, or delete it
        await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', this.pendingReservation.id);
      }
      this.pendingReservation = null;
    }
  }
});
