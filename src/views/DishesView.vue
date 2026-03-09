<template>
  <div class="flex flex-col gap-6 w-full">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-white">Dishes Management</h2>
        <p class="text-gray-400 text-sm mt-1">Manage all dishes</p>
      </div>
      <button class="bg-[#37EC13] text-[#132210] px-4 py-2 font-bold rounded flex items-center justify-center gap-2">
        <Plus class="w-5 h-5"/>
         Add Dishes
      </button>
    </div>

    <section class="w-full mt-2">
      <div v-if="showDishForm" class="transition-all w-full max-w-4xl mx-auto">
        <DishForm/>
      </div>
      <div v-else class="transition-all w-full">
        <div class="bg-[#1F291E] p-6 rounded-xl border border-gray-700 shadow-md mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <input
               
              type="text" 
              placeholder="Search Dishes by name..."
              class="flex-1 bg-[#121811] p-4 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors rounded text-white"
            />
            <select
              
              class="bg-[#121811] p-4 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-color rounded text-white min-w-50"
            >
              <option value="">All categories</option>
              <option value="produce">Produce</option>
              <option value="m&s">Meat and Seafood</option>
              <option value="d&e">Dairy and Eggs</option>
              <option value="ps">Pantry Staples</option>
              <option value="s&h">Spices and Herbs</option>
            </select>
          </div>
          <DishList/>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import DishForm from '@/components/dishes/DishForm.vue';
import DishList from '@/components/dishes/DishList.vue';
import { Plus } from 'lucide-vue-next';

import { ref, computed} from 'vue'

// const store = useDishStore();

const showDishForm = ref(false)
const editingItem = ref (null)
const searchQuery = ref('')
</script>
