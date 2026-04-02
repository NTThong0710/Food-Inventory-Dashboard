<template>
  <div class="space-y-2">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-300">
      {{ label }} <span v-if="required" class="text-red-400">*</span>
    </label>
    <div class="relative">
      <select 
        :id="id"
        :value="modelValue"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        :required="required"
        :disabled="disabled"
        class="w-full bg-[#121811] border border-transparent rounded-lg text-white focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
        :class="[
          selectClass,
          $slots.prefix ? 'pl-10 pr-10 py-2.5' : 'pl-4 pr-10 py-2.5'
        ]"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
        <!-- Hoặc dùng slot mặc định để render từng thẻ <option> tay ngang -->
        <slot></slot>
      </select>
      
      <div v-if="$slots.prefix" class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <slot name="prefix"></slot>
      </div>

      <!-- Arrow Icon (Mặc định nếu không cung cấp Icon riêng qua thẻ suffix/icon) -->
      <slot name="icon">
        <svg class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </slot>
    </div>
    <p v-if="hint" class="text-[10px] text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string | number | null;
  id?: string;
  label?: string;
  options?: Array<{ label: string; value: string | number }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  selectClass?: string;
}>();

defineEmits(['update:modelValue']);
</script>
