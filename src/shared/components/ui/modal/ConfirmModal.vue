<template>
  <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl p-6 w-full max-w-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] relative transform transition-all scale-100 opacity-100">
      <div class="flex flex-col gap-1 mb-6">
        <h3 class="text-xl font-bold text-white tracking-tight">{{ title }}</h3>
        <p class="text-gray-400 text-sm leading-relaxed">{{ message }}</p>
      </div>
      
      <div class="flex justify-end gap-3 mt-2">
        <button 
          @click="$emit('cancel', $event)" 
          class="px-4 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-semibold text-sm"
          :disabled="isLoading"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="$emit('confirm', $event)" 
          class="px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md flex items-center gap-2 justify-center"
          :class="[
            confirmClass ? confirmClass : 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 hover:border-red-500',
            isLoading ? 'opacity-70 cursor-not-allowed pointer-events-none' : 'active:scale-95'
          ]"
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
defineProps({
  isOpen: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  title: { type: String, default: 'Xác nhận' },
  message: { type: String, required: true },
  confirmText: { type: String, default: 'Xác nhận' },
  cancelText: { type: String, default: 'Hủy bỏ' },
  confirmClass: { type: String, default: '' } // default to red destructive style
});

defineEmits(['confirm', 'cancel']);
</script>
