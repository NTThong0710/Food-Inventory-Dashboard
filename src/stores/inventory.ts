import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export interface Ingredient {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cost: number;
  note: string;
}

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<Ingredient[]>([]);

  // Load from local storage
  const savedInventory = localStorage.getItem('food-management-inventory');
  if (savedInventory) {
    items.value = JSON.parse(savedInventory);
  }

  // Watch and save to local storage
  watch(items, (newVal) => {
    localStorage.setItem('food-management-inventory', JSON.stringify(newVal));
  }, { deep: true });

  const totalItems = computed(() => items.value.length);
  const totalCategories = computed(() => {
    const uniqueCategories = new Set(items.value.map(item => item.category));
    return uniqueCategories.size;
  });
  const grandTotalValue = computed(() => {
    return items.value.reduce((acc, item) => acc + (item.quantity * item.cost), 0);
  });

  function addIngredient(ingredient: Ingredient) {
    items.value.push(ingredient);
  }

  function updateIngredient(ingredient: Ingredient) {
    const index = items.value.findIndex(item => item.id === ingredient.id);
    if (index !== -1) {
      items.value[index] = ingredient;
    }
  }

  function deleteIngredient(id: number) {
    items.value = items.value.filter(item => item.id !== id);
  }

  return {
    items,
    totalItems,
    totalCategories,
    grandTotalValue,
    addIngredient,
    updateIngredient,
    deleteIngredient
  };
});
