import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/shared/lib/axios';

export interface Batch {
  batch_code: string;
  ingredient_sku: string;
  ingredient_name: string;
  ingredient_unit: string;
  supplier_code: string;
  supplier_name: string;
  quantity: number;
  unit_cost: number;
  production_date: string | null;
  expiry_date: string | null;
  received_at: string;
}

export const useBatchesStore = defineStore('batches', () => {
  const items = ref<Batch[]>([]);
  const isLoading = ref(false);

  // ---------- READ ----------
  async function fetchBatches() {
    isLoading.value = true;
    try {
      const { data } = await api.get(
        '/inventory_batches?select=*,ingredients(name,unit),suppliers(name)&order=received_at.desc'
      );
      
      if (data && Array.isArray(data)) {
        items.value = data.map((row: any) => ({
          batch_code: row.batch_code,
          ingredient_sku: row.ingredient_sku,
          ingredient_name: row.ingredients?.name ?? 'Unknown',
          ingredient_unit: row.ingredients?.unit ?? '',
          supplier_code: row.supplier_code,
          supplier_name: row.suppliers?.name ?? 'Unknown',
          quantity: Number.isInteger(row.quantity) ? Number(row.quantity) : Math.trunc(Number(row.quantity)),
          unit_cost: row.unit_cost,
          production_date: row.production_date,
          expiry_date: row.expiry_date,
          received_at: row.received_at,
        })
      );
      }
    
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
     finally {
      isLoading.value = false;
    }
  }

  // ---------- CREATE ----------
  async function addBatch(batch: Batch) {
    try {
      const { data } = await api.post('/inventory_batches', {
        batch_code: batch.batch_code,
        ingredient_sku: batch.ingredient_sku,
        supplier_code: batch.supplier_code,
        quantity: batch.quantity,
        unit_cost: batch.unit_cost,
        production_date: batch.production_date || null,
        expiry_date: batch.expiry_date || null,
      });

      if (data && Array.isArray(data) && data.length > 0) {
        // Update ingredient stock_quantity (increment)
        try {
          const { data: ingData } = await api.get(`/ingredients?sku=eq.${batch.ingredient_sku}&select=stock_quantity`);
          if (ingData && ingData.length > 0) {
            const newQty = Number(ingData[0].stock_quantity) + Number(batch.quantity);
            await api.patch(`/ingredients?sku=eq.${batch.ingredient_sku}`, {
              stock_quantity: newQty,
            });
          }
        } catch (stockErr) {
          console.error('Error updating stock after add:', stockErr);
        }

        // Add to local state
        items.value.unshift({
          ...batch,
          received_at: data[0].received_at,
        });
      }
    } catch (error) {
      console.error('Error adding batch:', error);
      throw error;
    }
  }

  // ---------- UPDATE ----------
  async function updateBatch(batch: Batch, oldQuantity: number) {
    try {
      await api.patch(`/inventory_batches?batch_code=eq.${batch.batch_code}`, {
        ingredient_sku: batch.ingredient_sku,
        supplier_code: batch.supplier_code,
        quantity: batch.quantity,
        unit_cost: batch.unit_cost,
        production_date: batch.production_date || null,
        expiry_date: batch.expiry_date || null,
      });

      // Update ingredient stock (delta = new - old)
      const delta = Number(batch.quantity) - Number(oldQuantity);
      if (delta !== 0) {
        try {
          const { data: ingData } = await api.get(`/ingredients?sku=eq.${batch.ingredient_sku}&select=stock_quantity`);
          if (ingData && ingData.length > 0) {
            const newQty = Math.max(0, Number(ingData[0].stock_quantity) + delta);
            await api.patch(`/ingredients?sku=eq.${batch.ingredient_sku}`, {
              stock_quantity: newQty,
            });
          }
        } catch (stockErr) {
          console.error('Error updating stock after edit:', stockErr);
        }
      }

      // Update local state
      const index = items.value.findIndex(b => b.batch_code === batch.batch_code);
      if (index !== -1) {
        items.value[index] = { ...batch };
      }
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  }

  // ---------- DELETE ----------
  async function deleteBatch(batchCode: string) {
    const batch = items.value.find(b => b.batch_code === batchCode);
    try {
      await api.delete(`/inventory_batches?batch_code=eq.${batchCode}`);

      // Decrement ingredient stock
      if (batch) {
        try {
          const { data: ingData } = await api.get(`/ingredients?sku=eq.${batch.ingredient_sku}&select=stock_quantity`);
          if (ingData && ingData.length > 0) {
            const newQty = Math.max(0, Number(ingData[0].stock_quantity) - Number(batch.quantity));
            await api.patch(`/ingredients?sku=eq.${batch.ingredient_sku}`, {
              stock_quantity: newQty,
            });
          }
        } catch (stockErr) {
          console.error('Error updating stock after delete:', stockErr);
        }
      }

      items.value = items.value.filter(b => b.batch_code !== batchCode);
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  }

  // ---------- COMPUTED ----------
  const totalBatches = computed(() => items.value.length);

  const totalValue = computed(() =>
    items.value.reduce((sum, b) => sum + b.quantity * b.unit_cost, 0)
  );

  const expiringCount = computed(() => {
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return items.value.filter(b => {
      if (!b.expiry_date) return false;
      const exp = new Date(b.expiry_date);
      return exp >= now && exp <= weekLater;
    }).length;
  });

  // Fetch batches by supplier code (for SupplierForm)
  async function fetchBatchesBySupplier(supplierCode: string): Promise<Batch[]> {
    try {
      const { data } = await api.get(
        `/inventory_batches?supplier_code=eq.${supplierCode}&select=*,ingredients(name,unit)&order=received_at.desc`
      );
      if (data && Array.isArray(data)) {
        return data.map((row: any) => ({
          batch_code: row.batch_code,
          ingredient_sku: row.ingredient_sku,
          ingredient_name: row.ingredients?.name ?? 'Unknown',
          ingredient_unit: row.ingredients?.unit ?? '',
          supplier_code: row.supplier_code,
          supplier_name: '',
          quantity: row.quantity,
          unit_cost: row.unit_cost,
          production_date: row.production_date,
          expiry_date: row.expiry_date,
          received_at: row.received_at,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching batches by supplier:', error);
      return [];
    }
  }

  return {
    items,
    isLoading,
    totalBatches,
    totalValue,
    expiringCount,
    fetchBatches,
    addBatch,
    updateBatch,
    deleteBatch,
    fetchBatchesBySupplier,
  };
});
