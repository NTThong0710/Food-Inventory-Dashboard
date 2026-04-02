<template>
  <main class="w-full bg-[#1F291E] p-9.5 border border-gray-700 shadow-md">
    <div class="header flex flex-col mb-6">
      <header class="font-bold text-[20px] text-amber-50">
        {{ itemToEdit ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới' }}
      </header>
      <p class="text-amber-50 mt-1">Nhập thông tin chi tiết dưới đây để cập nhật kho nguyên liệu</p>
    </div>

    <!-- Thông báo lỗi nếu validation sai -->
    <div v-if="errorMessage.length" class="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
      {{ errorMessage }}
    </div>

    <section class="form-content space-y-8">
      <div class="border-b border-gray-600"></div>

      <form @submit.prevent="handleSubmit" class="text-white grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <BaseInput
          id="ingredient-sku"
          label="Mã vạch (SKU)"
          v-model="form.sku"
          placeholder="e.g. ING_001"
          :disabled="!!itemToEdit"
          required
        />

        <BaseInput
          id="ingredient-name"
          label="Tên nguyên liệu"
          v-model="form.name"
          placeholder="VD: Bơ hữu cơ"
          required
        />

        <BaseSelect
          id="category"
          label="Danh mục"
          v-model="form.category_code"
          required
        >
          <option value="">Pick one</option>
          <option v-for="cat in inventoryStore.categories" :key="cat.category_code" :value="cat.category_code">{{ cat.name }}</option>
        </BaseSelect>

        <BaseInput
          id="quantity"
          type="number"
          label="Số lượng tồn kho"
          v-model.number="form.stock_quantity"
          hint="Tồn kho chỉ thay đổi qua nhập/xóa lô hàng"
          disabled
        >
          <template #suffix>
            <Lock class="w-4 h-4 text-gray-400" />
          </template>
        </BaseInput>

        <BaseSelect
          id="unit"
          label="Đơn vị đo lường"
          v-model="form.unit"
          required
        >
          <option value="">Chọn đơn vị</option>
          <option value="g">Gram (g)</option>
          <option value="kg">Kilogram (kg)</option>
          <option value="ml">Mililit (ml)</option>
          <option value="l">Lít (l)</option>
          <option value="oz">Ounce (oz)</option>
          <option value="lb">Pound (lb)</option>
          <option value="p/c">Cái/Hộp/Khay</option>
        </BaseSelect>

        <!-- Computed Property Display: Hiển thị giá trị tính toán tự động -->
        <div class="md:col-span-3 bg-[#121811] p-4 rounded border border-gray-700 font-bold text-lg flex justify-between">
          <span>Ước lượng tổng chi phí:</span>
          <span class="text-[#37EC13]">{{ estimatedTotal.toLocaleString('vi-VN') }} VND</span>
        </div>

        <div class="md:col-span-3 border-t border-gray-600 pt-4 flex justify-end gap-3 mt-4">
          <button type="button" @click="handleCancel"
            class="px-6 py-3 bg-gray-700 text-white font-bold hover:bg-gray-600 rounded transition-colors">
            Hủy
          </button>
          
          <!-- Nút Save bị vô hiệu hóa (disabled) nếu form không hợp lệ hoặc đang submit -->
          <button type="submit" :disabled="!isFormValid || isSubmitting"
            class="px-6 py-3 font-bold rounded transition-colors flex items-center justify-center gap-2"
            :class="isFormValid && !isSubmitting ? 'bg-[#37EC13] text-black hover:bg-green-500' : 'bg-gray-600 text-gray-400 cursor-not-allowed'">
            <span v-if="isSubmitting" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            {{ isSubmitting ? 'Đang lưu...' : (itemToEdit ? 'Cập nhật' : 'Lưu lại') }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts"> 
import { reactive, watch, computed, onMounted } from 'vue'
import { useInventoryStore } from '@/features/inventory/store'
import { Lock } from 'lucide-vue-next'
import BaseInput from '@/shared/components/ui/BaseInput.vue'
import BaseSelect from '@/shared/components/ui/BaseSelect.vue'

const props = defineProps({
  itemToEdit: { type: Object, default: null },
  isSubmitting: { type: Boolean, default: false }
});
const emit = defineEmits(['save', 'cancel-edit'])

const inventoryStore = useInventoryStore();

const form = reactive({
    sku: '', name: '', category_code: '', stock_quantity: 0, unit:'', unit_cost: 0
})

// onMounted chạy một lần khi component đã render xong
onMounted (()=>{
  if (!props.itemToEdit) {
  const saved = localStorage.getItem('ingredient-form') // key cố định
  if (saved) Object.assign(form, JSON.parse(saved)) // Copy dữ liệu cũ vào form hiện tại
  }
  //json parse là chuyển string sang object
})

watch (form , (val) => {
  if (!props.itemToEdit) {
  localStorage.setItem('ingredient-form', JSON.stringify(val))
  }
}, {deep: true})
// bắt buộc phải có deep: true vì form là object, nếu không có thì chỉ theo dõi được khi form được gán lại (form = {...}) chứ không theo dõi được khi chỉ thay đổi 1 thuộc tính (form.sku = '...')


// COMPUTED: Tự động tính toán giá trị mới từ dữ liệu có sẵn.
// Khác với function thường, computed sẽ được Vue Caching (nhớ lại).
// Nó chỉ tính lại TỔNG (quantity * cost) khi 1 trong 2 số này thay đổi.
const estimatedTotal = computed(() => {
    return form.stock_quantity * form.unit_cost;
})

// 2. COMPUTED (Validation): Kiểm tra xem form có điền đủ thông tin quan trọng không
const isFormValid = computed(() => {
    return form.sku.trim() !== '' && form.name.trim() !== '' && form.category_code !== '' && errorMessage.value === ''
})

const resetForm = () => {
    Object.assign(form, {sku: '', name: '', category_code: '', stock_quantity: 0, unit:'', unit_cost: 0, production_date: '', expiry_date: ''})
}

const errorMessage = computed(() => {
  if (form.unit_cost < 0 ) return "Giá trị không thể nhỏ hơn 0";

  const discreteUnits = ['p/c', 'cái', 'hộp', 'khay', 'chai', 'lon', 'cuộn', 'bao', 'gói'];
  const isDiscrete = discreteUnits.some(u => form.unit.toLowerCase().includes(u));
  if (isDiscrete && form.stock_quantity && !Number.isInteger(form.stock_quantity)) {
    return `Tồn kho hiện tại (${form.stock_quantity}) là số thập phân, không phù hợp với đơn vị đo lường này.`;
  }
  
  return "";
});

// Bơm dữ liệu vào form nếu đang ở chế độ edit
watch(() => props.itemToEdit, (newVal) => {
    if (newVal) {
        Object.assign(form, {
          sku: newVal.sku,
          name: newVal.name,
          category_code: newVal.category_code,
          stock_quantity: newVal.quantity,
          unit: newVal.unit,
          unit_cost: newVal.cost
        })
    }
}, { immediate: true })
// immediate: true để chạy luôn hàm watch một lần khi component được tạo ra, giúp điền form ngay lập tức nếu đã có itemToEdit

const handleCancel = () => {
    resetForm()
    localStorage.removeItem('ingredient-form')
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
        note: '' // Tạm thời để trống
    };
    emit('save', payload)
    if (!props.itemToEdit) {
        resetForm(); // Nếu thêm mới thì xóa trắng form sau khi lưu
        localStorage.removeItem('ingredient-form');
    }
}
</script>
