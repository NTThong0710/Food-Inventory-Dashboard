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

    <!-- Page Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-3xl font-bold text-amber-50">Quản lý nguyên liệu</h2>
        <p class="text-gray-400 text-sm mt-1">Quản lý tất cả nguyên liệu, số lượng và chi phí.</p>
      </div>

      <div class="flex gap-2">
        <!-- Nút Xuất PDF: chỉ admin & hr_manager (dashboard_read) -->
        <button
          v-if="authStore.hasPermission('dashboard_read')"
          @click="downloadPdf"
          :disabled="isPdfExporting"
          class="bg-red-700 text-white px-4 py-2 rounded font-bold hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isPdfExporting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <FileText v-else class="w-4 h-4" aria-hidden="true" />
          {{ isPdfExporting ? 'Đang tạo PDF...' : 'Xuất PDF' }}
        </button>

        <button 
          @click="downloadExcel" 
          class="bg-green-500 text-black px-4 py-2 rounded font-bold hover:bg-[#37EC13] transition-colors flex items-center gap-2"
        >
          <Download class="w-4 h-4" aria-hidden="true" />
          Xuất Excel
        </button>
      
        <!-- Nút thêm mới -->
        <button 
          v-if="authStore.hasPermission('ingredient_write')"
          @click="openNewForm" 
          class="bg-[#37EC13] text-[#132210] px-4 py-2 rounded font-bold hover:bg-green-500 transition-colors flex items-center gap-2"
        >
          <Plus class="w-5 h-5" />
          Thêm nguyên liệu
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <section class="w-full mt-2">
      <!-- List Section -->
      <div class="transition-all w-full">
        <!-- List -->
        <IngredientList
          :inventory="store.items" 
          :isLoading="isSubmitting"
          @edit="handleEdit" 
          @delete="handleDelete"
          @delete-multiple="handleDeleteMultiple"
        />
      </div>

    </section>

    <!-- Form Modal -->
    <Sheet v-model:open="isFormOpen">
      <SheetContent side="right" class="w-full sm:max-w-2xl overflow-y-auto">
        <IngredientForm 
          :itemToEdit="editingItem || undefined" 
          :isSubmitting="isSubmitting"
          @save="handleSave"
          @cancel-edit="closeForm"
        />
      </SheetContent>
    </Sheet>

    <!-- UI Modals -->
    <ConfirmModal
      :isOpen="isDeleteModalOpen"
      :title="skuToDelete ? 'Xác nhận xóa nguyên liệu' : 'Xác nhận xóa nhiều'"
      :message="skuToDelete ? 'Bạn có chắc chắn muốn xóa nguyên liệu này không?' : `Bạn có chắc chắn muốn xóa ${skusToDelete.length} nguyên liệu đã chọn không?`"
      :isLoading="isDeleteSubmitting"
      @confirm="confirmDelete"
      @cancel="isDeleteModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Download, FileDown, FileText } from 'lucide-vue-next';
import { exportInventoryPdf } from '@/features/inventory/composables/useInventoryPdf';
import { useInventoryStore, type Ingredient } from '@/features/inventory/store';
import { useAuthStore } from '@/features/auth/store';
import IngredientForm from '@/features/inventory/components/IngredientForm.vue';
import IngredientList from '@/features/inventory/components/IngredientList.vue';
import ConfirmModal from '@/shared/components/ui/modal/ConfirmModal.vue';
import { Sheet, SheetContent } from '@/shared/components/ui/sheet';


import { useToast } from "primevue/usetoast";
import Toast from 'primevue/toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const toast = useToast();
const visible = ref(false);
const progress = ref(0);
const isPdfExporting = ref(false);
const store = useInventoryStore();
const authStore = useAuthStore();


// UI State
const isFormOpen = ref(false);
const editingItem = ref<Ingredient | null>(null);
const isSubmitting = ref(false)

// Modal states
const isDeleteModalOpen = ref(false);
const skuToDelete = ref<string | null>(null);
const skusToDelete = ref<string[]>([]);
const isDeleteSubmitting = ref(false);

//onMounted sẽ giống useEffect(() => {}, []) trong React, tức là useEffect mà ko có dependency nào cả
onMounted( async() => {
  try {
    await store.fetchIngredients()
  } catch(error) {
    console.error('Failed to fetch ingredients:', error)
  }
  // chỗ này nên thêm Toast để user biết fetch thất bại, hoặc có thể retry fetch sau vài giây
});

const openNewForm = () => {
  editingItem.value = null;
  isFormOpen.value = true;
};

