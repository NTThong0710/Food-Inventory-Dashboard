import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/shared/lib/supabase';
import { useDishesStore } from '@/features/dishes/store';
import { useInventoryStore } from '@/features/inventory/store';
import type { CustomerOrder, OrderItem } from '@/features/quotations/store';

export const usePosStore = defineStore('pos', () => {
  const activeOrders = ref<CustomerOrder[]>([]);
  const dishes = ref<any[]>([]);
  const selectedOrder = ref<CustomerOrder | null>(null);
  const isLoading = ref(false);
  const isUpdating = ref(false);
  const error = ref<string | null>(null);
  const pastCustomers = ref<string[]>([]); // autocomplete list
  
  // Track adding items to avoid race conditions
  const processingItems = new Set<string>();

  // Fetch distinct customer names from recent orders
  async function fetchPastCustomers() {
    try {
      const { data } = await supabase
        .from('customer_orders')
        .select('customer_name')
        .not('customer_name', 'ilike', 'Khách vãng lai')
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) {
        const unique = [...new Set(data.map((r: any) => r.customer_name).filter(Boolean))];
        pastCustomers.value = unique;
      }
    } catch { /* silent */ }
  }

  // Fetch active orders (pending, preparing, serving)

  async function fetchActiveOrders() {
    isLoading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from('customer_orders')
        .select(`
          *,
          items:customer_order_items(
            *,
            dish:dishes(name, image_url, description)
          )
        `)
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (err) throw err;
      activeOrders.value = data || [];
      
      if (selectedOrder.value) {
        const updatedOrder = activeOrders.value.find(o => o.id === selectedOrder.value?.id);
        if (updatedOrder) {
          selectedOrder.value = updatedOrder;
        } else {
          selectedOrder.value = null;
        }
      }
    } catch (err: any) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  // Fetch a single order by ID (used for quick updates)
  async function fetchSingleOrder(orderId: string) {
    try {
      const { data, error: err } = await supabase
        .from('customer_orders')
        .select(`
          *,
          items:customer_order_items(
            *,
            dish:dishes(name, image_url, description)
          )
        `)
        .eq('id', orderId)
        .single();

      if (err) throw err;
      if (data && selectedOrder.value?.id === data.id) {
        selectedOrder.value = data;
        const index = activeOrders.value.findIndex(o => o.id === data.id);
        if (index !== -1) {
          activeOrders.value[index] = data;
        }
      }
    } catch (err: any) {
      console.error('Error fetching single order:', err);
    }
  }

  // Fetch available menu dishes
  async function fetchMenu() {
    try {
      const { data, error: err } = await supabase
        .from('dishes')
        .select('*')
        .is('deleted_at', null);
      if (err) throw err;
      dishes.value = data || [];
    } catch (err) {
      console.error('Error fetching dishes for POS:', err);
    }
  }

  // Set selected order
  function selectOrder(order: CustomerOrder) {
    selectedOrder.value = order;
  }

  // Create new order for Walk-in customer
  async function createWalkinOrder(tableNumber: string, customerName: string = 'Khách vãng lai') {
    isUpdating.value = true;
    try {
      const { data, error } = await supabase
        .from('customer_orders')
        .insert([{
          customer_name: customerName,
          table_number: tableNumber,
          total_amount: 0,
          status: 'pending'
        }])
        .select()
        .single();
        
      if (error) throw error;
      await fetchActiveOrders();
      if (data) {
        selectOrder(activeOrders.value.find(o => o.id === data.id)!);
      }
    } catch (err) {
      console.error('Error creating walk-in order:', err);
    } finally {
      isUpdating.value = false;
    }
  }

  // Add Item to Order
  // Add Item to Order
  async function addItemToOrder(orderId: string, dishCode: string, quantity: number, currentPrice: number) {
    // Prevent duplicate additions on furious clicks
    const itemKey = `${orderId}-${dishCode}`;
    if (processingItems.has(itemKey)) return;
    processingItems.add(itemKey);

    const order = activeOrders.value.find(o => o.id === orderId);
    if (!order) {
      processingItems.delete(itemKey);
      return;
    }

    const existingItem = order.items?.find((i: any) => i.dish_code === dishCode);
    
    // Cập nhật giao diện ngay lập tức
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      // Lấy data món ăn để chèn giả vào mảng hiển thị liền
      const dishInfo = dishes.value.find((d: any) => d.dish_code === dishCode);
      if (!order.items) order.items = [];
      order.items.unshift({
        id: 'temp-' + Date.now(), // ID tạm để Vue render không lỗi key
        order_id: orderId,
        dish_code: dishCode,
        quantity: quantity,
        price_at_time: currentPrice,
        dish: { name: dishInfo?.name, image_url: dishInfo?.image_url, description: dishInfo?.description || '' }
      } as any);
    }
    // Tiền tổng cũng cập nhật ngay lập tức
    order.total_amount += (quantity * currentPrice);

    try {
      //  GỌI API CHẠY NGẦM
      if (existingItem && !String(existingItem.id).startsWith('temp-')) {
        const { error: err } = await supabase
          .from('customer_order_items')
          .update({ quantity: existingItem.quantity })
          .eq('id', existingItem.id);
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase
          .from('customer_order_items')
          .insert([{
            order_id: orderId,
            dish_code: dishCode,
            quantity: quantity,
            price_at_time: currentPrice
          }])
          .select() // Phải có .select() để supabase trả về ID thật vừa tạo
          .single();
          
        if (err) throw err;

        if (!order.items) return;
        
        // Cập nhật ID thật thay cho cái ID tạm lúc nãy
        const tempItem = order.items.find((i: any) => i.dish_code === dishCode && String(i.id).startsWith('temp-'));
        if (tempItem && data) tempItem.id = data.id;
      }
      
      // Update tiền tổng trên DB
      supabase.from('customer_orders').update({ total_amount: order.total_amount }).eq('id', orderId);
      
      
    } catch (err) {
      console.error('Error adding item to order:', err);
      // Xui xẻo rớt mạng hoặc lỗi thì mới tải lại data thật để Rollback
      await fetchSingleOrder(orderId);
      throw err;
    } finally {
      processingItems.delete(itemKey);
    }
  }

  // Update item quantity
  // Update item quantity
  async function updateItemQuantity(itemId: string, orderId: string, newQuantity: number) {
    const order = activeOrders.value.find(o => o.id === orderId);
    if (!order || !order.items) return;
    
    const itemIndex = order.items.findIndex((i: any) => i.id === itemId);
    if (itemIndex === -1) return;

    const item = order.items[itemIndex];

    if (!item) return;
    
    // Cập nhật giao diện lập tức
    item.quantity = newQuantity <= 0 ? 0 : newQuantity;
    // Tính lại tổng tiền
    order.total_amount = order.items.reduce((sum: number, i: any) => sum + (i.quantity * Number(i.price_at_time)), 0);

    // Xóa khỏi danh sách ngay lập tức nếu quantity về 0
    let removedItem = null;
    if (newQuantity <= 0) {
      removedItem = order.items.splice(itemIndex, 1)[0];
    }

    try {
      // GỌI API NGẦM
      if (newQuantity <= 0) {
        const { error: delErr } = await supabase.from('customer_order_items').delete().eq('id', itemId);
        if (delErr) throw delErr;
      } else {
        const { error: updateErr } = await supabase.from('customer_order_items').update({ quantity: newQuantity }).eq('id', itemId);
        if (updateErr) throw updateErr;
      }
      
      // Lưu âm thầm cục tiền tổng lên DB luôn
      supabase.from('customer_orders').update({ total_amount: order.total_amount }).eq('id', orderId);
      
      
    } catch (err) {
      // Rollback (cứu vớt) nếu lỗi
      await fetchSingleOrder(orderId);
      throw err;
    }
  }

  // Checkout and complete order - now with prepare dishes logic
  async function checkoutOrder(orderId: string) {
    isUpdating.value = true;
    try {
      const dishesStore = useDishesStore();
      const inventoryStore = useInventoryStore();

      // Get the order with all items
      const order = activeOrders.value.find(o => o.id === orderId);
      if (!order || !order.items || order.items.length === 0) {
        throw new Error('Không tìm thấy Order hoặc không có items');
      }

      // 1. Gather all required ingredients across the whole order
      const dishCodes = order.items.map((i: any) => i.dish_code);
      const { data: recipes, error: recErr } = await supabase
        .from('dish_ingredients')
        .select('dish_code, ingredient_sku, quantity_needed')
        .in('dish_code', dishCodes);
      if (recErr) throw recErr;

      // 2. Calculate aggregate requirements
      const totalNeeded = new Map<string, number>();
      for (const item of order.items) {
        const itemRecipes = recipes?.filter(r => r.dish_code === item.dish_code) || [];
        for (const r of itemRecipes) {
          const qty = Number(r.quantity_needed) * Number(item.quantity);
          totalNeeded.set(r.ingredient_sku, (totalNeeded.get(r.ingredient_sku) || 0) + qty);
        }
      }

      // 3. Fetch current stock for needed ingredients
      const neededSkus = Array.from(totalNeeded.keys());
      if (neededSkus.length > 0) {
        const { data: stockData, error: stockErr } = await supabase
          .from('ingredients')
          .select('sku, name, stock_quantity, unit')
          .in('sku', neededSkus);
        if (stockErr) throw stockErr;

        // Verify stock sufficiency
        const insufficientDetails: string[] = [];
        const stockMap = new Map();
        for (const row of (stockData || [])) {
          stockMap.set(row.sku, row);
          const req = totalNeeded.get(row.sku) || 0;
          if (row.stock_quantity < req) {
            insufficientDetails.push(`- ${row.name}: cần ${req} ${row.unit}, tồn kho ${row.stock_quantity}`);
          }
        }
        for (const sku of neededSkus) {
          if (!stockMap.has(sku)) insufficientDetails.push(`- ${sku}: không tìm thấy trong kho!`);
        }

        if (insufficientDetails.length > 0) {
          throw new Error(`Không đủ nguyên liệu để chế biến:\n${insufficientDetails.join('\n')}`);
        }

        // 4. Lưu lại lịch sử giao dịch - Trigger trong Supabase sẽ TỰ ĐỘNG trừ kho
        const transactionPromises = [];
        for (const row of (stockData || [])) {
          const req = totalNeeded.get(row.sku) || 0;
          if (req > 0) {
            transactionPromises.push(
              supabase.from('inventory_transactions').insert([{
                ingredient_sku: row.sku,
                transaction_type: 'OUT_SALES',
                quantity: req,
                reference_id: orderId,
                notes: 'Trừ nguyên liệu tự động từ lúc chốt đơn hàng bán'
              }]).then(({ error: insertErr }) => { 
                if (insertErr) {
                  console.error("Lỗi khi insert giao dịch:", insertErr);
                  throw insertErr;
                }
              })
            );
          }
        }
        await Promise.all(transactionPromises);
      }

      // 5. Build Sales records
      if (dishesStore.items.length === 0) {
         try { await dishesStore.fetchDishes(); } catch (e) {}
      }
      
      const salePayloads = order.items.map((item: any) => {
        const dishInfo = dishesStore.items.find(d => d.dish_code === item.dish_code);
        const costRatio = dishInfo?.target_margin ? (dishInfo.target_margin / 100) : 0.7; // default 30% margin
        const profit = item.price_at_time * (1 - costRatio);
        return {
          dish_code: item.dish_code,
          dish_name: item.dish?.name || item.dish_code,
          quantity: item.quantity,
          revenue: item.price_at_time * item.quantity,
          profit: Math.round(profit * item.quantity)
        };
      });

      if (salePayloads.length > 0) {
        const { error: saleErr } = await supabase.from('sales').insert(salePayloads);
        if (saleErr) console.error('Error inserting sales:', saleErr);
      }

      // 6. Mark order as completed
      await supabase.from('customer_orders').update({ status: 'completed' }).eq('id', orderId);
      
      // Refresh inventory after all preparations
      await inventoryStore.fetchIngredients();
      
      selectedOrder.value = null;
      await fetchActiveOrders();
    } catch (err: any) {
      console.error('Error checking out order:', err);
      throw err; // Re-throw so PosView can handle and show error
    } finally {
      isUpdating.value = false;
    }
  }
  
  // Update Order Status manually
  async function updateOrderStatus(orderId: string, status: string) {
    isUpdating.value = true;
    try {
      const { error: err } = await supabase.from('customer_orders').update({ status }).eq('id', orderId);
      if (err) throw err;
      await fetchActiveOrders();
    } catch (err: any) {
       console.error('Error updating status:', err);
       throw err; // Re-throw so caller can handle
    } finally {
      isUpdating.value = false;
    }
  }

  return {
    activeOrders,
    selectedOrder,
    dishes,
    isLoading,
    isUpdating,
    error,
    pastCustomers,
    fetchActiveOrders,
    fetchSingleOrder,
    fetchMenu,
    fetchPastCustomers,
    selectOrder,
    createWalkinOrder,
    addItemToOrder,
    updateItemQuantity,
    checkoutOrder,
    updateOrderStatus
  };
});
