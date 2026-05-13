import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/shared/lib/axios';

export interface SaleRecord {
  id: string;
  dish_code: string;
  dish_name: string;
  quantity: number;
  revenue: number;
  profit: number;
  created_at: string;
}

export const useSalesStore = defineStore('sales', () => {
  const items = ref<SaleRecord[]>([]);

  const fetchSales = async () => {
    const { data } = await api.get('/sales?order=created_at.desc');
    if (data && Array.isArray(data)) items.value = data;
  };

  const addSale = async (saleData: Omit<SaleRecord, 'id' | 'created_at'>) => {
    await api.post('/sales', saleData);
  };

  return {
    items,
    fetchSales,
    addSale
  };
});
