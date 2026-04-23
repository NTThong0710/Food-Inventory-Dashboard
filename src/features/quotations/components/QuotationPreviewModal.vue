<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    modal 
    header="Xem trước Báo giá" 
    :style="{ width: '850px' }"
    class="quotation-dialog"
  >
    <div class="flex flex-col items-center">
      <div class="mb-6 flex gap-4">
        <Button 
          label="Tải PDF" 
          icon="pi pi-file-pdf" 
          severity="success" 
          @click="handleDownload" 
          :loading="isExporting"
          class="bg-[#37EC13] border-none text-black hover:bg-[#2ecc11]"
        />
        <Button 
          label="Đóng" 
          icon="pi pi-times" 
          text 
          @click="$emit('update:visible', false)" 
          class="text-gray-400"
        />
      </div>

      <!-- The actual template that will be captured -->
      <div class="preview-scroll-container bg-[#1A2E16] p-4 rounded-xl shadow-inner border border-[#1B5E20]/20 max-h-[70vh] overflow-y-auto">
        <QuotationTemplate 
          ref="templateRef"
          :booking="booking"
          :order="order"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import QuotationTemplate from './QuotationTemplate.vue';
import { generateQuotationPDF } from '../utils/quotationUtils';

const props = defineProps<{
  visible: boolean;
  booking: any;
  order: any;
}>();

const emit = defineEmits(['update:visible']);

const templateRef = ref<any>(null);
const isExporting = ref(false);

const handleDownload = async () => {
  if (!templateRef.value?.$el) return;
  
  isExporting.value = true;
  const filename = `BaoGia_${props.booking?.customer_name.replace(/\s+/g, '_')}_${props.booking?.id?.slice(0, 5)}`;
  
  try {
    await generateQuotationPDF(templateRef.value.$el, filename);
  } finally {
    isExporting.value = false;
  }
};
</script>

<style>
.quotation-dialog .p-dialog-content {
  background: #132210;
  color: white;
}
.quotation-dialog .p-dialog-header {
  background: #1A2E16;
  color: white;
  border-bottom: 1px solid #2A362C;
}

.preview-scroll-container {
  scrollbar-width: thin;
  scrollbar-color: #1B5E20 #0C160A;
}

.preview-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.preview-scroll-container::-webkit-scrollbar-track {
  background: #0C160A;
}

.preview-scroll-container::-webkit-scrollbar-thumb {
  background-color: #1B5E20;
  border-radius: 10px;
}
</style>
