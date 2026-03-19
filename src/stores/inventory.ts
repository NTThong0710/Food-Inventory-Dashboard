import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/lib/axios';

// Map TS interfaces to Supabase schema
export interface Category {
  category_code: string;
  name: string;
}

export interface Ingredient {
  sku: string;
  name: string;
  category: string;     
  category_code: string;  
  quantity: number;
  unit: string;
  cost: number;        
  production_date?: string; 
  expiry_date?: string; 
  note: string;         
}

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<Ingredient[]>([]);
  const categories = ref<Category[]>([]);
  const isLoading = ref(false);

  // Fetch from Supabase REST API via Axios
  async function fetchIngredients() {
    isLoading.value = true;
    try {
      // 1. Fetch categories if not loaded
      if (categories.value.length === 0) {
        const { data: catData } = await api.get('/categories?type=eq.ingredient');
        if (catData && Array.isArray(catData)) {
          categories.value = catData;
        }
      }

      // 2. Fetch ingredients with batches to estimate average cost and latest expiry
      const { data } = await api.get('/ingredients?select=*,inventory_batches(*)&order=created_at.desc');
      
      // Map DB fields to Component interfaces
      if (data && Array.isArray(data)) {
        items.value = data.map((dbItem: any) => {
          const cat = categories.value.find(c => c.category_code == dbItem.category_code);
          const batches = dbItem.inventory_batches || [];
          const latestBatch = batches.length > 0 ? batches[batches.length - 1] : null;

          return {
            sku: dbItem.sku,
            name: dbItem.name,
            category: cat ? cat.name : 'Unknown',
            category_code: dbItem.category_code,
            quantity: dbItem.stock_quantity,
            unit: dbItem.unit,
            cost: latestBatch ? latestBatch.unit_cost : 0,
            production_date: latestBatch ? latestBatch.production_date : undefined,
            expiry_date: latestBatch ? latestBatch.expiry_date : undefined,
            note: ''
          };
        });
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      isLoading.value = false;
    }
  }

  const totalItems = computed(() => items.value.length);
  const totalCategories = computed(() => {
    const uniqueCategories = new Set(items.value.map(item => item.category));
    return uniqueCategories.size;
  });
  const grandTotalValue = computed(() => {
    return items.value.reduce((acc, item) => acc + (item.quantity * item.cost), 0);
  });

  async function addIngredient(ingredient: Ingredient) {
    try {
      const { data } = await api.post('/ingredients', {
        sku: ingredient.sku,
        name: ingredient.name,
        category_code: ingredient.category_code,
        unit: ingredient.unit,
        stock_quantity: ingredient.quantity
      });
        
      if (data && Array.isArray(data) && data.length > 0) {
         const newRow = data[0];
         const cat = categories.value.find(c => c.category_code == newRow.category_code);
         items.value.unshift({
            sku: newRow.sku,
            name: newRow.name,
            category: cat ? cat.name : 'Unknown',
            category_code: newRow.category_code,
            quantity: newRow.stock_quantity,
            unit: newRow.unit,
            cost: 0,
            production_date: undefined,
            expiry_date: undefined,
            note: ''
         });
      }
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  }

  async function updateIngredient(ingredient: Ingredient) {
    try {
      await api.patch(`/ingredients?sku=eq.${ingredient.sku}`, {
        name: ingredient.name,
        category_code: ingredient.category_code,
        unit: ingredient.unit,
        stock_quantity: ingredient.quantity
      });

      const index = items.value.findIndex(item => item.sku === ingredient.sku);
      if (index !== -1) {
        const cat = categories.value.find(c => c.category_code == ingredient.category_code);
        items.value[index] = { ...ingredient, category: cat ? cat.name : 'Unknown' };
      }
    } catch (error) {
       console.error('Error updating ingredient:', error);
    }
  }

  async function deleteIngredient(sku: string) {
    try {
      await api.delete(`/ingredients?sku=eq.${sku}`);
        
      items.value = items.value.filter(item => item.sku !== sku);
    } catch (error) {
      console.error('Error deleting ingredient:', error);
    }
  }

  return {
    items,
    categories,
    isLoading,
    totalItems,
    totalCategories,
    grandTotalValue,
    fetchIngredients,
    addIngredient,
    updateIngredient,
    deleteIngredient
  };
});
