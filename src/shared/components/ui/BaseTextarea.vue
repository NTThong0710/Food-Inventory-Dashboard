<template>
  <div class="space-y-2 text-left">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-300">
      {{ label }} <span v-if="required" class="text-red-400">*</span>
    </label>
    <textarea 
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="w-full bg-[#121811] border border-transparent rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-[#37EC13] hover:border-[#37EC13] outline-none transition-colors resize-y disabled:opacity-50"
      :class="textareaClass"
    ></textarea>
    <p v-if="hint" class="text-[10px] text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string | number | null;
  id?: string;
  label?: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  textareaClass?: string;
}>(), {
  rows: 3
});

defineEmits(['update:modelValue']);
</script>
