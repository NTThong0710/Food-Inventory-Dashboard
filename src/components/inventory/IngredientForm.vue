<template>
  <main class="w-full bg-[#1F291E] p-6 rounded-xl border border-gray-700 shadow-md">
    <div class="header flex flex-col mb-6">
      <header class="font-bold text-[20px] text-amber-50">
        {{ itemToEdit ? 'Edit Ingredient' : 'Add New Ingredient' }}
      </header>
      <h1 class="text-amber-50 mt-1">Enter the details below to update your pantry inventory</h1>
    </div>

    <!-- Error message display if validation fails -->
    <div v-if="errorMessage" class="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
      {{ errorMessage }}
    </div>

    <section class="form-content space-y-8">
      <div class="border-b border-gray-600"></div>

      <form @submit.prevent="handleSubmit" class="text-white grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="flex flex-col">
          <label for="ingredient-name">Ingredient Name</label>
          <!-- v-model: Tạo liên kết 2 chiều. Khi bạn gõ phím, form.name tự động cập nhật và ngược lại -->
          <input v-model="form.name" type="text" id="ingredient-name" placeholder="e.g. Organic Avocado" required
            class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors">
        </div>

        <div class="flex flex-col md:col-span-2">
          <label for="category">Category</label>
          <select v-model="form.category" id="category" required
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
          <input v-model.number="form.quantity" type="number" id="quantity" placeholder="0" required
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
          <input v-model.number="form.cost" type="number" id="cost" placeholder="... VNĐ" required
            class="bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors">
        </div>

        <div class="flex flex-col md:col-span-3">
          <label for="note">Notes <span class="font-light opacity-25">(Optional)</span></label>
          <textarea v-model="form.note" id="note" rows="3"
            class="w-full bg-[#121811] p-4 mt-2 border border-transparent hover:border-[#37EC13] focus:outline-none focus:border-[#37EC13] transition-colors resize-y"
            placeholder="Add details about brand, expiry date preference, or storage instructions ..."></textarea>
        </div>

        <!-- Computed Property Display: Hiển thị giá trị tính toán tự động -->
        <div class="md:col-span-3 bg-[#121811] p-4 rounded border border-gray-700 font-bold text-lg flex justify-between">
          <span>Estimated Total Cost for this form:</span>
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

const props = defineProps(['itemToEdit']);
const emit = defineEmits(['save', 'cancel-edit'])

const form = reactive({
    name: '', category: '', quantity: 0, unit:'', cost: 0, note: ''
})

const errorMessage = ref('')

// 1. COMPUTED: Tự động tính toán giá trị mới từ dữ liệu có sẵn.
// Khác với function thường, computed sẽ được Vue Caching (nhớ lại).
// Nó chỉ tính lại TỔNG (quantity * cost) khi 1 trong 2 số này thay đổi.
const estimatedTotal = computed(() => {
    return form.quantity * form.cost;
})

// 2. COMPUTED (Validation): Kiểm tra xem form có điền đủ thông tin quan trọng không
const isFormValid = computed(() => {
    return form.name.trim() !== '' && form.category !== '' && form.quantity > 0 && form.cost > 0 && errorMessage.value === ''
})

const resetForm = () => {
    Object.assign(form, {name: '', category: '', quantity: 0, unit:'', cost: 0, note: ''})
    errorMessage.value = ''; // Reset luôn cả lỗi
}

// 3. WATCH (Theo dõi sự thay đổi): Ở đây mình xài Watch để theo dõi xem người dùng có nhập số âm không.
// Nếu nhập số âm (hoặc bằng zero) thì mình báo lỗi thẳng mặt liền.
watch(
    () => [form.quantity, form.cost] as const, // Định nghĩa as const để TS hiểu đây là mảng cố định [number, number]
    ([newQuantity, newCost]) => { // Theo dõi cùng lúc 2 biến
        if (newQuantity < 0 || newCost < 0) {
            errorMessage.value = "Quantity and Unit Cost cannot be negative numbers!";
        } else if (newQuantity === 0 && newCost > 0) {
            errorMessage.value = "Quantity should be greater than 0!";
        } else {
            errorMessage.value = ""; // Xóa lỗi nếu nhập đúng
        }
    }
)

// Bơm dữ liệu vào form nếu đang ở chế độ edit
watch(() => props.itemToEdit, (newVal) => {
    if (newVal) {
        form.name = newVal.name
        form.category = newVal.category
        form.quantity = newVal.quantity
        form.unit = newVal.unit
        form.cost = newVal.cost
        form.note = newVal.note
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
    emit('save', {...form, id: props.itemToEdit?.id || Date.now()})
    if (!props.itemToEdit) {
        resetForm(); // Nếu thêm mới thì xóa trắng form sau khi lưu
    }
}
</script>
