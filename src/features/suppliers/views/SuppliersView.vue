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
        <h2 class="text-3xl font-bold text-white tracking-tight">Nhà cung cấp</h2>
        <p class="text-gray-400 text-sm mt-1">Quản lý đối tác và thông tin liên hệ đặt hàng.</p>
      </div>

      <div class="flex gap-2">
        <button 
          @click="downloadExcel" 
          class="bg-green-500 text-black px-4 py-2 rounded font-bold hover:bg-[#37EC13] transition-colors flex items-center gap-2"
        >
          <Download class="w-4 h-4" aria-hidden="true" />
          Xuất Excel
        </button>
        <button v-if="authStore.hasPermission('supplier_write')" @click="openNewForm" class="bg-[#37EC13] hover:bg-[#45F522] text-[#132210] px-4 py-2 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(55,236,19,0.3)]">
          <Plus class="w-5 h-5"/>
          Thêm nhà cung cấp
        </button>
      </div>
    </div>

    <section class="w-full mt-2">
      <!-- List Panel -->
      <div class="transition-all w-full">
        <SupplierList
          :suppliers="store.items"
          @edit="openEditForm"
          @delete="handleDelete"
          @delete-multiple="handleDeleteMultiple"
        />
      </div>
    </section>

    <!-- Form Modal -->
    <Sheet v-model:open="isFormOpen">
      <SheetContent side="right" class="w-full sm:max-w-2xl overflow-y-auto">
        <SupplierForm
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
      :title="supplierToDelete ? 'Xác nhận xóa nhà cung cấp' : 'Xác nhận xóa nhiều'"
      :message="supplierToDelete ? 'Bạn có chắc chắn muốn xóa nhà cung cấp này không?' : `Bạn có chắc chắn muốn xóa ${suppliersToDelete.length} nhà cung cấp đã chọn không?`"
      :isLoading="isDeleteSubmitting"
      @confirm="confirmDelete"
      @cancel="isDeleteModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SupplierForm from '@/features/suppliers/components/SupplierForm.vue';
import SupplierList from '@/features/suppliers/components/SupplierList.vue';
import ConfirmModal from '@/shared/components/ui/modal/ConfirmModal.vue';
import { useSuppliersStore, type Supplier } from '@/features/suppliers/store';
import { useAuthStore } from '@/features/auth/store';
import { Plus, Download, FileDown } from 'lucide-vue-next';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/shared/components/ui/sheet';
import { useToast } from "primevue/usetoast";
import Toast from 'primevue/toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Use the Pinia Store
const store = useSuppliersStore();
const authStore = useAuthStore();

// UI State
const isFormOpen = ref(false);
const editingItem = ref<Supplier | null>(null);
const visible = ref(false);
const progress = ref(0);

// Modal states
const isDeleteModalOpen = ref(false);
const supplierToDelete = ref<string | null>(null);
const suppliersToDelete = ref<string[]>([]);

const isSubmitting = ref(false);
const isDeleteSubmitting = ref(false);

onMounted(() => {
  store.fetchSuppliers();
});

// Actions
const openNewForm = () => {
  editingItem.value = null;
  isFormOpen.value = true;
};

const openEditForm = (item: Supplier) => {
  editingItem.value = item;
  isFormOpen.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const closeForm = () => {
  editingItem.value = null;
  isFormOpen.value = false;
};

const toast = useToast();

const handleSave = async (itemData: Supplier) => {
  if (!editingItem.value) {
    const isDuplicate = store.items.some(item => item.supplier_code.toLowerCase() === itemData.supplier_code.toLowerCase());
    if (isDuplicate) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Mã nhà cung cấp đã tồn tại', life: 3000 });
      return;
    }
  }

  isSubmitting.value = true;
  try {
    if (editingItem.value) {
      await store.updateSupplier(itemData);
    } else {
      await store.addSupplier(itemData);
    }
    await store.fetchSuppliers();
    closeForm();
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = (supplierCode: string) => {
  suppliersToDelete.value = [];
  supplierToDelete.value = supplierCode;
  isDeleteModalOpen.value = true;
};

const handleDeleteMultiple = (codes: string[]) => {
  supplierToDelete.value = null;
  suppliersToDelete.value = [...codes];
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  try {
    isDeleteSubmitting.value = true;
    if (supplierToDelete.value) {
      await store.deleteSupplier(supplierToDelete.value);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa NCC cập thành công', life: 3000 });
      if (editingItem.value?.supplier_code === supplierToDelete.value) {
        closeForm();
      }
    } else if (suppliersToDelete.value.length > 0) {
      for (const code of suppliersToDelete.value) {
        await store.deleteSupplier(code);
      }
      toast.add({ severity: 'success', summary: 'Thành công', detail: `Đã xóa ${suppliersToDelete.value.length} NCC thành công`, life: 3000 });
      if (editingItem.value && suppliersToDelete.value.includes(editingItem.value.supplier_code)) {
        closeForm();
      }
    }
    await store.fetchSuppliers();
  } catch (error) {
    console.error('Lỗi khi xóa nhà cung cấp:', error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa nhà cung cấp', life: 3000 });
  } finally {
    isDeleteSubmitting.value = false;
    isDeleteModalOpen.value = false;
    supplierToDelete.value = null;
    suppliersToDelete.value = [];
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

    const sortedItems = [...store.items].sort((a, b) => a.supplier_code.localeCompare(b.supplier_code));
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách nhà cung cấp');

    worksheet.columns = [
      { header: 'Mã NCC', key: 'supplier_code', width: 15 },
      { header: 'Tên nhà cung cấp', key: 'name', width: 30 },
      { header: 'Người liên hệ', key: 'contact_name', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Số điện thoại', key: 'phone', width: 20 },
      { header: 'Địa chỉ', key: 'address', width: 40 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Mặt hàng cung cấp', key: 'ingredients_list', width: 40 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A2E16' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    sortedItems.forEach(item => {
      worksheet.addRow({
        supplier_code: item.supplier_code,
        name: item.name,
        contact_name: item.contact_name || '-',
        email: item.email || '-',
        phone: item.phone || '-',
        address: item.address || '-',
        status: item.status === 'Active' ? 'Hoạt động' : 'Ngừng hoạt động',
        ingredients_list: (item.ingredients || []).map((i: any) => i.ingredient_name).join(', ') || '-'
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    clearInterval(progressInterval);
    progress.value = 100;

    saveAs(blob, `Danh_sach_NCC_${new Date().getTime()}.xlsx`);

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
