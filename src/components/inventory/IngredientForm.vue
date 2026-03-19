<template>
  <main class="w-full bg-[#1F291E] p-6 border border-gray-700 shadow-md">
    <div class="header flex flex-col mb-6">
      <header class="font-bold text-[20px] text-amber-50">
        {{ itemToEdit ? 'Edit Ingredient' : 'Add New Ingredient' }}
      </header>
      <p class="text-amber-50 mt-1">Enter the details below to update your pantry inventory</p>
    </div>

    <!-- Thông báo lỗi nếu validation sai -->
    <div v-if="errorMessage.length" class="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
      {{ errorMessage }}
    </div>

    <section class="form-content space-y-8">
      <div class="border-b border-gray-600"></div>

      <form @submit.prevent="handleSubmit" class="text-white grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="flex flex-col">
          <label for="ingredient-sku">SKU Code</label>
          <input v-model="form.sku" type="text" id="ingredient-sku" placeholder="e.g. ING_001" required :disabled="!!itemToEdit"
            class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors disabled:opacity-50">
        </div>

        <div class="flex flex-col">
          <label for="ingredient-name">Ingredient Name</label>
          <!-- v-model: Tạo liên kết 2 chiều. Khi bạn gõ phím, form.name tự động cập nhật và ngược lại -->
          <input v-model="form.name" type="text" id="ingredient-name" placeholder="e.g. Organic Avocado" required
            class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors">
        </div>

        <div class="flex flex-col md:col-span-1">
          <label for="category">Category</label>
          <select v-model="form.category_code" id="category" required
            class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors">
            <option value="">Select a category</option>
            <option v-for="cat in inventoryStore.categories" :key="cat.category_code" :value="cat.category_code">{{ cat.name }}</option>
          </select>
        </div>

        <div class="flex flex-col">
          <label for="production-date">Production Date</label>
          <input v-model="form.production_date" type="date" id="production-date"
            class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors">
        </div>

        <div class="flex flex-col">
          <label for="expired-date">Expiry Date</label>
          <input v-model="form.expiry_date" type="date" id="expired-date"
            class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors">
        </div>

        <div class="flex flex-col">
          <label for="quantity">Stock Quantity</label>
          <input v-model.number="form.stock_quantity" type="number" inputmode="numeric" id="quantity" placeholder="0" required
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
          <label for="cost">Unit Cost (VND)</label>
          <input v-model.number="form.unit_cost" type="number" inputmode="numeric" id="cost" placeholder="0" required
            class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors">
        </div>

        <!-- <div class="flex flex-col md:col-span-3">
          <label for="note">Notes <span class="font-light opacity-25">(Optional)</span></label>
          <p class="text-gray-400 text-sm mt-1">Add any additional information about this ingredient (brand, storage, etc.)</p>
          <textarea id="note" row="3" placeholder="Enter notes here..."
          class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors resize-y"></textarea>
        </div> -->

        <!-- Computed Property Display: Hiển thị giá trị tính toán tự động -->
        <div class="md:col-span-3 bg-[#121811] p-4 rounded border border-gray-700 font-bold text-lg flex justify-between">
          <span>Estimated Total Cost:</span>
          <span class="text-[#37EC13]">{{ estimatedTotal.toLocaleString() }} VND</span>
        </div>

        <div class="md:col-span-3 border-t border-gray-600 pt-4 flex justify-end gap-3 mt-4">
          <button type="button" @click="handleCancel"
            class="px-6 py-3 bg-gray-700 text-white font-bold hover:bg-gray-600 rounded transition-colors">
            Cancel
          </button>
          
          <!-- Nút Save bị vô hiệu hóa (disabled) nếu form không hợp lệ (computed: isFormValid = false) -->
          <button type="submit" :disabled="!isFormValid"
            class="px-6 py-3 font-bold rounded transition-colors"
            :class="isFormValid ? 'bg-[#37EC13] text-black hover:bg-green-500' : 'bg-gray-600 text-gray-400 cursor-not-allowed'">
            {{ itemToEdit ? 'Update Ingredient' : 'Save Ingredient' }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts"> 
import { ref, reactive, watch, computed } from 'vue'
import { useInventoryStore } from '@/stores/inventory'

const props = defineProps(['itemToEdit']);
const emit = defineEmits(['save', 'cancel-edit'])

const inventoryStore = useInventoryStore();

const form = reactive({
    sku: '', name: '', category_code: '', stock_quantity: 0, unit:'', unit_cost: 0, production_date: new Date().toLocaleDateString(), expiry_date: new Date().toLocaleDateString('en-CA')
})


// COMPUTED: Tự động tính toán giá trị mới từ dữ liệu có sẵn.
// Khác với function thường, computed sẽ được Vue Caching (nhớ lại).
// Nó chỉ tính lại TỔNG (quantity * cost) khi 1 trong 2 số này thay đổi.
const estimatedTotal = computed(() => {
    return form.stock_quantity * form.unit_cost;
})

// 2. COMPUTED (Validation): Kiểm tra xem form có điền đủ thông tin quan trọng không
const isFormValid = computed(() => {
    return form.sku.trim() !== '' && form.name.trim() !== '' && form.category_code !== '' && form.stock_quantity >= 0 && errorMessage.value === ''
})

const resetForm = () => {
    Object.assign(form, {sku: '', name: '', category_code: '', stock_quantity: 0, unit:'', unit_cost: 0, production_date: '', expiry_date: ''})
}

const errorMessage = computed ( () => {
  
  const { stock_quantity, unit_cost, expiry_date, production_date } = form

  if (stock_quantity < 0 || unit_cost < 0 ) return "Stock quantity and unit cost cannot be negative numbers"

  if (stock_quantity === 0 && unit_cost > 0) {
    return "Stock Quantity should be greater than 0!";
  }

  if (expiry_date && production_date) {
    const expired = new Date(expiry_date);
    const prod = new Date(production_date);
    if (expired <= prod) {
      return "Please type Expired date greater than Production date!";
    }
  }

  
  return ""

});

// Bơm dữ liệu vào form nếu đang ở chế độ edit
watch(() => props.itemToEdit, (newVal) => {
    if (newVal) {
        form.sku = newVal.sku
        form.name = newVal.name
        form.category_code = newVal.category_code
        form.stock_quantity = newVal.quantity
        form.unit = newVal.unit
        form.unit_cost = newVal.cost
        form.production_date = newVal.production_date || ''
        form.expiry_date = newVal.expiry_date || ''
    } else {
        resetForm()
    }
}, { immediate: true, deep: true })

const handleCancel = () => {
    resetForm()
    emit('cancel-edit') // báo cho cha biết là hủy edit rồi
}

const handleSubmit = () => {
    if(!isFormValid.value) return; // Bảo vệ hàm submit, cấm submit nếu form sai

    const payload = {
        sku: form.sku,
        name: form.name,
        category_code: form.category_code,
        quantity: form.stock_quantity, 
        cost: form.unit_cost,          
        unit: form.unit,
        production_date: form.production_date,
        expiry_date: form.expiry_date,
        note: '' // Tạm thời để trống
    };
    emit('save', payload)
    if (!props.itemToEdit) {
        resetForm(); // Nếu thêm mới thì xóa trắng form sau khi lưu
    }
}
</script>
