<template>
  <div class="bg-[#1F291E] border border-gray-700 p-6 shadow-md text-white">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h3 class="font-bold text-[20px] text-amber-50">
          {{ isEditing ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới' }}
        </h3>
        <h1 class="text-amber-50 mt-1">Nhập chi tiết dưới đây để cập nhật cơ sở dữ liệu nhà cung cấp</h1>
      </div>
      <!-- <button @click="$emit('cancel-edit')" class="text-gray-400 hover:text-white transition-colors" aria-label="Close form">
        <X class="w-6 h-6" aria-hidden="true" />
      </button> -->
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium flex items-center gap-2">
      <AlertCircle class="w-5 h-5"/> {{ errorMessage }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      
      <!-- Basic Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <BaseInput id="s-code" label="Mã nhà cung cấp" v-model="formData.supplier_code" :disabled="isEditing" required placeholder="VD: NCC_001" />
        <BaseInput id="s-name" label="Tên nhà cung cấp" v-model="formData.name" required name="organization" autocomplete="organization" placeholder="VD: Nông trại sạch" />
        <BaseInput id="s-contact" label="Người liên hệ" v-model="formData.contact_name" required name="contact_name" autocomplete="name" placeholder="VD: Nguyễn Văn A" />
        <BaseInput id="s-email" type="email" label="Địa chỉ Email" v-model="formData.email" required name="email" autocomplete="email" spellcheck="false" placeholder="john@example.com" />
        <BaseInput id="s-phone" type="tel" label="Số điện thoại" v-model="formData.phone" required name="phone" autocomplete="tel" inputmode="tel" placeholder="VD: 0987-654-321" />
        <BaseSelect id="s-status" label="Trạng thái" v-model="formData.status" required>
          <option value="Active">Hoạt động</option>
          <option value="Inactive">Ngừng hoạt động</option>
        </BaseSelect>
        <BaseTextarea id="s-address" label="Địa chỉ" v-model="formData.address" :rows="2" placeholder="123 Đường Nông Trại..." class="md:col-span-2" />
        

      </div>

      <!-- Linked Ingredients Section -->
      <div class="mt-8 border-t border-gray-600 pt-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-amber-50">Nguyên liệu cung cấp</h3>
          <button type="button" @click="addIngredient" class="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1">
            <Plus class="w-4 h-4" /> Thêm nguyên liệu
          </button>
        </div>

        <div v-if="formData.ingredients && formData.ingredients.length > 0" class="space-y-3">
          <div v-for="(ing, index) in formData.ingredients" :key="index" class="flex flex-col sm:flex-row gap-3 bg-[#1B241D] p-3 rounded-lg border border-[#2A362C]">
            
            <div class="flex-1">
              <label class="block text-xs text-gray-400 mb-1">Nguyên liệu</label>
              <select v-model="ing.ingredient_sku" required class="w-full bg-[#121811] border border-transparent rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] outline-none transition-colors">
                <option value="" disabled>Chọn nguyên liệu...</option>
                <option v-for="item in inventoryStore.items" :key="item.sku" :value="item.sku">
                  {{ item.name }} ({{ item.sku }})
                </option>
              </select>
            </div>

            <div class="w-full sm:w-32">
              <label class="block text-xs text-gray-400 mb-1">Giá báo cáo (VND)</label>
              <input v-model.number="ing.quoted_price" type="number" required min="0" @keydown="preventNegative" class="w-full bg-[#121811] border border-transparent rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] outline-none transition-colors" placeholder="0">
            </div>

            <div class="w-full sm:w-28">
              <label class="block text-xs text-gray-400 mb-1">Tg giao (ngày)</label>
              <input v-model.number="ing.lead_time_days" type="number" required min="0" @keydown="preventNegative" class="w-full bg-[#121811] border border-transparent rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] outline-none transition-colors" placeholder="1">
            </div>

            <div class="flex items-end pb-1">
              <button type="button" @click="removeIngredient(index)" class="text-red-400 hover:text-red-300 p-1.5 bg-red-900/20 hover:bg-red-900/40 rounded transition-colors" title="Xóa">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
        <div v-else class="text-sm text-gray-500 italic p-4 bg-[#1B241D] border border-[#2A362C] rounded-lg text-center">
          Nhà cung cấp này chưa liên kết với nguyên liệu nào.
        </div>
      </div>

      <!-- Batch History Section (read-only, chỉ hiển thị khi edit) -->
      <div v-if="isEditing && supplierBatches.length > 0" class="mt-8 border-t border-gray-600 pt-6">
        <div class="flex items-center gap-2 mb-4">
          <Package class="w-5 h-5 text-[#37EC13]" />
          <h3 class="text-lg font-bold text-amber-50">Lịch sử lô hàng</h3>
          <span class="text-xs px-2 py-0.5 bg-[#2A362C] text-gray-300 rounded-full">{{ supplierBatches.length }}</span>
        </div>

        <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
          <div v-for="batch in supplierBatches" :key="batch.batch_code" class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-[#1B241D] p-3 rounded-lg border border-[#2A362C] text-sm">
            <div class="flex-1 min-w-0">
              <span class="font-semibold text-gray-200 truncate block">{{ batch.ingredient_name }}</span>
              <span class="text-[10px] text-gray-500 font-mono">{{ batch.batch_code }}</span>
            </div>
            <div class="flex items-center gap-4 text-xs text-gray-400 flex-shrink-0">
              <span class="tabular-nums">SL: <span class="text-white font-medium">{{ batch.quantity }}</span></span>
              <span class="tabular-nums">{{ Number(batch.unit_cost).toLocaleString('vi-VN') }} ₫</span>
              <span v-if="batch.expiry_date" class="px-1.5 py-0.5 rounded text-[10px] font-medium" :class="getExpiryClass(batch.expiry_date)">
                HSD: {{ formatDate(batch.expiry_date) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end gap-3 pt-6 border-t border-gray-600 mt-6">
        <button type="button" @click="$emit('cancel-edit')" class="px-6 py-3 bg-gray-700 text-white font-bold hover:bg-gray-600 rounded transition-colors">
          Hủy
        </button>
        <button type="submit" :disabled="isSubmitting" class="px-6 py-3 rounded font-bold transition-colors flex items-center justify-center gap-2" :class="isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#37EC13] text-black hover:bg-green-500'">
          <span v-if="isSubmitting" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          {{ isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Lưu lại') }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { X, AlertCircle, Plus, Trash2, Package } from 'lucide-vue-next';
import BaseInput from '@/shared/components/ui/BaseInput.vue';
import BaseSelect from '@/shared/components/ui/BaseSelect.vue';
import BaseTextarea from '@/shared/components/ui/BaseTextarea.vue';
import type { Supplier, SupplierIngredient } from '@/features/suppliers/store';
import { useInventoryStore } from '@/features/inventory/store';
import { useBatchesStore, type Batch } from '@/features/batches/store';

const inventoryStore = useInventoryStore();
const batchesStore = useBatchesStore();
const supplierBatches = ref<Batch[]>([]);

onMounted(() => {
  if (inventoryStore.items.length === 0) {
    inventoryStore.fetchIngredients();
  }
});

function getExpiryClass(dateStr: string | null) {
  if (!dateStr) return 'text-gray-400';
  const now = new Date(); now.setHours(0,0,0,0);
  const exp = new Date(dateStr);
  if (exp < now) return 'bg-red-900/40 text-red-400 border border-red-900/50';
  const diff = exp.getTime() - now.getTime();
  if (diff <= 7 * 24 * 60 * 60 * 1000) return 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50';
  return 'bg-[#1B5E20]/40 text-[#37EC13] border border-[#1B5E20]';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

const props = defineProps<{
  itemToEdit: Supplier | null;
  isSubmitting?: boolean;
}>();

const emit = defineEmits(['save', 'cancel-edit']);

const isEditing = computed(() => !!props.itemToEdit);
const errorMessage = ref('');

const formData = ref<Supplier>({
  supplier_code: '',
  name: '',
  contact_name: '',
  email: '',
  phone: '',
  address: '',
  status: 'Active',
  ingredients: []
});

function addIngredient() {
  if (!formData.value.ingredients) formData.value.ingredients = [];
  formData.value.ingredients.push({
    ingredient_sku: '',
    quoted_price: 0,
    lead_time_days: 1
  });
}

function removeIngredient(index: number) {
  if (formData.value.ingredients) {
    formData.value.ingredients.splice(index, 1);
  }
}

watch(() => props.itemToEdit, async (newVal) => {
  if (newVal) {
    formData.value = JSON.parse(JSON.stringify(newVal));
    // Fetch batch history for this supplier
    supplierBatches.value = await batchesStore.fetchBatchesBySupplier(newVal.supplier_code);
  } else {
    resetForm();
    supplierBatches.value = [];
  }
  errorMessage.value = '';
}, { immediate: true });

function resetForm() {
  formData.value = {
    supplier_code: '',
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
    ingredients: []
  };
}

function preventNegative(e: KeyboardEvent) {
  if (e.key === '-' || e.key === 'e') {
    e.preventDefault();
  }
}

function handleSubmit() {
  errorMessage.value = '';
  
  if (!formData.value.supplier_code) {
    errorMessage.value = "Mã nhà cung cấp là bắt buộc.";
    return window.scrollTo(0,0);
  }
  if (!formData.value.name) {
    errorMessage.value = "Tên nhà cung cấp là bắt buộc.";
    return window.scrollTo(0,0);
  }
  if (!formData.value.email) {
    errorMessage.value = "Email là bắt buộc.";
    return window.scrollTo(0,0);
  }
  if (!formData.value.phone || !/^\d{10}$/.test(formData.value.phone)) {
    errorMessage.value = "Số điện thoại phải bao gồm đúng 10 chữ số (VD: 0987654321).";
    return window.scrollTo(0,0);
  }

  const cleanData = JSON.parse(JSON.stringify(formData.value));
  emit('save', cleanData);
}
</script>
