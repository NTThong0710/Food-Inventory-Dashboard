<template>
  <div class="bg-[#1F291E] border border-gray-700 rounded-xl p-6 shadow-md text-white">
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
        
        <div class="space-y-2">
          <label for="s-code" class="block text-sm font-medium text-gray-300">Mã nhà cung cấp</label>
          <input id="s-code" v-model="formData.supplier_code" :disabled="isEditing" required type="text" class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] outline-none transition-colors disabled:opacity-50" placeholder="VD: NCC_001">
        </div>

        <div class="space-y-2">
          <label for="s-name" class="block text-sm font-medium text-gray-300">Tên nhà cung cấp</label>
          <input id="s-name" v-model="formData.name" required type="text" name="organization" autocomplete="organization" class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] focus:border-[#37EC13] outline-none transition-colors" placeholder="VD: Nông trại sạch">
        </div>

        <div class="space-y-2">
          <label for="s-contact" class="block text-sm font-medium text-gray-300">Người liên hệ</label>
          <input id="s-contact" v-model="formData.contact_name" required type="text" name="contact_name" autocomplete="name" class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] focus:border-[#37EC13] outline-none transition-colors" placeholder="VD: Nguyễn Văn A">
        </div>

        <div class="space-y-2">
          <label for="s-email" class="block text-sm font-medium text-gray-300">Địa chỉ Email</label>
          <input id="s-email" v-model="formData.email" required type="email" name="email" autocomplete="email" spellcheck="false" class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] focus:border-[#37EC13] outline-none transition-colors" placeholder="john@example.com">
        </div>

        <div class="space-y-2">
          <label for="s-phone" class="block text-sm font-medium text-gray-300">Số điện thoại</label>
          <input id="s-phone" v-model="formData.phone" required type="tel" name="phone" autocomplete="tel" inputmode="tel" class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] focus:border-[#37EC13] outline-none transition-colors" placeholder="VD: 0987-654-321">
        </div>

        <div class="space-y-2 md:col-span-2">
          <label class="block text-sm font-medium text-gray-300">Địa chỉ</label>
          <textarea v-model="formData.address" rows="2" class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] focus:border-[#37EC13] outline-none transition-colors resize-y" placeholder="123 Đường Nông Trại..."></textarea>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">Trạng thái</label>
          <div class="relative">
            <select v-model="formData.status" required class="w-full bg-[#121811] border border-transparent rounded-lg pl-4 pr-10 py-2.5 text-white focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] focus:border-[#37EC13] outline-none transition-colors appearance-none cursor-pointer">
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Ngừng hoạt động</option>
            </select>
          </div>
        </div>

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
              <input v-model.number="ing.quoted_price" type="number" required min="0" class="w-full bg-[#121811] border border-transparent rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] outline-none transition-colors" placeholder="0">
            </div>

            <div class="w-full sm:w-28">
              <label class="block text-xs text-gray-400 mb-1">Tg giao (ngày)</label>
              <input v-model.number="ing.lead_time_days" type="number" required min="0" class="w-full bg-[#121811] border border-transparent rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] outline-none transition-colors" placeholder="1">
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

      <!-- Form Actions -->
      <div class="flex justify-end gap-3 pt-6 border-t border-gray-600 mt-6">
        <button type="button" @click="$emit('cancel-edit')" class="px-6 py-3 bg-gray-700 text-white font-bold hover:bg-gray-600 rounded transition-colors">
          Hủy
        </button>
        <button type="submit" class="px-6 py-3 rounded font-bold bg-[#37EC13] text-black hover:bg-green-500 transition-colors">
          {{ isEditing ? 'Cập nhật' : 'Lưu lại' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { X, AlertCircle, Plus, Trash2 } from 'lucide-vue-next';
import type { Supplier, SupplierIngredient } from '@/stores/suppliers';
import { useInventoryStore } from '@/stores/inventory';

const inventoryStore = useInventoryStore();

onMounted(() => {
  if (inventoryStore.items.length === 0) {
    inventoryStore.fetchIngredients();
  }
});

const props = defineProps<{
  itemToEdit: Supplier | null
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

watch(() => props.itemToEdit, (newVal) => {
  if (newVal) {
    formData.value = JSON.parse(JSON.stringify(newVal));
  } else {
    resetForm();
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

  const cleanData = JSON.parse(JSON.stringify(formData.value));
  emit('save', cleanData);
}
</script>
