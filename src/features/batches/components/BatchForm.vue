<template>
  <div class="bg-[#1F291E] border border-gray-700 rounded-xl p-6 shadow-md text-white">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h3 class="font-bold text-[20px] text-amber-50">
          {{ isEditing ? 'Chỉnh sửa lô hàng' : 'Nhập lô hàng mới' }}
        </h3>
        <p class="text-gray-400 text-sm mt-1">Nhập thông tin chi tiết lô hàng nhập kho</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium flex items-center gap-2">
      <AlertCircle class="w-5 h-5 shrink-0"/> {{ errorMessage }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Batch Code -->
        <div class="md:col-span-2 relative">
          <BaseInput
            id="b-code"
            label="Mã lô hàng"
            v-model="formData.batch_code"
            :disabled="isEditing"
            required
            :placeholder="generatedCode"
            inputClass="font-mono text-sm"
          />
          <p v-if="!isEditing && !formData.batch_code" class="text-[10px] text-gray-500 mt-1 pl-1">
            Gợi ý: <span class="text-[#37EC13] cursor-pointer hover:underline" @click="formData.batch_code = generatedCode" title="Nhấn để sử dụng mã này">{{ generatedCode }}</span>
          </p>
          <p v-else-if="!isEditing && formData.batch_code" class="text-[10px] text-gray-500 mt-1 pl-1">
            Xóa trống để sử dụng mã tự động
          </p>
        </div>

        <!-- EXISTING ingredient selector -->
        <template v-if="!isNewIngredient">
          <BaseSelect
            id="b-ingredient"
            label="Nguyên liệu"
            v-model="formData.ingredient_sku"
            required
            placeholder="Chọn nguyên liệu..."
          >
            <option v-for="ing in inventoryStore.items" :key="ing.sku" :value="ing.sku">
              {{ ing.name }} ({{ ing.sku }})
            </option>
          </BaseSelect>
        </template>

        <!-- NEW ingredient fields -->
        <template v-if="isNewIngredient">
          <BaseInput id="new-ing-sku" label="Mã SKU" v-model="newIngredient.sku" required placeholder="VD: SKU_MILK_01" inputClass="font-mono text-sm" />
          <BaseInput id="new-ing-name" label="Tên nguyên liệu" v-model="newIngredient.name" required placeholder="VD: Sữa tươi" />
          <BaseInput id="new-ing-unit" label="Đơn vị tính" v-model="newIngredient.unit" required placeholder="VD: lít, kg, hộp..." />
          <BaseSelect id="new-ing-cat" label="Danh mục" v-model="newIngredient.category_code">
            <option value="">Không chọn</option>
            <option v-for="cat in inventoryStore.categories" :key="cat.category_code" :value="cat.category_code">{{ cat.name }}</option>
          </BaseSelect>
        </template>

        <!-- Supplier (always shown, full width when new ingredient mode) -->
        <BaseSelect
          id="b-supplier"
          label="Nhà cung cấp"
          v-model="formData.supplier_code"
          required
          placeholder="Chọn nhà cung cấp..."
          :class="isNewIngredient ? 'md:col-span-2' : ''"
        >
          <option v-for="sup in activeSuppliers" :key="sup.supplier_code" :value="sup.supplier_code">
            {{ sup.name }} ({{ sup.supplier_code }})
          </option>
          <option v-if="activeSuppliers.length === 0" disabled value="">Không có nhà cung cấp đang hoạt động</option>
        </BaseSelect>

        <BaseInput id="b-qty" type="number" label="Số lượng" min="0" v-model.number="formData.quantity" required 
        @keydown="preventNegative"
        @input="formData.quantity = Math.max(0,formData.quantity || 0)"
        step="any" placeholder="0" />
        <BaseInput id="b-cost" type="number" label="Đơn giá (VND)" v-model.number="formData.unit_cost" required min="0" step="any" placeholder="0" />
        <BaseInput id="b-prod" type="date" label="Ngày sản xuất" v-model="formData.production_date" />
        <BaseInput id="b-exp" type="date" label="Hạn sử dụng" v-model="formData.expiry_date" />
      </div>

      <!-- Computed Total -->
      <div v-if="formData.quantity && formData.unit_cost" class="p-4 bg-[#132210] rounded-lg border border-[#2A362C]">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-400">Tổng giá trị lô hàng</span>
          <span class="text-lg font-bold text-[#37EC13]">{{ formatCurrency(formData.quantity * formData.unit_cost) }}</span>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end gap-3 pt-6 border-t border-gray-600 mt-6">
        <button type="button" @click="$emit('cancel-edit')" class="px-6 py-3 bg-gray-700 text-white font-bold hover:bg-gray-600 rounded transition-colors">
          Hủy
        </button>
        <button type="submit" :disabled="isSubmitting" class="px-6 py-3 rounded font-bold transition-colors flex items-center justify-center gap-2" :class="isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#37EC13] text-black hover:bg-green-500'">
          <span v-if="isSubmitting" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          {{ isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Nhập kho') }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { AlertCircle, Plus } from 'lucide-vue-next';
import BaseInput from '@/shared/components/ui/BaseInput.vue';
import BaseSelect from '@/shared/components/ui/BaseSelect.vue';
import type { Batch } from '@/features/batches/store';
import { useInventoryStore } from '@/features/inventory/store';
import { useSuppliersStore } from '@/features/suppliers/store';

const inventoryStore = useInventoryStore();
const suppliersStore = useSuppliersStore();

// Chỉ cho phép chọn nhà cung cấp đang Active
const activeSuppliers = computed(() => suppliersStore.items.filter(s => s.status === 'Active'));

onMounted(async () => {
  if (inventoryStore.items.length === 0) await inventoryStore.fetchIngredients();
  if (suppliersStore.items.length === 0) await suppliersStore.fetchSuppliers();
});

const props = defineProps<{
  itemToEdit: Batch | null;
  isSubmitting?: boolean;
}>();

const emit = defineEmits(['save', 'cancel-edit']);

const isEditing = computed(() => !!props.itemToEdit);
const errorMessage = ref('');
const isNewIngredient = ref(false);

const newIngredient = ref({
  sku: '',
  name: '',
  unit: '',
  category_code: '',
});

const generatedCode = computed(() => {
  const sku = isNewIngredient.value ? (newIngredient.value.sku || 'SKU') : (formData.value.ingredient_sku || 'SKU');
  return `BATCH_${sku}_${Date.now()}`;
});

const formData = ref<Batch>({
  batch_code: '',
  ingredient_sku: '',
  ingredient_name: '',
  ingredient_unit: '',
  supplier_code: '',
  supplier_name: '',
  quantity: 0,
  unit_cost: 0,
  production_date: null,
  expiry_date: null,
  received_at: '',
});

watch(() => props.itemToEdit, (newVal) => {
  if (newVal) {
    formData.value = JSON.parse(JSON.stringify(newVal));
    isNewIngredient.value = false;
  } else {
    resetForm();
  }
  errorMessage.value = '';
}, { immediate: true });

watch(
  [() => formData.value.ingredient_sku, () => formData.value.supplier_code],
  ([newSku, newSup], [oldSku, oldSup]) => {
    if (!isEditing.value && newSku && newSup && (newSku !== oldSku || newSup !== oldSup)) {
      const supplier = suppliersStore.items.find(s => s.supplier_code === newSup);
      if (supplier && supplier.ingredients) {
        const quoted = supplier.ingredients.find(i => i.ingredient_sku === newSku);
        if (quoted && quoted.quoted_price > 0) {
          formData.value.unit_cost = quoted.quoted_price;
        }
      }
    }
  }
);

function resetForm() {
  formData.value = {
    batch_code: '',
    ingredient_sku: '',
    ingredient_name: '',
    ingredient_unit: '',
    supplier_code: '',
    supplier_name: '',
    quantity: 0,
    unit_cost: 0,
    production_date: null,
    expiry_date: null,
    received_at: '',
  };
  newIngredient.value = { sku: '', name: '', unit: '', category_code: '' };
  isNewIngredient.value = false;
}

function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}

function handleSubmit() {
  errorMessage.value = '';

  // Validate ingredient
  if (isNewIngredient.value) {
    if (!newIngredient.value.sku.trim()) {
      errorMessage.value = 'Vui lòng nhập mã SKU cho nguyên liệu mới.';
      return;
    }
    if (!newIngredient.value.name.trim()) {
      errorMessage.value = 'Vui lòng nhập tên nguyên liệu mới.';
      return;
    }
    if (!newIngredient.value.unit.trim()) {
      errorMessage.value = 'Vui lòng nhập đơn vị tính.';
      return;
    }
    // Check duplicate SKU
    const exists = inventoryStore.items.some(i => i.sku.toLowerCase() === newIngredient.value.sku.toLowerCase());
    if (exists) {
      errorMessage.value = 'Mã SKU đã tồn tại. Vui lòng chọn từ danh sách có sẵn.';
      return;
    }
    // Set the ingredient_sku from the new ingredient
    formData.value.ingredient_sku = newIngredient.value.sku;
    formData.value.ingredient_name = newIngredient.value.name;
    formData.value.ingredient_unit = newIngredient.value.unit;
  } else {
    if (!formData.value.ingredient_sku) {
      errorMessage.value = 'Vui lòng chọn nguyên liệu.';
      return;
    }
  }

  if (!formData.value.supplier_code) {
    errorMessage.value = 'Vui lòng chọn nhà cung cấp.';
    return;
  }
  // Kiểm tra nhà cung cấp phải đang Active
  const selectedSupplier = suppliersStore.items.find(s => s.supplier_code === formData.value.supplier_code);
  if (selectedSupplier && selectedSupplier.status !== 'Active') {
    errorMessage.value = `Nhà cung cấp "${selectedSupplier.name}" hiện không hoạt động. Vui lòng chọn nhà cung cấp khác.`;
    return;
  }
  if (formData.value.unit_cost < 0) {
    errorMessage.value = 'Đơn giá không được âm.';
    return;
  }
  if (formData.value.production_date && formData.value.expiry_date && formData.value.expiry_date <= formData.value.production_date) {
    errorMessage.value = 'Hạn sử dụng phải sau ngày sản xuất.';
    return;
  }

  // Validation: integer quantity for discrete units
  let selectedUnit = '';
  if (isNewIngredient.value) {
    selectedUnit = newIngredient.value.unit.toLowerCase();
  } else {
    const ing = inventoryStore.items.find(i => i.sku === formData.value.ingredient_sku);
    if (ing) {
      selectedUnit = (ing.unit || '').toLowerCase();
    }
  }

  const discreteUnits = ['p/c', 'cái', 'hộp', 'khay', 'chai', 'lon', 'cuộn', 'bao', 'gói', 'thùng', 'vỉ'];
  const isDiscrete = discreteUnits.some(u => selectedUnit.includes(u));

  if (isDiscrete && !Number.isInteger(formData.value.quantity)) {
    errorMessage.value = `Với đơn vị tính là "${selectedUnit || 'Cái/Hộp/Khay'}", số lượng phải là số nguyên (không được nhập số thập phân).`;
    return;
  }

  // Auto-generate batch_code if empty
  if (!formData.value.batch_code.trim()) {
    formData.value.batch_code = `BATCH_${formData.value.ingredient_sku}_${Date.now()}`;
  }

  // Fill ingredient_name and supplier_name for local state
  if (!isNewIngredient.value) {
    const ing = inventoryStore.items.find(i => i.sku === formData.value.ingredient_sku);
    formData.value.ingredient_name = ing?.name ?? '';
    formData.value.ingredient_unit = ing?.unit ?? '';
  }
  const sup = suppliersStore.items.find(s => s.supplier_code === formData.value.supplier_code);
  formData.value.supplier_name = sup?.name ?? '';

  const cleanData = JSON.parse(JSON.stringify(formData.value));
  // Attach newIngredient data if creating new
  if (isNewIngredient.value) {
    cleanData._newIngredient = JSON.parse(JSON.stringify(newIngredient.value));
  }
  emit('save', cleanData);
}

function preventNegative(e: KeyboardEvent) {
  if (e.key === '-' || e.key === 'e') {
    e.preventDefault()
  }
}
</script>
