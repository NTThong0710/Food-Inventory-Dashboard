<template>
  <div class="flex flex-col gap-6 w-full">


        <!-- Toast -->
<div class="card flex justify-center">
  <Toast position="top-center" group="headless" @close="visible = false">
    <template #container="{ message, closeCallback }">
      <section class="flex flex-col p-4 gap-4 w-full bg-primary/70 rounded-xl">
        <div class="flex items-center gap-5">
          <i class="pi pi-cloud-download text-white dark:text-black text-2xl"></i>
          <span class="font-bold text-base text-white dark:text-black">{{ message.summary }}</span>
        </div>
        <div class="flex flex-col gap-2">
          <ProgressBar :value="progress" :showValue="false" :style="{ height: '4px' }" pt:value:class="!bg-primary-50 dark:!bg-primary-900" class="bg-primary/80!"></ProgressBar>
          <label class="text-sm font-bold text-white dark:text-black">{{ progress }}% đã tải</label>
        </div>
        <div class="flex gap-4 mb-4 justify-end">
          <Button label="Hủy" size="small" @click="closeCallback"></Button>
        </div>
      </section>
    </template>
  </Toast>
</div>

    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-amber-50">Quản lý nguyên liệu</h2>
        <p class="text-gray-400 text-sm mt-1">Quản lý tất cả nguyên liệu, số lượng và chi phí.</p>
      </div>

      <div class="flex gap-2">
        <button 
          @click="downloadExcel" 
          class="bg-green-500 text-black px-4 py-2 rounded font-bold hover:bg-[#37EC13] transition-colors flex items-center gap-2"
        >
          <Download class="w-4 h-4" aria-hidden="true" />
          Xuất Excel
        </button>
      
        <!-- Nút thêm mới -->
        <button 
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
        />
      </div>

    </section>

    <!-- Form Modal -->
    <Sheet v-model:open="isFormOpen">
      <SheetContent side="right" class="w-full sm:max-w-2xl overflow-y-auto">
        <IngredientForm 
          :itemToEdit="editingItem" 
          @save="handleSave"
          @cancel-edit="closeForm"
        />
      </SheetContent>
    </Sheet>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Download } from 'lucide-vue-next';
import { useInventoryStore, type Ingredient } from '@/stores/inventory';
import IngredientForm from '@/components/inventory/IngredientForm.vue';
import IngredientList from '@/components/inventory/IngredientList.vue';
import { Sheet, SheetContent } from '@/components/ui/sheet';


import { useToast } from "primevue/usetoast";
import Toast from 'primevue/toast';
import ProgressBar from 'primevue/progressbar';
import Button from 'primevue/button';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const toast = useToast();
const visible = ref(false);
const progress = ref(0);
const store = useInventoryStore();


const downloadExcel = async () => {
  // 1. Hiện toast loading
  if (!visible.value) {
    toast.add({ severity: 'custom', summary: 'Đang tạo file Excel...', group: 'headless', styleClass: 'backdrop-blur-lg ' });
    visible.value = true;
  }
  progress.value = 0;

  // Fake loading cho mượt
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
// UI State
const isFormOpen = ref(false);
const editingItem = ref<Ingredient | null>(null);
const isSubmitting = ref(false) // Trạng thái để disable form khi đang submit, tránh double submit hoặc đóng form giữa chừng

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

const handleDelete = async (sku: string) => {
  // Thêm window.confirm đơn giản, hoặc dùng Modal Confirm của dự án
  if (!window.confirm('Bạn có chắc chắn muốn xóa nguyên liệu này không?')) return;
  
  try {
    await store.deleteIngredient(sku);
    // Show toast success
  } catch(error) {
    console.error('Failed to delete ingredient:', error);
    // Show toast error
  }
};



</script>