import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/shared/lib/axios';

// Map TS interfaces to Supabase schema
export interface Category {
  category_code: string;
  name: string;
}

export interface SupplierPrice {
  supplier_code: string;
  supplier_name: string;
  price: number;
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
  supplier_prices?: SupplierPrice[];
}

export interface AIForecast {
  id: string;
  ingredient_sku: string;
  ingredient_name?: string;
  forecast_date: string;
  predicted_quantity: number;
  confidence_lower?: number;
  confidence_upper?: number;
}

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<Ingredient[]>([]);
  const categories = ref<Category[]>([]);
  const aiForecasts = ref<AIForecast[]>([]);
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

      // 2. Fetch ingredients with batches to estimate average cost and latest expiry and also fetch supplier quotes
      const { data } = await api.get('/ingredients?deleted_at=is.null&select=*,inventory_batches(*),supplier_ingredients(*,suppliers(name))&order=created_at.desc');
      
      // Map DB fields to Component interfaces
      if (data && Array.isArray(data)) {
        items.value = data.map((dbItem: any) => {
          const cat = categories.value.find(c => c.category_code == dbItem.category_code);
          const batches = dbItem.inventory_batches || [];
          // Explicitly sort batches by received_at to get the latest one
          const sortedBatches = [...batches].sort((a: any, b: any) => new Date(a.received_at).getTime() - new Date(b.received_at).getTime());
          const latestBatch = sortedBatches.length > 0 ? sortedBatches[sortedBatches.length - 1] : null;

          const sPrices: SupplierPrice[] = (dbItem.supplier_ingredients || []).map((si: any) => ({
            supplier_code: si.supplier_code,
            supplier_name: si.suppliers ? si.suppliers.name : 'Unknown',
            price: si.quoted_price
          }));

          return {
            sku: dbItem.sku,
            name: dbItem.name,
            category: cat ? cat.name : 'Unknown',
            category_code: dbItem.category_code,
            quantity: dbItem.stock_quantity,
            unit: dbItem.unit,
            cost: sPrices?.[0]?.price ?? (latestBatch ? latestBatch.unit_cost : 0),
            production_date: latestBatch ? latestBatch.production_date : undefined,
            expiry_date: latestBatch ? latestBatch.expiry_date : undefined,
            note: '',
            supplier_prices: sPrices
          };
        });
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAiForecasts() {
    try {
      // Get forecasts for the next 7 days
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const { data } = await api.get(`/ai_forecasts?forecast_date=gte.${today}&forecast_date=lte.${nextWeekStr}&select=*,ingredients(name)&order=forecast_date.asc`);
      
      if (data && Array.isArray(data)) {
        aiForecasts.value = data.map((item: any) => ({
          id: item.id,
          ingredient_sku: item.ingredient_sku,
          ingredient_name: item.ingredients?.name || 'Unknown',
          forecast_date: item.forecast_date,
          predicted_quantity: item.predicted_quantity,
          confidence_lower: item.confidence_lower,
          confidence_upper: item.confidence_upper
        }));
      }
    } catch (error) {
      console.error('Error fetching AI forecasts:', error);
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
            note: '',
            supplier_prices: []
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
      // Soft delete: cập nhật deleted_at thay vì xóa thật
      await api.patch(`/ingredients?sku=eq.${sku}`, {
        deleted_at: new Date().toISOString()
      });
        
      items.value = items.value.filter(item => item.sku !== sku);
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      throw error; // Re-throw để caller (IngredientsView) có thể hiển thị toast lỗi
    }
  }

 return {
    items,
    categories,
    aiForecasts,
    isLoading,
    totalItems,
    totalCategories,
    grandTotalValue,
    fetchIngredients,
    fetchAiForecasts,
    addIngredient,
    updateIngredient,
    deleteIngredient
  };
});
