<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<{
  payload?: Record<string, any>
  class?: HTMLAttributes["class"]
}>(), {
  payload: () => ({}),
})

const categoryName = computed(() => {
  return props.payload?.category || "Nguyên liệu"
})

const quantity = computed(() => {
  return props.payload?.quantity || 0
})
</script>

<template>
  <div
    :class="cn(
      'border-border/50 bg-background rounded-lg border px-3 py-2 text-xs shadow-xl',
      props.class,
    )"
  >
    <div class="font-semibold text-foreground">
      {{ categoryName }}
    </div>
    <div class="text-muted-foreground mt-1">
      Số lượng: <span class="font-bold text-foreground">{{ quantity }}</span>
    </div>
  </div>
</template>
