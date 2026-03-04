<template>
  <section class="container bg-[#1F291E] max-w-2xl p-6 sm:p-8 rounded-xl text-white">
    <h2 class="text-xl font-bold text-[#37EC13] mb-6">Inventory List</h2>

    <div class="space-y-4 mb-6 min-h-25">
      <p v-if="inventory.length === 0" class="text-gray-400 italic text-center mt-4">
        No ingredients added yet.
      </p>

      <div v-for="item in inventory" :key="item.id" 
           class="bg-[#121811] p-4 rounded border border-gray-700 flex justify-between items-center">
        <div>
          <h3 class="font-bold text-lg text-[#37EC13]">
            {{ item.name }} 
            <span class="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded ml-2 uppercase">{{ item.category }}</span>
            <span class="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded ml-2 ">{{ item.unit }}</span>
          </h3>
          <p class="text-sm text-gray-300 mt-1">{{ item.quantity }} x {{ item.cost.toLocaleString() }} VND</p>
        </div>
        
        <div class="flex items-center gap-4">
          <span class="font-bold text-amber-50">{{ (item.quantity * item.cost).toLocaleString() }} VND</span>
          <div class="flex gap-2 ml-4">
            <button @click="$emit('edit', item)" class="text-blue-400 hover:text-blue-300 transition">Edit</button>
            <button @click="$emit('delete', item.id)" class="text-red-400 hover:text-red-300 transition">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-600 pt-6 flex justify-between items-center text-lg mt-4">
      <span class="font-bold">Total Inventory Value:</span>
      <span class="text-2xl font-bold text-amber-50">{{ grandTotal.toLocaleString() }} VND</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Nhận mảng inventory từ Thằng Cha
const props = defineProps<{
  inventory: Array<{
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    cost: number;
    note: string;
  }>
}>();
// Khai báo sự kiện báo lên Cha (không cần dùng biến emit vì template dùng $emit)
defineEmits(['edit', 'delete']);

// Tự động tính tổng (tương đương với reduce hôm trước)
const grandTotal = computed(() => {
  return props.inventory.reduce((acc: number, cur) => acc + (cur.quantity * cur.cost), 0);
});
</script>