const downloadPdf = async () => {
  if (isPdfExporting.value) return;
  isPdfExporting.value = true;
  try {
    const exportedBy = authStore.displayName ?? authStore.userEmail ?? 'Unknown';
    await exportInventoryPdf(store.items, exportedBy);
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xuất PDF báo cáo kho thành công!', life: 3000 });
  } catch (error) {
    console.error('Lỗi xuất PDF:', error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xuất PDF. Vui lòng thử lại.', life: 3000 });
  } finally {
    isPdfExporting.value = false;
  }
};

const closeForm = () => {
  if (isSubmitting.value) return; // Không cho đóng form nếu đang lưu
  editingItem.value = null;
  isFormOpen.value = false;
};

const handleSave = async (itemData: Ingredient) => {
  if (isSubmitting.value) return; 

  if (!editingItem.value) {
    const isDuplicate = store.items.some(item => item.sku.toLowerCase() === itemData.sku.toLowerCase());
    if (isDuplicate) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Mã SKU đã tồn tại', life: 3000 });
      return;
    }
  }

  isSubmitting.value = true;
  try {
    if (editingItem.value) {
      await store.updateIngredient(itemData);
    } else {
      await store.addIngredient(itemData);
    }
    // Chỉ gọi lại fetchIngredients() nếu store KHÔNG tự update local state
    await store.fetchIngredients(); 
    isSubmitting.value = false; // Kết thúc submit, enable form
    closeForm();
  } catch(error) {
    console.error('Failed to save ingredient:', error);
    // Show toast error cho user biết
  } finally {
    isSubmitting.value = false; // Đảm bảo luôn enable form dù thành công hay thất bại
  }
};

const handleEdit = (item: Ingredient) => {
  // Pass một shallow copy để tránh mutate trực tiếp store state nếu Form lỡ bind v-model thẳng vào prop
  editingItem.value = { ...item }; 
  isFormOpen.value = true;
};

const handleDelete = (sku: string) => {
  skusToDelete.value = [];
  skuToDelete.value = sku;
  isDeleteModalOpen.value = true;
};

const handleDeleteMultiple = (codes: string[]) => {
  skuToDelete.value = null;
  skusToDelete.value = [...codes];
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  try {
    isDeleteSubmitting.value = true;
    if (skuToDelete.value) {
      await store.deleteIngredient(skuToDelete.value);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa nguyên liệu', life: 3000 });
    } else if (skusToDelete.value.length > 0) {
      for (const code of skusToDelete.value) {
        await store.deleteIngredient(code);
      }
      toast.add({ severity: 'success', summary: 'Thành công', detail: `Đã xóa ${skusToDelete.value.length} nguyên liệu`, life: 3000 });
    }
  } catch(error) {
    console.error('Failed to delete ingredient:', error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa nguyên liệu', life: 3000 });
  } finally {
    isDeleteSubmitting.value = false;
    isDeleteModalOpen.value = false;
    skuToDelete.value = null;
    skusToDelete.value = [];
  }
};

const downloadExcel = async () => {
  // Hiện toast loading
  if (!visible.value) {
    toast.add({ severity: 'custom', summary: 'Đang tạo file Excel...', group: 'headless', styleClass: 'backdrop-blur-lg ' });
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

    // 2. Sắp xếp data theo SKU
    const sortedItems = [...store.items].sort((a, b) => a.sku.localeCompare(b.sku));

    // 3. Khởi tạo Workbook và Worksheet bằng exceljs
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Báo cáo kho');

    // 4. Khai báo các cột và độ rộng
    worksheet.columns = [
      { header: 'Mã (SKU)', key: 'sku', width: 25 },
      { header: 'Tên nguyên liệu', key: 'name', width: 30 },
      { header: 'Danh mục', key: 'category', width: 20 },
      { header: 'Số lượng', key: 'quantity', width: 15 },
      { header: 'Đơn vị', key: 'unit', width: 10 },
      { header: 'Đơn giá (VND)', key: 'cost', width: 20 },
      { header: 'Tổng giá trị (VND)', key: 'total', width: 20 },
      { header: 'Ngày sản xuất', key: 'prod', width: 20 },
      { header: 'Ngày hết hạn', key: 'exp', width: 20 }
    ];

    // 5. Thêm màu sắc và style cho hàng Tiêu đề (Header)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Chữ trắng in đậm
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A2E16' } // Nền xanh lá đậm (Mã màu HEX thêm FF ở đầu cho alpha channel)
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // 6. Đổ data vào các hàng
    sortedItems.forEach(item => {
      worksheet.addRow({
        sku: item.sku,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        cost: item.cost,
        total: item.quantity * item.cost,
        prod: item.production_date ? new Date(item.production_date).toLocaleDateString('vi-VN') : '-',
        exp: item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('vi-VN') : '-'
      });
    });

    // 7. Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    clearInterval(progressInterval);
    progress.value = 100;

    // Dùng file-saver tải xuống an toàn và gọn gàng hơn
    saveAs(blob, `Bao_cao_kho_${new Date().getTime()}.xlsx`);

    // 8. Tắt toast sau 0.5 giây
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

</script>