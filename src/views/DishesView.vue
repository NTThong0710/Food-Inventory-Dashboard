<template>
  <div class="flex flex-col gap-6 w-full relative">
    
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
              <label class="text-sm font-bold text-white dark:text-black">{{ progress }}% downloaded</label>
            </div>
            <div class="flex gap-4 mb-4 justify-end">
              <Button label="Cancel" size="small" @click="closeCallback"></Button>
            </div>
          </section>
        </template>
      </Toast>
    </div>

    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-white tracking-tight">Dishes Menu</h2>
        <p class="text-gray-400 text-sm mt-1">Manage your recipes and selling prices across the menu.</p>
      </div>

      <div class="flex gap-2">
        <button 
          @click="downloadExcel" 
          class="bg-green-500 text-black px-4 py-2 rounded font-bold hover:bg-[#37EC13] transition-colors flex items-center gap-2"
        >
          <Download class="w-4 h-4" aria-hidden="true" />
          Export Excel
        </button>

        <button @click="openNewForm" class="bg-[#37EC13] hover:bg-[#45F522] text-[#132210] px-4 py-2 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(55,236,19,0.3)]">
          <Plus class="w-5 h-5"/>
          New Dish
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
          @save="handleSave"
          @cancel-edit="closeForm"
        />
      </SheetContent>
    </Sheet>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DishForm from '@/components/dishes/DishForm.vue';
import DishList from '@/components/dishes/DishList.vue';
import { useDishesStore, type Dish } from '@/stores/dishes';
import { useInventoryStore } from '@/stores/inventory';
import { Plus, Download } from 'lucide-vue-next';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useToast } from "primevue/usetoast";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Use the Pinia Store
const store = useDishesStore();
const inventoryStore = useInventoryStore();
const toast = useToast();

// UI State
const isFormOpen = ref(false);
const editingItem = ref<Dish | null>(null);
const visible = ref(false);
const progress = ref(0);

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
  if (editingItem.value) {
    await store.updateDish(itemData);
  } else {
    // Generate new ID if needed (though DishForm does it, this is backup)
    await store.addDish(itemData);
  }
  await store.fetchDishes();
  closeForm();
};

const handleDelete = async (dishCode: string) => {
  if (confirm('Are you sure you want to delete this dish and its recipes?')) {
    await store.deleteDish(dishCode);
    await store.fetchDishes();
    if (editingItem.value?.dish_code === dishCode) {
      closeForm();
    }
  }
};

const downloadExcel = async () => {
  if (!visible.value) {
    toast.add({ severity: 'custom', summary: 'Generating Excel file...', group: 'headless', styleClass: 'backdrop-blur-lg rounded-2xl' });
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
    const worksheet = workbook.addWorksheet('Dishes Report');

    worksheet.columns = [
      { header: 'Dish Code', key: 'dish_code', width: 15 },
      { header: 'Dish Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Selling Price (VND)', key: 'selling_price', width: 20 },
      { header: 'Prep Time (min)', key: 'prep_time', width: 15 },
      { header: 'Servings', key: 'servings', width: 10 },
      { header: 'Labor Cost (VND)', key: 'labor_cost', width: 20 },
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
