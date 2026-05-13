<template>
  <div class="space-y-2">
    <label :for="id" class="block text-sm font-medium text-gray-300">
      {{ label }} <span v-if="required" class="text-red-400">*</span>
    </label>
    <div class="relative">
      <div v-if="$slots.prefix" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none">
        <slot name="prefix"></slot>
      </div>
      
      <input 
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keydown="type === 'number' ? preventNegative($event) : undefined"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :min="min"
        :max="max"
        :step="step"
        :inputmode="inputmode as any"
        class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] outline-none transition-colors disabled:opacity-50"
        :class="[
          inputClass,
          $slots.prefix ? 'pl-9' : '',
          $slots.suffix ? 'pr-9' : ''
        ]"
      >
      
      <div v-if="$slots.suffix" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none">
        <slot name="suffix"></slot>
      </div>
    </div>
    <p v-if="hint" class="text-[10px] text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">

defineOptions({
  inheritAttrs: false // Tự động bind các attributes (như @blur, @focus) vào thẻ div tổng, ta cần ngăn chặn nó nếu không muốn lỗi
})

const props = defineProps<{
  modelValue?: string | number | null;
  id?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  inputClass?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  inputmode?: string;
}>();

defineEmits(['update:modelValue']);

function preventNegative(e: KeyboardEvent) {
  if (e.key === '-' || e.key === 'e') {
    e.preventDefault();
  }
}
</script>
