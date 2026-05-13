<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6 w-full max-w-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] relative transform transition-all">
      <div class="flex flex-col gap-1 mb-5">
        <h3 class="text-xl font-bold text-white tracking-tight">{{ title }}</h3>
        <p class="text-gray-400 text-sm leading-relaxed">{{ message }}</p>
      </div>
      
      <div class="flex flex-col gap-2 mb-6">
        <input 
          type="number" 
          v-model="inputValue" 
          :min="min" 
          class="bg-[#121811] text-white border border-[#2A362C] rounded-xl px-4 py-3 focus:outline-none focus:border-[#37EC13] transition-colors w-full font-medium" 
          @keyup.enter="handleConfirm"
          @keydown="preventNegative"
          ref="inputRef"
        />
        <span v-if="error" class="text-red-400 text-xs mt-1 font-medium">{{ error }}</span>
      </div>
      
      <div class="flex justify-end gap-3 mt-2">
        <button 
          @click="handleCancel" 
          class="px-4 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-semibold text-sm"
          :disabled="isLoading"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm" 
          class="px-5 py-2.5 rounded-xl bg-[#37EC13] text-[#132210] font-bold transition-all text-sm flex items-center gap-2 justify-center"
          :class="isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#45F522] shadow-[0_0_15px_rgba(55,236,19,0.3)] active:scale-95'"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          {{ isLoading ? 'Đang xử lý...' : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  initialValue: { type: Number, default: 1 },
  min: { type: Number, default: 1 },
  confirmText: { type: String, default: 'Xác nhận' },
  cancelText: { type: String, default: 'Hủy bỏ' },
});

const emit = defineEmits(['confirm', 'cancel']);

const inputValue = ref(props.initialValue);
const error = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    inputValue.value = props.initialValue;
    error.value = '';
    
    // Auto-focus input when opened
    await nextTick();
    if (inputRef.value) {
      inputRef.value.focus();
      inputRef.value.select();
    }
  }
});

const handleConfirm = () => {
  if (inputValue.value === null || inputValue.value === undefined || String(inputValue.value) === "") {
    error.value = `Vui lòng nhập giá trị hợp lệ`;
    return;
  }
  
  if (inputValue.value < props.min) {
    error.value = `Số lượng phải lớn hơn hoặc bằng ${props.min}`;
    return;
  }
  
  error.value = '';
  emit('confirm', inputValue.value);
};

const handleCancel = () => {
  error.value = '';
  emit('cancel');
};

function preventNegative(e: KeyboardEvent) {
  if (e.key === '-' || e.key === 'e') {
    e.preventDefault();
  }
}
</script>
