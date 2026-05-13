<template>
  <div class="bg-[#1F291E] border border-gray-700 p-6 shadow-md text-white">
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

      <!-- AI Inspection Section -->
      <div v-if="!isEditing" class="p-5 bg-[#1B241D] rounded-xl border border-[#2A362C] space-y-4 md:col-span-2">
        <h4 class="font-bold text-[#37EC13] flex items-center gap-2">
          <ScanSearch class="w-5 h-5"/> Kiểm định hình ảnh lô hàng bằng AI
        </h4>
        <p class="text-xs text-gray-400">Vui lòng tải lên 2 ảnh (mặt trước và mặt sau) của thùng hàng để AI tự động kiểm tra lỗi (rách, móp...).</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Front Image -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">Ảnh mặt trước</label>
            <input type="file" ref="frontFileInput" class="hidden" @change="(e) => handleImageUpload('front', e)" accept="image/*" />
            
            <div v-if="!frontResultImage && !frontImagePreview" @click="frontFileInput?.click()" class="border-2 border-dashed border-[#2A362C] bg-[#0F1410] rounded-lg h-40 flex flex-col items-center justify-center text-gray-500 hover:text-[#37EC13] hover:border-[#37EC13] cursor-pointer transition-colors relative">
              <ImagePlus class="w-8 h-8 mb-2" />
              <span class="text-xs">Tải ảnh lên</span>
              <div v-if="isInspectingFront" class="absolute inset-0 bg-[#0F1410]/80 flex flex-col items-center justify-center rounded-lg z-10">
                <span class="w-6 h-6 border-2 border-[#37EC13] border-t-transparent rounded-full animate-spin mb-2"></span>
                <span class="text-xs text-[#37EC13]">AI đang quét...</span>
              </div>
            </div>
            
            <div v-else class="relative rounded-lg overflow-hidden border border-[#2A362C] h-40 group">
              <img :src="frontResultImage || frontImagePreview" class="w-full h-full object-contain bg-black" />
              <div v-if="frontDefects.length > 0" class="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-pulse">
                Phát hiện lỗi!
              </div>
              <div v-else-if="frontResultImage" class="absolute top-2 right-2 bg-[#37EC13] text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                An toàn
              </div>
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button @click.prevent="frontFileInput?.click()" type="button" class="px-3 py-1.5 bg-[#1B241D] text-[#37EC13] text-xs rounded-lg border border-[#37EC13] hover:bg-[#2A362C]">Đổi ảnh</button>
                <button @click.prevent="clearImage('front')" type="button" class="p-1.5 bg-red-900/50 text-white rounded-lg border border-transparent hover:border-red-500 hover:bg-red-500/80 transition-colors" title="Xóa ảnh">
                  <Trash2 class="w-4 h-4"/>
                </button>
              </div>
            </div>
            <!-- Defect List -->
            <div v-if="frontDefects.length > 0" class="text-xs text-red-400 mt-1">
              ❌ Lỗi: <span v-for="(d, i) in frontDefects" :key="i">{{ d.label }} ({{ (d.confidence * 100).toFixed(0) }}%)<span v-if="i < frontDefects.length-1">, </span></span>
            </div>
          </div>

          <!-- Back Image -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">Ảnh mặt sau</label>
            <input type="file" ref="backFileInput" class="hidden" @change="(e) => handleImageUpload('back', e)" accept="image/*" />
            
            <div v-if="!backResultImage && !backImagePreview" @click="backFileInput?.click()" class="border-2 border-dashed border-[#2A362C] bg-[#0F1410] rounded-lg h-40 flex flex-col items-center justify-center text-gray-500 hover:text-[#37EC13] hover:border-[#37EC13] cursor-pointer transition-colors relative">
              <ImagePlus class="w-8 h-8 mb-2" />
              <span class="text-xs">Tải ảnh lên</span>
              <div v-if="isInspectingBack" class="absolute inset-0 bg-[#0F1410]/80 flex flex-col items-center justify-center rounded-lg z-10">
                <span class="w-6 h-6 border-2 border-[#37EC13] border-t-transparent rounded-full animate-spin mb-2"></span>
                <span class="text-xs text-[#37EC13]">AI đang quét...</span>
              </div>
            </div>
            
            <div v-else class="relative rounded-lg overflow-hidden border border-[#2A362C] h-40 group">
              <img :src="backResultImage || backImagePreview" class="w-full h-full object-contain bg-black" />
              <div v-if="backDefects.length > 0" class="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-pulse">
                Phát hiện lỗi!
              </div>
              <div v-else-if="backResultImage" class="absolute top-2 right-2 bg-[#37EC13] text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                An toàn
              </div>
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button @click.prevent="backFileInput?.click()" type="button" class="px-3 py-1.5 bg-[#1B241D] text-[#37EC13] text-xs rounded-lg border border-[#37EC13] hover:bg-[#2A362C]">Đổi ảnh</button>
                <button @click.prevent="clearImage('back')" type="button" class="p-1.5 bg-red-900/50 text-white rounded-lg border border-transparent hover:border-red-500 hover:bg-red-500/80 transition-colors" title="Xóa ảnh">
                  <Trash2 class="w-4 h-4"/>
                </button>
              </div>
            </div>
            <!-- Defect List -->
            <div v-if="backDefects.length > 0" class="text-xs text-red-400 mt-1">
              ❌ Lỗi: <span v-for="(d, i) in backDefects" :key="i">{{ d.label }} ({{ (d.confidence * 100).toFixed(0) }}%)<span v-if="i < backDefects.length-1">, </span></span>
            </div>
          </div>
        </div>

        <div v-if="isAiRejected" class="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2 mt-2">
          <AlertCircle class="w-5 h-5 shrink-0"/> AI phát hiện lô hàng có hư hỏng. Vui lòng hoàn trả hoặc nhập biên bản từ chối!
        </div>
        <div v-else-if="isAiPassed" class="p-3 bg-[#37EC13]/10 border border-[#37EC13]/30 rounded-lg text-[#37EC13] text-sm flex items-center gap-2 mt-2">
          <CheckCircle2 class="w-5 h-5 shrink-0"/> Lô hàng đạt tiêu chuẩn hình thức.
        </div>
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
        <button type="submit" :disabled="isSubmitting || isAiRejected" class="px-6 py-3 rounded font-bold transition-colors flex items-center justify-center gap-2" :class="isSubmitting || isAiRejected ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#37EC13] text-black hover:bg-green-500'">
          <span v-if="isSubmitting" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          {{ isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Nhập kho') }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { AlertCircle, Plus, ImagePlus, ScanSearch, CheckCircle2, Trash2 } from 'lucide-vue-next';
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

// ==========================================
// AI INSPECTION LOGIC
// ==========================================
const frontFileInput = ref<HTMLInputElement | null>(null);
const backFileInput = ref<HTMLInputElement | null>(null);
const frontImagePreview = ref('');
const backImagePreview = ref('');
const frontResultImage = ref('');
const backResultImage = ref('');
const frontDefects = ref<any[]>([]);
const backDefects = ref<any[]>([]);
const isInspectingFront = ref(false);
const isInspectingBack = ref(false);

const isAiRejected = computed(() => {
  return frontDefects.value.length > 0 || backDefects.value.length > 0;
});

const isAiPassed = computed(() => {
  return frontResultImage.value !== '' && backResultImage.value !== '' && !isAiRejected.value;
});

async function handleImageUpload(side: 'front' | 'back', event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (side === 'front') {
    frontImagePreview.value = URL.createObjectURL(file);
    frontResultImage.value = '';
    frontDefects.value = [];
  } else {
    backImagePreview.value = URL.createObjectURL(file);
    backResultImage.value = '';
    backDefects.value = [];
  }

  await runInspection(file, side);
  
  // Reset input so user can re-upload the same file if needed
  if (target) target.value = '';
}

function clearImage(side: 'front' | 'back') {
  if (side === 'front') {
    frontImagePreview.value = '';
    frontResultImage.value = '';
    frontDefects.value = [];
    if (frontFileInput.value) frontFileInput.value.value = '';
  } else {
    backImagePreview.value = '';
    backResultImage.value = '';
    backDefects.value = [];
    if (backFileInput.value) backFileInput.value.value = '';
  }
}

async function runInspection(file: File, side: 'front'|'back') {
  if (side === 'front') isInspectingFront.value = true;
  else isInspectingBack.value = true;
  
  const uploadData = new FormData();
  uploadData.append('file', file);
  
  try {
    const response = await fetch('https://thong0710-box-inspection-api.hf.space/inspect-shipment', {
      method: 'POST',
      body: uploadData
    });
    
    if (!response.ok) throw new Error('API error');
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    
    if (side === 'front') {
      frontDefects.value = data.defects || [];
      frontResultImage.value = data.image_base64 || '';
    } else {
      backDefects.value = data.defects || [];
      backResultImage.value = data.image_base64 || '';
    }
  } catch(e) {
    console.error("Lỗi AI Inspection:", e);
    errorMessage.value = 'Lỗi kết nối máy chủ AI. Vui lòng kiểm tra lại.';
  } finally {
    if (side === 'front') isInspectingFront.value = false;
    else isInspectingBack.value = false;
  }
}
// ==========================================

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
  
  // Reset AI state
  frontImagePreview.value = '';
  backImagePreview.value = '';
  frontResultImage.value = '';
  backResultImage.value = '';
  frontDefects.value = [];
  backDefects.value = [];
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
