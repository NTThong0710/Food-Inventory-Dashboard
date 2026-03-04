<template>
  <div class="bg-[#132210] min-h-screen p-4 py-10 font-sans flex flex-col items-center gap-8">
    
    <IngredientForm 
      :itemToEdit="editingItem" 
      @save="handleSave"
      @cancel-edit="editingItem = null"
    />

    <IngredientList 
      :inventory="inventory" 
      @edit="handleEdit" 
      @delete="handleDelete" 
    />

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IngredientForm from './components/IngredientForm.vue';
import IngredientList from './components/IngredientList.vue';

interface Ingredient {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cost: number;
  note: string;
}

// STATE: Sổ cái lưu toàn bộ dữ liệu (Thay vì let inventory = [], ta dùng ref)
const inventory = ref<Ingredient[]>([]);

// STATE: Biến cờ đánh dấu món đang sửa (Thay cho editingId = null)
const editingItem = ref<Ingredient | null>(null);

// Hành động khi Form báo có dữ liệu mới (Create & Update)
const handleSave = (itemData: Ingredient) => {
  if (editingItem.value) {
    // UPDATE: Tìm index và ghi đè
    const index = inventory.value.findIndex(item => item.id === editingItem.value?.id);
    if (index !== -1) {
      inventory.value[index] = itemData;
    }
    editingItem.value = null; // Sửa xong thì tắt chế độ edit
  } else {
    // CREATE: Thêm mới vào mảng
    inventory.value.push(itemData);
  }
};

// Hành động khi bấm Edit ở Danh sách
const handleEdit = (item: Ingredient) => {
  editingItem.value = item;
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
};

// Hành động khi bấm Delete ở Danh sách
const handleDelete = (id: number) => {
  inventory.value = inventory.value.filter(item => item.id !== id);
};
</script>