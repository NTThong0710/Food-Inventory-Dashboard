<template>
  <div class="bg-[#1F291E] border border-gray-700 rounded-xl p-6 shadow-md text-white">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h3 class="font-bold text-[20px] text-amber-50">
          {{ isEditing ? 'Edit Supplier' : 'Add New Supplier' }}
        </h3>
        <h1 class="text-amber-50 mt-1">Enter the details below to update your supplier database</h1>
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
          <label for="s-code" class="block text-sm font-medium text-gray-300">Supplier Code</label>
          <input id="s-code" v-model="formData.supplier_code" :disabled="isEditing" required type="text" class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] outline-none transition-colors disabled:opacity-50" placeholder="e.g. SUP_001">
        </div>

        <div class="space-y-2">
          <label for="s-name" class="block text-sm font-medium text-gray-300">Supplier Name</label>
          <input id="s-name" v-model="formData.name" required type="text" name="organization" autocomplete="organization" class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] focus:border-[#37EC13] outline-none transition-colors" placeholder="e.g. Fresh Farms Produce">
        </div>

        <div class="space-y-2">
          <label for="s-contact" class="block text-sm font-medium text-gray-300">Contact Person</label>
          <input id="s-contact" v-model="formData.contact_name" required type="text" name="contact_name" autocomplete="name" class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] focus:border-[#37EC13] outline-none transition-colors" placeholder="e.g. John Doe">
        </div>

        <div class="space-y-2">
          <label for="s-email" class="block text-sm font-medium text-gray-300">Email Address</label>
          <input id="s-email" v-model="formData.email" required type="email" name="email" autocomplete="email" spellcheck="false" class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] focus:border-[#37EC13] outline-none transition-colors" placeholder="john@example.com">
        </div>

        <div class="space-y-2">
          <label for="s-phone" class="block text-sm font-medium text-gray-300">Phone Number</label>
          <input id="s-phone" v-model="formData.phone" required type="tel" name="phone" autocomplete="tel" inputmode="tel" class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] focus:border-[#37EC13] outline-none transition-colors" placeholder="e.g. 555-0101">
        </div>

        <div class="space-y-2 md:col-span-2">
          <label class="block text-sm font-medium text-gray-300">Physical Address</label>
          <textarea v-model="formData.address" rows="2" class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] focus:border-[#37EC13] outline-none transition-colors resize-y" placeholder="123 Farm Rd, Countryside..."></textarea>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">Status</label>
          <div class="relative">
            <select v-model="formData.status" required class="w-full bg-[#121811] border border-transparent rounded-lg pl-4 pr-10 py-2.5 text-white focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] focus:border-[#37EC13] outline-none transition-colors appearance-none cursor-pointer">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

      </div>

      <!-- Form Actions -->
      <div class="flex justify-end gap-3 pt-6 border-t border-gray-600 mt-6">
        <button type="button" @click="$emit('cancel-edit')" class="px-6 py-3 bg-gray-700 text-white font-bold hover:bg-gray-600 rounded transition-colors">
          Cancel
        </button>
        <button type="submit" class="px-6 py-3 rounded font-bold bg-[#37EC13] text-black hover:bg-green-500 transition-colors">
          {{ isEditing ? 'Update Supplier' : 'Save Supplier' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, AlertCircle } from 'lucide-vue-next';
import type { Supplier } from '@/stores/suppliers';

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
  status: 'Active'
});

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
    status: 'Active'
  };
}

function handleSubmit() {
  errorMessage.value = '';
  
  if (!formData.value.supplier_code) {
    errorMessage.value = "Supplier code is required.";
    return window.scrollTo(0,0);
  }
  if (!formData.value.name) {
    errorMessage.value = "Supplier name is required.";
    return window.scrollTo(0,0);
  }
  if (!formData.value.email) {
    errorMessage.value = "Email is required.";
    return window.scrollTo(0,0);
  }

  const cleanData = JSON.parse(JSON.stringify(formData.value));
  emit('save', cleanData);
}
</script>
