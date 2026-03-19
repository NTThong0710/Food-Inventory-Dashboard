import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/lib/axios';

export interface Supplier {
  supplier_code: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
}

export const useSuppliersStore = defineStore('suppliers', () => {
  const items = ref<Supplier[]>([]);
  const isLoading = ref(false);

  async function fetchSuppliers() {
    isLoading.value = true;
    try {
      const { data } = await api.get('/suppliers?order=created_at.desc');

      if (data && Array.isArray(data)) {
        items.value = data as Supplier[];
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
