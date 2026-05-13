<template>
  <div class="flex flex-col w-full relative">
    
    <!-- Toast -->
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
    <div class="flex justify-between mb-6 items-center">
      <div>
        <h2 class="text-3xl font-bold text-white tracking-tight">Thực đơn món ăn</h2>
        <p class="text-gray-400 text-sm mt-1">Quản lý công thức và giá bán trên toàn bộ thực đơn.</p>
      </div>

      <div class="flex gap-2">
        <button 
          @click="downloadExcel" 
          class="bg-green-500 text-black px-4 py-2 rounded font-bold hover:bg-[#37EC13] transition-colors flex items-center gap-2"
        >
          <Download class="w-4 h-4" aria-hidden="true" />
          Xuất Excel
        </button>

        <button v-if="authStore.hasPermission('dish_write')" @click="openNewForm" class="bg-[#37EC13] hover:bg-[#45F522] text-[#132210] px-4 py-2 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(55,236,19,0.3)]">
          <Plus class="w-5 h-5"/>
          Thêm món ăn
        </button>
      </div>
    </div>

    <section class="w-full mt-2">
      <!-- List Panel -->
      <div class="transition-all w-full">
        <DishList
          :dishes="store.items"
          @edit="openEditForm"
          @delete="handleDelete"
          @delete-multiple="handleDeleteMultiple"
        />
      </div>
    </section>

    <!-- Form Modal -->
    <Sheet v-model:open="isFormOpen">
      <SheetContent side="right" class="w-full sm:max-w-4xl overflow-y-auto">
        <!-- <SheetHeader class="mb-6">
          <SheetTitle>{{ editingItem ? 'Edit Dish' : 'New Dish' }}</SheetTitle>
          <SheetDescription>Build and manage your recipe</SheetDescription>
        </SheetHeader> -->
        <DishForm
          :itemToEdit="editingItem"
          :isSubmitting="isSubmittingForm"
          @save="handleSave"
          @cancel-edit="closeForm"
        />
      </SheetContent>
    </Sheet>

    <!-- UI Modals -->
    <ConfirmModal
      :isOpen="isDeleteModalOpen"
      :title="dishToDelete ? 'Xác nhận xóa món ăn' : 'Xác nhận xóa nhiều'"
      :message="dishToDelete ? 'Bạn có chắc chắn muốn xóa món ăn này và công thức của nó không?' : `Bạn có chắc chắn muốn xóa ${dishesToDelete.length} món ăn đã chọn không?`"
      :isLoading="isDeleteSubmitting"
      @confirm="confirmDelete"
      @cancel="isDeleteModalOpen = false"
    />


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DishForm from '@/features/dishes/components/DishForm.vue';
import DishList from '@/features/dishes/components/DishList.vue';
import ConfirmModal from '@/shared/components/ui/modal/ConfirmModal.vue';
import { useDishesStore, type Dish } from '@/features/dishes/store';
import { useInventoryStore } from '@/features/inventory/store';
import { useAuthStore } from '@/features/auth/store';
import { Plus, Download, FileDown } from 'lucide-vue-next';
import { Sheet, SheetContent} from '@/shared/components/ui/sheet';
import { useToast } from "primevue/usetoast";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Use the Pinia Store
const store = useDishesStore();
const inventoryStore = useInventoryStore();
const authStore = useAuthStore();
const toast = useToast();

// UI State
const isFormOpen = ref(false);
const editingItem = ref<Dish | null>(null);
const visible = ref(false);
const progress = ref(0);

// Modal states
const isDeleteModalOpen = ref(false);
const dishToDelete = ref<string | null>(null);
const dishesToDelete = ref<string[]>([]);



const isSubmittingForm = ref(false);
const isDeleteSubmitting = ref(false);


onMounted(() => {
  store.fetchDishes();
  // Fetch ingredients so DishForm can load categories and use ingredients
  inventoryStore.fetchIngredients();
});

