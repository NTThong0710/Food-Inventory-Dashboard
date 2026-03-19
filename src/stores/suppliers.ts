import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/lib/axios';

export interface SupplierIngredient {
  ingredient_sku: string;
  ingredient_name?: string;
  quoted_price: number;
  lead_time_days: number;
}

export interface Supplier {
  supplier_code: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
  ingredients?: SupplierIngredient[];
}

export const useSuppliersStore = defineStore('suppliers', () => {
  const items = ref<Supplier[]>([]);
  const isLoading = ref(false);

  async function fetchSuppliers() {
    isLoading.value = true;
    try {
      const { data } = await api.get('/suppliers?select=*,supplier_ingredients(ingredient_sku,quoted_price,lead_time_days,ingredients(name))&order=created_at.desc');

      if (data && Array.isArray(data)) {
        items.value = data.map((dbSup: any) => {
          return {
            ...dbSup,
            ingredients: (dbSup.supplier_ingredients || []).map((si: any) => ({
              ingredient_sku: si.ingredient_sku,
              ingredient_name: si.ingredients ? si.ingredients.name : 'Unknown',
              quoted_price: si.quoted_price,
              lead_time_days: si.lead_time_days
            }))
          };
        });
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      isLoading.value = false;
    }
  }

  const totalSuppliers = computed(() => items.value.length);
  const activeSuppliers = computed(() => items.value.filter(s => s.status === 'Active').length);

  async function addSupplier(supplier: Supplier) {
    try {
      const { data } = await api.post('/suppliers', {
        supplier_code: supplier.supplier_code,
        name: supplier.name,
        contact_name: supplier.contact_name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        status: supplier.status
      });

      if (data && Array.isArray(data) && data.length > 0) {
        supplier.supplier_code = data[0].supplier_code;
        
        if (supplier.ingredients && supplier.ingredients.length > 0) {
           const ingredientsToInsert = supplier.ingredients.map(ing => ({
             supplier_code: supplier.supplier_code,
             ingredient_sku: ing.ingredient_sku,
             quoted_price: ing.quoted_price,
             lead_time_days: ing.lead_time_days
           }));
           await api.post('/supplier_ingredients', ingredientsToInsert);
        }

        items.value.unshift(supplier);
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
    }
  }

  async function updateSupplier(supplier: Supplier) {
    try {
      await api.patch(`/suppliers?supplier_code=eq.${supplier.supplier_code}`, {
        name: supplier.name,
        contact_name: supplier.contact_name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        status: supplier.status
      });

      await api.delete(`/supplier_ingredients?supplier_code=eq.${supplier.supplier_code}`);
      
      if (supplier.ingredients && supplier.ingredients.length > 0) {
        const ingredientsToInsert = supplier.ingredients.map(ing => ({
          supplier_code: supplier.supplier_code,
          ingredient_sku: ing.ingredient_sku,
          quoted_price: ing.quoted_price,
          lead_time_days: ing.lead_time_days
        }));
        await api.post('/supplier_ingredients', ingredientsToInsert);
      }

      const index = items.value.findIndex(item => item.supplier_code === supplier.supplier_code);
      if (index !== -1) {
        items.value[index] = supplier;
      }
    } catch (error) {
       console.error('Error updating supplier:', error);
    }
  }

  async function deleteSupplier(supplier_code: string) {
    try {
      await api.delete(`/suppliers?supplier_code=eq.${supplier_code}`);

      items.value = items.value.filter(item => item.supplier_code !== supplier_code);
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  }

  return {
    items,
    isLoading,
    totalSuppliers,
    activeSuppliers,
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier
  };
});
