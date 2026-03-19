<template>
  <div class="flex flex-col gap-6 w-full relative">
    
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-white tracking-tight">Suppliers</h2>
        <p class="text-gray-400 text-sm mt-1">Manage your vendors and order contacts.</p>
      </div>
      <button @click="openNewForm" class="bg-[#37EC13] hover:bg-[#45F522] text-[#132210] px-4 py-2 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(55,236,19,0.3)]">
        <Plus class="w-5 h-5"/>
        New Supplier
      </button>
    </div>

    <section class="w-full mt-2">
      <!-- List Panel -->
      <div class="transition-all w-full">
        <SupplierList
          :suppliers="store.items"
          @edit="openEditForm"
          @delete="handleDelete"
        />
      </div>
    </section>

    <!-- Form Modal -->
    <Sheet v-model:open="isFormOpen">
      <SheetContent side="right" class="w-full sm:max-w-2xl overflow-y-auto">
        <!-- <SheetHeader class="mb-6">
          <SheetTitle>{{ editingItem ? 'Edit Supplier' : 'New Supplier' }}</SheetTitle>
          <SheetDescription>Add or update supplier information</SheetDescription>
        </SheetHeader> -->
        <SupplierForm
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
import SupplierForm from '@/components/suppliers/SupplierForm.vue';
import SupplierList from '@/components/suppliers/SupplierList.vue';
import { useSuppliersStore, type Supplier } from '@/stores/suppliers';
import { Plus } from 'lucide-vue-next';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

// Use the Pinia Store
const store = useSuppliersStore();

// UI State
const isFormOpen = ref(false);
const editingItem = ref<Supplier | null>(null);

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

const handleSave = async (itemData: Supplier) => {
  if (editingItem.value) {
    await store.updateSupplier(itemData);
  } else {
    await store.addSupplier(itemData);
  }
  await store.fetchSuppliers();
  closeForm();
};

const handleDelete = async (supplierCode: string) => {
  if (confirm('Are you sure you want to remove this supplier?')) {
    await store.deleteSupplier(supplierCode);
    await store.fetchSuppliers();
    if (editingItem.value?.supplier_code === supplierCode) {
      closeForm();
    }
  }
};
</script>
