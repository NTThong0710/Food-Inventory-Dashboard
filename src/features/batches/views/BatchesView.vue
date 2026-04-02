<template>
  <div class="flex flex-col w-full relative">
    
    <!-- Download Toast -->
    <div class="card flex justify-center">
      <Toast position="top-center" group="headless" @close="visible = false">
        <template #container="{ message, closeCallback }">
          <section class="flex flex-col p-5 gap-4 w-full bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] min-w-[320px]">
            <div class="flex items-center gap-4">
              <div class="p-2 bg-[#37EC13]/20 rounded-lg">
                <FileDown class="w-6 h-6 text-[#37EC13] animate-bounce" />
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-base text-white tracking-tight">{{ message.summary }}</span>
                <span class="text-xs text-gray-400">Vui lòng đợi trong giây lát...</span>
              </div>
            </div>
            
            <div class="flex flex-col gap-2 mt-2">
              <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-linear-to-r from-[#37EC13] to-[#22c55e] transition-all duration-300 ease-out shadow-[0_0_10px_#37EC13]"
                  :style="{ width: `${progress}%` }"
                ></div>
              </div>
              <div class="flex justify-between items-center text-[10px] font-medium uppercase tracking-widest text-gray-400">
                <span>Tiến trình</span>
                <span class="text-[#37EC13]">{{ progress }}%</span>
              </div>
            </div>

            <div class="flex justify-end mt-2">
              <button 
                @click="closeCallback"
                class="text-xs font-bold text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
              >
                Hủy bỏ
              </button>
            </div>
          </section>
        </template>
      </Toast>
    </div>

    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-3xl font-bold text-white tracking-tight">Quản lý nhập kho</h2>
        <p class="text-gray-400 text-sm mt-1">Theo dõi các lô hàng nhập kho, hạn sử dụng và giá trị tồn kho.</p>
      </div>

      <div class="flex gap-2">
        <button 
          @click="downloadExcel" 
          class="bg-green-500 text-black px-4 py-2 rounded font-bold hover:bg-[#37EC13] transition-colors flex items-center gap-2"
        >
          <Download class="w-4 h-4" aria-hidden="true" />
          Xuất Excel
        </button>
        <button v-if="authStore.hasPermission('batch_write')" @click="openNewForm" class="bg-[#37EC13] hover:bg-[#45F522] text-[#132210] px-4 py-2 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(55,236,19,0.3)]">
          <Plus class="w-5 h-5"/>
          Nhập kho
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-[#1A2E16] border border-[#2A362C] rounded-xl p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-lg bg-[#1B5E20]/40 flex items-center justify-center">
          <Package class="w-5 h-5 text-[#37EC13]" />
        </div>
        <div>
          <p class="text-2xl font-bold text-white">{{ store.totalBatches }}</p>
          <p class="text-xs text-gray-400">Tổng lô hàng</p>
        </div>
      </div>
      <div class="bg-[#1A2E16] border border-[#2A362C] rounded-xl p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-lg bg-emerald-900/40 flex items-center justify-center">
          <DollarSign class="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p class="text-2xl font-bold text-white">{{ formatCurrency(store.totalValue) }}</p>
          <p class="text-xs text-gray-400">Tổng giá trị</p>
        </div>
      </div>
      <div class="bg-[#1A2E16] border border-[#2A362C] rounded-xl p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-lg flex items-center justify-center" :class="store.expiringCount > 0 ? 'bg-yellow-900/40' : 'bg-[#1B5E20]/40'">
          <AlertTriangle v-if="store.expiringCount > 0" class="w-5 h-5 text-yellow-400" />
          <ShieldCheck v-else class="w-5 h-5 text-[#37EC13]" />
        </div>
        <div>
          <p class="text-2xl font-bold text-white">{{ store.expiringCount }}</p>
          <p class="text-xs text-gray-400">Sắp hết hạn (7 ngày)</p>
        </div>
      </div>
    </div>

    <section class="w-full">
      <div class="transition-all w-full">
        <BatchList
          :batches="store.items"
          @edit="openEditForm"
          @delete="handleDelete"
          @delete-multiple="handleDeleteMultiple"
        />
      </div>
    </section>

    <!-- Form Modal -->
    <Sheet v-model:open="isFormOpen">
      <SheetContent side="right" class="w-full sm:max-w-2xl overflow-y-auto">
        <BatchForm
          :itemToEdit="editingItem"
          :isSubmitting="isSubmitting"
          @save="handleSave"
          @cancel-edit="closeForm"
        />
      </SheetContent>
    </Sheet>

    <!-- UI Modals -->
    <ConfirmModal
      :isOpen="isDeleteModalOpen"
      :title="batchToDelete ? 'Xác nhận xóa lô hàng' : 'Xác nhận xóa nhiều'"
      :message="batchToDelete ? 'Bạn có chắc chắn muốn xóa lô hàng này không? Số lượng tồn kho sẽ được cập nhật.' : `Bạn có chắc chắn muốn xóa ${batchesToDelete.length} lô hàng đã chọn không? Số lượng tồn kho sẽ được cập nhật.`"
      :isLoading="isDeleteSubmitting"
      @confirm="confirmDelete"
      @cancel="isDeleteModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BatchForm from '@/features/batches/components/BatchForm.vue';
import BatchList from '@/features/batches/components/BatchList.vue';
import ConfirmModal from '@/shared/components/ui/modal/ConfirmModal.vue';
import { useBatchesStore, type Batch } from '@/features/batches/store';
import { useAuthStore } from '@/features/auth/store';
import { Plus, Package, DollarSign, AlertTriangle, ShieldCheck, Download, FileDown } from 'lucide-vue-next';
import { Sheet, SheetContent } from '@/shared/components/ui/sheet';
import { useToast } from "primevue/usetoast";
import Toast from 'primevue/toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const store = useBatchesStore();
const toast = useToast();
const authStore = useAuthStore();

// Import inventory store for inline ingredient creation
import { useInventoryStore } from '@/features/inventory/store';
const inventoryStore = useInventoryStore();

// UI State
const isFormOpen = ref(false);
const editingItem = ref<Batch | null>(null);
const editingOldQuantity = ref(0);
const visible = ref(false);
const progress = ref(0);

// Modal states
const isDeleteModalOpen = ref(false);
const batchToDelete = ref<string | null>(null);
const batchesToDelete = ref<string[]>([]);

const isSubmitting = ref(false);
const isDeleteSubmitting = ref(false);

onMounted(() => {
  store.fetchBatches();
});

// Actions
const openNewForm = () => {
  editingItem.value = null;
  editingOldQuantity.value = 0;
  isFormOpen.value = true;
};

const openEditForm = (item: Batch) => {
  editingItem.value = { ...item };
  editingOldQuantity.value = item.quantity;
  isFormOpen.value = true;
};

const closeForm = () => {
  editingItem.value = null;
  isFormOpen.value = false;
};

const handleSave = async (batchData: any) => {
  try {
    // If creating a new ingredient inline
    if (batchData._newIngredient) {
      const newIng = batchData._newIngredient;
      try {
        isSubmitting.value = true;
        await inventoryStore.addIngredient({
          sku: newIng.sku,
          name: newIng.name,
          unit: newIng.unit,
          category_code: newIng.category_code || '',
          category: '',
          quantity: 0,
          cost: 0,
          note: '',
        });
        toast.add({ severity: 'info', summary: 'Nguyên liệu mới', detail: `Đã tạo "${newIng.name}"`, life: 3000 });
      } catch (ingErr) {
        console.error('Error creating ingredient:', ingErr);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo nguyên liệu mới', life: 3000 });
        return;
      } finally {
        isSubmitting.value = false;
      }
      delete batchData._newIngredient;
    }

    isSubmitting.value = true;
    if (editingItem.value) {
      await store.updateBatch(batchData, editingOldQuantity.value);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật lô hàng thành công', life: 3000 });
    } else {
      // Check duplicate batch_code
      const isDuplicate = store.items.some(b => b.batch_code.toLowerCase() === batchData.batch_code.toLowerCase());
      if (isDuplicate) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Mã lô hàng đã tồn tại', life: 3000 });
        return;
      }
      await store.addBatch(batchData);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Nhập lô hàng thành công', life: 3000 });
    }
    await store.fetchBatches();
    closeForm();
  } catch (error) {
    console.error('Error saving batch:', error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi lưu lô hàng', life: 3000 });
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = (batchCode: string) => {
  batchesToDelete.value = [];
  batchToDelete.value = batchCode;
  isDeleteModalOpen.value = true;
};

const handleDeleteMultiple = (batchCodes: string[]) => {
  batchToDelete.value = null;
  batchesToDelete.value = [...batchCodes];
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  try {
    isDeleteSubmitting.value = true;
    if (batchToDelete.value) {
      await store.deleteBatch(batchToDelete.value);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa lô hàng', life: 3000 });
      if (editingItem.value?.batch_code === batchToDelete.value) {
        closeForm();
      }
    } else if (batchesToDelete.value.length > 0) {
      for (const code of batchesToDelete.value) {
        await store.deleteBatch(code);
      }
      toast.add({ severity: 'success', summary: 'Thành công', detail: `Đã xóa ${batchesToDelete.value.length} lô hàng`, life: 3000 });
      if (editingItem.value && batchesToDelete.value.includes(editingItem.value.batch_code)) {
        closeForm();
      }
    }
  } catch (error) {
    console.error('Error deleting batch(es):', error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi xóa lô hàng', life: 3000 });
  } finally {
    isDeleteSubmitting.value = false;
    isDeleteModalOpen.value = false;
    batchToDelete.value = null;
    batchesToDelete.value = [];
  }
};

const downloadExcel = async () => {
  if (!visible.value) {
    toast.add({ severity: 'custom', summary: 'Đang tạo file Excel...', group: 'headless', styleClass: 'backdrop-blur-lg rounded-2xl' });
    visible.value = true;
  }
  progress.value = 0;

  const progressInterval = setInterval(() => {
    if (progress.value < 85) {
      progress.value += Math.floor(Math.random() * 15) + 5; 
    }
  }, 150);

  try {
    await new Promise(resolve => setTimeout(resolve, 800));

    const sortedItems = [...store.items];
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Báo cáo lô hàng');

    worksheet.columns = [
      { header: 'Mã lô hàng', key: 'batch_code', width: 25 },
      { header: 'Mã SKU', key: 'ingredient_sku', width: 20 },
      { header: 'Tên nguyên liệu', key: 'ingredient_name', width: 30 },
      { header: 'Số lượng', key: 'quantity', width: 15 },
      { header: 'Đơn vị', key: 'ingredient_unit', width: 10 },
      { header: 'Đơn giá (VND)', key: 'unit_cost', width: 20 },
      { header: 'Tổng phụ (VND)', key: 'total', width: 20 },
      { header: 'Nhà cung cấp', key: 'supplier_name', width: 25 },
      { header: 'Ngày nhập', key: 'received_at', width: 20 },
      { header: 'Ngày sản xuất', key: 'production_date', width: 20 },
      { header: 'Hạn sử dụng', key: 'expiry_date', width: 20 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A2E16' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    sortedItems.forEach(item => {
      worksheet.addRow({
        batch_code: item.batch_code,
        ingredient_sku: item.ingredient_sku,
        ingredient_name: item.ingredient_name || '-',
        quantity: item.quantity,
        ingredient_unit: item.ingredient_unit || '-',
        unit_cost: item.unit_cost,
        total: item.quantity * item.unit_cost,
        supplier_name: item.supplier_name || '-',
        received_at: item.received_at ? new Date(item.received_at).toLocaleDateString('vi-VN') : '-',
        production_date: item.production_date ? new Date(item.production_date).toLocaleDateString('vi-VN') : '-',
        expiry_date: item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('vi-VN') : '-'
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    clearInterval(progressInterval);
    progress.value = 100;

    saveAs(blob, `Bao_cao_lo_hang_${new Date().getTime()}.xlsx`);

    setTimeout(() => {
      visible.value = false;
      if (typeof toast.removeGroup === 'function') toast.removeGroup('headless');
      if (typeof toast.removeAllGroups === 'function') toast.removeAllGroups();
    }, 500);

  } catch (error) {
    console.error('Lỗi xuất Excel:', error);
    clearInterval(progressInterval);
    visible.value = false;
    if (typeof toast.removeGroup === 'function') toast.removeGroup('headless');
    if (typeof toast.removeAllGroups === 'function') toast.removeAllGroups();
  }
};

function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}

</script>
