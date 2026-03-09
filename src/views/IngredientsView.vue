<template>
  <div class="flex flex-col gap-6 w-full">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-amber-50">Ingredients Management</h2>
        <p class="text-gray-400 text-sm mt-1">Manage all ingredients, quantities, and costs.</p>
      </div>
      
      <!-- Add New Button -->
      <button 
        v-if="!showForm"
        @click="openNewForm" 
        class="bg-[#37EC13] text-[#132210] px-4 py-2 rounded font-bold hover:bg-green-500 transition-colors flex items-center gap-2"
      >
        <Plus class="w-5 h-5" />
        Add Ingredient
      </button>
    </div>

    <!-- Main Content Area -->
    <section class="w-full mt-2">
      
      <!-- Form Section (Conditional) -->
      <div v-if="showForm" class="transition-all w-full max-w-4xl mx-auto">
        <IngredientForm 
          :itemToEdit="editingItem" 
          @save="handleSave"
          @cancel-edit="closeForm"
        />
      </div>

      <!-- List Section (Conditional) -->
      <div v-else class="transition-all w-full">
        <!-- Search & Filter Section -->
        <div class="bg-[#1F291E] p-6 rounded-xl border border-gray-700 shadow-md mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search ingredients by name..."
              class="flex-1 bg-[#121811] p-4 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors rounded text-white"
            />
            
            <select 
              v-model="selectedCategory"
              class="bg-[#121811] p-4 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors rounded text-white min-w-50"
            >
              <option value="">All Categories</option>
              <option value="produce">Produce</option>
              <option value="m&s">Meat and Seafood</option>
              <option value="d&e">Dairy and Eggs</option>
              <option value="ps">Pantry Staples</option>
              <option value="s&h">Spices and Herbs</option>
            </select>
          </div>
        </div>

        <!-- List -->
        <IngredientList 
          :inventory="filteredInventory" 
          @edit="handleEdit" 
          @delete="handleDelete" 
        />

      </div>

    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus } from 'lucide-vue-next';
import { useInventoryStore, type Ingredient } from '@/stores/inventory';
import IngredientForm from '@/components/inventory/IngredientForm.vue';
import IngredientList from '@/components/inventory/IngredientList.vue';

const store = useInventoryStore();

// UI State
const showForm = ref(false);
const editingItem = ref<Ingredient | null>(null);
const searchQuery = ref('');
const selectedCategory = ref('');

// Filter ingredients
const filteredInventory = computed(() => {
  return store.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = selectedCategory.value === '' || item.category === selectedCategory.value;
    
    return matchesSearch && matchesCategory;
  });
});

const openNewForm = () => {
  editingItem.value = null;
  showForm.value = true;
};

const closeForm = () => {
  editingItem.value = null;
  showForm.value = false;
};

const handleSave = (itemData: Ingredient) => {
  if (editingItem.value) {
    store.updateIngredient(itemData);
  } else {
    store.addIngredient(itemData);
  }
  closeForm();
};

const handleEdit = (item: Ingredient) => {
  editingItem.value = item;
  showForm.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleDelete = (id: number) => {
  store.deleteIngredient(id);
};
</script>