// Actions
const openNewForm = () => {
  editingItem.value = null;
  isFormOpen.value = true;
};

const openEditForm = (item: Dish) => {
  editingItem.value = item;
  isFormOpen.value = true;
  // Scroll to top on mobile when opening form
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const closeForm = () => {
  editingItem.value = null;
  isFormOpen.value = false;
};

const handleSave = async (itemData: Dish) => {
  if (!editingItem.value) {
    const isDuplicate = store.items.some(item => item.dish_code.toLowerCase() === itemData.dish_code.toLowerCase());
    if (isDuplicate) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Mã món ăn đã tồn tại', life: 3000 });
      return;
    }
  }

  if (editingItem.value) {
    isSubmittingForm.value = true;
    try {
      await store.updateDish(itemData);
      await store.fetchDishes();
      closeForm();
    } finally {
      isSubmittingForm.value = false;
    }
  } else {
    isSubmittingForm.value = true;
    try {
      await store.addDish(itemData);
      await store.fetchDishes();
      closeForm();
    } finally {
      isSubmittingForm.value = false;
    }
  }
};

const handleDelete = (dishCode: string) => {
  dishesToDelete.value = [];
  dishToDelete.value = dishCode;
  isDeleteModalOpen.value = true;
};

const handleDeleteMultiple = (codes: string[]) => {
  dishToDelete.value = null;
  dishesToDelete.value = [...codes];
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  isDeleteSubmitting.value = true;
  try {
    if (dishToDelete.value) {
      await store.deleteDish(dishToDelete.value);
      if (editingItem.value?.dish_code === dishToDelete.value) {
        closeForm();
      }
    } else if (dishesToDelete.value.length > 0) {
      for (const code of dishesToDelete.value) {
        await store.deleteDish(code);
      }
      if (editingItem.value && dishesToDelete.value.includes(editingItem.value.dish_code)) {
        closeForm();
      }
    }
    await store.fetchDishes();
    toast.add({ severity: 'success', summary: 'Thành công', detail: dishToDelete.value ? 'Đã xóa món ăn' : `Đã xóa ${dishesToDelete.value.length} món ăn`, life: 3000 });
  } catch (error) {
    console.error('Error deleting dish(es):', error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra', life: 3000 });
  } finally {
    isDeleteSubmitting.value = false;
    isDeleteModalOpen.value = false;
    dishToDelete.value = null;
    dishesToDelete.value = [];
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

    const sortedItems = [...store.items].sort((a, b) => a.dish_code.localeCompare(b.dish_code));
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Báo cáo món ăn');

    worksheet.columns = [
      { header: 'Mã món ăn', key: 'dish_code', width: 15 },
      { header: 'Tên món ăn', key: 'name', width: 30 },
      { header: 'Danh mục', key: 'category', width: 20 },
      { header: 'Giá bán (VND)', key: 'selling_price', width: 20 },
      { header: 'Thời gian cb.bị (phút)', key: 'prep_time', width: 15 },
      { header: 'Khẩu phần', key: 'servings', width: 10 },
      { header: 'Chi phí nhân công (VND)', key: 'labor_cost', width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A2E16' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    sortedItems.forEach(item => {
      worksheet.addRow({
        dish_code: item.dish_code,
        name: item.name,
        category: item.category,
        selling_price: item.selling_price,
        prep_time: item.prep_time,
        servings: item.servings,
        labor_cost: item.labor_cost
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    clearInterval(progressInterval);
    progress.value = 100;

    saveAs(blob, `Dishes_Report_${new Date().getTime()}.xlsx`);

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

<style scoped>
select {
  width: 200px;
  overflow: hidden;
  background-color: #121811; 
  color: white;
  border: 1px solid #2A362C;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
}

option {
  font-size: 14px;
  padding: 12px;
  background-color: #0F1410;
  color: white;
}
</style>
