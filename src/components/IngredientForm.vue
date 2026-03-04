<template>
  <main class="container bg-[#1F291E] max-w-2xl p-6 sm:p-8 rounded-xl shadow-md">
    <div class="header flex flex-col mb-6">
      <header class="font-bold text-[20px] text-amber-50">
        {{ itemToEdit ? 'Edit Ingredient' : 'Add New Ingredient' }}
      </header>
      <h1 class="text-amber-50 mt-1">Enter the details below to update your pantry inventory</h1>
    </div>

    <section class="form-content space-y-8">
      <div class="border-b border-gray-600"></div>

      <form @submit.prevent="handleSubmit" class="text-white grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="flex flex-col">
          <label for="ingredient-name">Ingredient Name</label>
          <input v-model="form.name" type="text" id="ingredient-name" placeholder="e.g. Organic Avocado" required
            class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors">
        </div>

        <div class="flex flex-col md:col-span-2">
          <label for="category">Category</label>
          <select v-model="form.category" id="category"
            class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors">
            <option value="">Select a category</option>
            <option value="produce">Produce</option>
            <option value="m&s">Meat and Seafood</option>
            <option value="d&e">Dairy and Eggs</option>
            <option value="ps">Pantry Staples</option>
            <option value="s&h">Spices and Herbs</option>
          </select>
        </div>

        <div class="flex flex-col">
          <label for="quantity">Quantity</label>
          <input v-model.number="form.quantity" type="number" id="quantity" placeholder="0" min="0" required
            class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors">
        </div>

        <div class="flex flex-col">
          <label for="unit">Unit of Measurement</label>
          <select v-model="form.unit" id="unit" required
            class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors">
            <option value="">Select unit</option>
            <option value="g">Grams (g)</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="ml">Milliliters (ml)</option>
            <option value="l">Liters (l)</option>
            <option value="oz">Ounces (oz)</option>
            <option value="lb">Pounds (lb)</option>
            <option value="p/c">Pieces/Count</option>
          </select>
        </div>

        <div class="flex flex-col">
          <label for="cost">Unit Cost</label>
          <input v-model.number="form.cost" type="number" id="cost" placeholder="... VNĐ" min="0" required
            class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors">
        </div>

        <div class="flex flex-col md:col-span-3">
          <label for="note">Notes <span class="font-light opacity-25">(Optional)</span></label>
          <textarea v-model="form.note" id="note" rows="3"
            class="w-full bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors resize-y"
            placeholder="Add details about brand, expiry date preference, or storage instructions ..."></textarea>
        </div>

        <div class="md:col-span-3 border-t border-gray-600 pt-4 flex justify-end gap-3 mt-4">
          <button type="button" @click="handleCancel"
            class="px-6 py-3 bg-gray-700 text-white font-bold hover:bg-gray-600 rounded transition-colors">
            Cancel
          </button>
          <button type="submit"
            class="px-6 py-3 bg-[#37EC13] text-black font-bold hover:bg-green-500 rounded transition-colors">
            {{ itemToEdit ? 'Update Ingredient' : 'Save Ingredient' }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts"> 
import {reactive, watch} from 'vue'

//Nhận dữ liệu từ Cha truyền xuống (nếu có món cần edit)
const props = defineProps(['itemToEdit']);
//Khai báo các sự kiện sẽ gọi lên cho Cha
const emit = defineEmits(['save', 'cancel-edit'])

//State của Form (Dùng reactive vì là một Object)
const form = reactive({
    name: '', category: '', quantity: 0, unit:'', cost: 0, note: ''
})

//Bơm dữ liệu vào form nếu đang ở chế độ edit
watch(() => props.itemToEdit, (newVal) => {
    if (newVal) {
        Object.assign(form, newVal) //Copy dữ liệu cũ vào form
    } else {
        resetForm()
    }
})
    const resetForm = () => {
        Object.assign(form, {name: '', category: '', quantity: 0, unit:'', cost: 0, note: ''})
    }
    const handleCancel = () => {
        resetForm()
        emit('cancel-edit') //báo cho cha biết là hủy edit rồi
    }
    const handleSubmit = () => {
        emit('save', {...form, id: props.itemToEdit?.id ||Date.now()})
        if (!props.itemToEdit) {
            resetForm(); //Nếu thêm mới thì xóa trắng form sau khi lưu
        }
    }
</script>