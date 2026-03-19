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
              <label class="text-sm font-bold text-white dark:text-black">{{ progress }}% downloaded</label>
            </div>
            <div class="flex gap-4 mb-4 justify-end">
              <Button label="Cancel" size="small" @click="closeCallback"></Button>
            </div>
          </section>
        </template>
      </Toast>
    </div>

    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-amber-50">Dashboard</h2>
        <p class="text-gray-400 text-sm mt-1">{{ today }}</p>
      </div>
      <button 
        @click="downloadAllExcel" 
        class="bg-gradient-to-r from-green-500 to-[#37EC13] text-black px-5 py-2.5 rounded-xl font-black hover:scale-105 hover:shadow-[0_0_20px_rgba(55,236,19,0.5)] transition-all duration-300 flex items-center gap-2"
      >
        <Download class="w-5 h-5" aria-hidden="true" />
        Export All Data
      </button>
    </div>

    <!-- Row 1: 4 KPI Cards -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">

      <!-- Ingredients -->
      <div class="bg-[#1A2E16] p-5 rounded-2xl border border-[#2A362C] flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Ingredients</span>
          <div class="w-8 h-8 rounded-xl bg-[#37EC13]/10 flex items-center justify-center">
            <AlignEndVertical class="w-4 h-4 text-[#37EC13]" aria-hidden="true"/>
          </div>
        </div>
        <div>
          <p class="text-4xl font-black text-amber-50 tabular-nums">{{ inventoryStore.totalItems }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ inventoryStore.totalCategories }} categories</p>
        </div>
      </div>

      <!-- Active Dishes -->
      <div class="bg-[#1A2E16] p-5 rounded-2xl border border-[#2A362C] flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Dishes</span>
          <div class="w-8 h-8 rounded-xl bg-[#37EC13]/10 flex items-center justify-center">
            <Utensils class="w-4 h-4 text-[#37EC13]" aria-hidden="true"/>
          </div>
        </div>
        <div>
          <p class="text-4xl font-black text-amber-50 tabular-nums">{{ dishesStore.totalDishes }}</p>
          <p class="text-xs text-gray-500 mt-1">on the menu</p>
        </div>
      </div>

      <!-- Inventory Value -->
      <div class="bg-[#1A241B] p-5 rounded-2xl border border-[#2A362C] flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Inventory Value</span>
          <div class="w-8 h-8 rounded-xl bg-[#37EC13]/10 flex items-center justify-center">
            <DollarSign class="w-4 h-4 text-[#37EC13]" aria-hidden="true"/>
          </div>
        </div>
        <div>
          <p class="text-3xl font-black text-amber-50 tabular-nums leading-tight">{{ (inventoryStore.grandTotalValue / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) }}<span class="text-base font-semibold text-gray-400">k ₫</span></p>
          <p class="text-xs text-gray-500 mt-1">total stock value</p>
        </div>
      </div>

      <!-- Avg Dish Cost -->
      <div class="bg-[#1A241B] p-5 rounded-2xl border border-[#2A362C] flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg Dish Cost</span>
          <div class="w-8 h-8 rounded-xl bg-[#37EC13]/10 flex items-center justify-center">
            <Receipt class="w-4 h-4 text-[#37EC13]" aria-hidden="true"/>
          </div>
        </div>
        <div>
          <p class="text-3xl font-black text-amber-50 tabular-nums leading-tight">{{ avgDishCostFormatted }}<span class="text-base font-semibold text-gray-400"> ₫</span></p>
          <p class="text-xs text-gray-500 mt-1">per dish avg</p>
        </div>
      </div>

    </section>

    <!-- Row 2: Category Spend bar chart + Inventory Column Chart -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Category Spend - Enhanced -->
      <div class="bg-linear-to-br from-[#1A241B] to-[#1A2E16] border border-[#2A362C] hover:border-[#37EC13]/30 transition-all duration-300 rounded-2xl p-6 flex flex-col gap-5 shadow-lg hover:shadow-[0_0_20px_rgba(55,236,19,0.1)]">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-bold text-white text-base">Category Spend</h3>
              <DollarSign class="w-4 h-4 text-[#37EC13]" />
            </div>
            <p class="text-gray-500 text-xs">Inventory cost distribution</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-black text-[#37EC13] tabular-nums">
              {{ (inventoryStore.grandTotalValue / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) }}<span class="text-xs font-semibold text-gray-400">M ₫</span>
            </p>
            <p class="text-xs text-gray-500">Total Value</p>
          </div>
        </div>

        <div class="h-px bg-[#2A362C]"></div>

        <!-- Enhanced Horizontal bars -->
        <div v-if="categorySpend.length > 0" class="flex flex-col gap-3">
          <div v-for="(cat, idx) in categorySpend" :key="cat.name" class="flex flex-col gap-1.5 group">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: getGradientColor(idx) }"></div>
                <span class="text-xs font-semibold text-gray-300 group-hover:text-amber-50 transition-colors">{{ cat.name }}</span>
              </div>
              <span class="text-xs font-bold text-gray-400 group-hover:text-[#37EC13] transition-colors tabular-nums">
                {{ (cat.value / 1000).toFixed(1) }}k ₫ 
                <span class="text-gray-600 font-normal">({{ cat.pct }}%)</span>
              </span>
            </div>
            <div class="w-full h-5 md:h-6 bg-[#050805] rounded-full overflow-hidden border border-[#2A362C]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
              <div
                class="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-1000 ease-out relative"
                :style="{ 
                  width: Math.max(cat.pct, 2) + '%', 
                  background: `linear-gradient(90deg, ${getGradientColor(idx)}20, ${getGradientColor(idx)})`,
                  boxShadow: `0 0 15px ${getGradientColor(idx)}50`
                }"
              >
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div class="absolute inset-x-0 top-0 h-[2px] bg-white/30 rounded-t-full"></div>
                <span v-if="cat.pct > 8" class="text-[10px] md:text-[11px] font-black text-[#050805] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)] relative z-10">{{ cat.pct }}%</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex-1 flex items-center justify-center py-8 text-gray-500 text-sm">
          No inventory data yet
        </div>
      </div>

      <!-- Quantity by Category (Column Bar Chart) -->
      <InventoryBarChart />

    </div>

    <!-- Row 3: Recent Dishes Table -->
    <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl overflow-hidden">
      <div class="px-6 py-5 border-b border-[#2A362C] flex justify-between items-center">
        <div>
          <h3 class="font-bold text-white text-base">Recent Dishes</h3>
          <p class="text-gray-500 text-xs mt-0.5">Latest items on the menu</p>
        </div>
        <router-link to="/dishes" class="text-xs text-[#37EC13] hover:underline font-medium">View All</router-link>
      </div>

      <!-- Empty state -->
      <div v-if="dishesStore.items.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500 text-sm">
        <Utensils class="w-8 h-8 mb-2 opacity-30" aria-hidden="true"/>
        <p>No dishes yet</p>
      </div>

      <!-- Table -->
      <template v-else>
        <!-- Header -->
        <div class="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-3 bg-[#132210] text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          <div>Dish Name</div>
          <div>Category</div>
          <div class="text-right">Selling Price</div>
          <div class="text-right">Avg Cost</div>
        </div>
        <!-- Rows -->
        <div class="flex flex-col divide-y divide-[#2A362C]/60">
          <div
            v-for="dish in recentDishes"
            :key="dish.dish_code"
            class="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-2 md:gap-4 px-6 py-4 hover:bg-[#1F2B1E]/60 transition-colors items-center"
          >
            <p class="font-semibold text-sm text-gray-100 truncate">{{ dish.name }}</p>
            <span class="text-xs font-medium text-[#37EC13]">{{ dish.category || '—' }}</span>
            <p class="text-sm font-bold text-amber-50 md:text-right tabular-nums">
              {{ dish.selling_price ? dish.selling_price.toLocaleString('vi-VN') + ' ₫' : '—' }}
            </p>
            <p class="text-sm text-gray-400 md:text-right tabular-nums">
              {{ dish.selling_price ? (dish.selling_price * 0.6).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' ₫' : '—' }}
            </p>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { AlignEndVertical, Utensils, DollarSign, Receipt, Download } from 'lucide-vue-next';
import InventoryBarChart from '@/components/ui/chart/InventoryBarChart.vue';
import { useInventoryStore } from '@/stores/inventory';
import { useDishesStore } from '@/stores/dishes';
import { useSuppliersStore } from '@/stores/suppliers';
import { useToast } from "primevue/usetoast";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const inventoryStore = useInventoryStore();
const dishesStore = useDishesStore();
const suppliersStore = useSuppliersStore();
const toast = useToast();

const visible = ref(false);
const progress = ref(0);

const today = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

// Color palette for category spend
const gradientColors = [
  '#37EC13', '#4ade80', '#22c55e', '#16a34a', '#34d399', '#86efac'
];

const getGradientColor = (idx: number) => gradientColors[idx % gradientColors.length];

// Category Spend: group inventory by category, calc value = cost * quantity
const categorySpend = computed(() => {
  const grouped: Record<string, number> = {};
  inventoryStore.items.forEach(item => {
    grouped[item.category] = (grouped[item.category] ?? 0) + (item.cost ?? 0) * (item.quantity ?? 0);
  });
  const total = Object.values(grouped).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value, pct: Math.round((value / total) * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
});

// Avg Dish Cost across all dishes (use selling_price as proxy if no total_cost)
const avgDishCostFormatted = computed(() => {
  const items = dishesStore.items;
  if (items.length === 0) return '—';
  const total = items.reduce((sum, d) => sum + (d.selling_price || 0), 0);
  const avg = total / items.length;
  return (avg / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + 'k';
});

// Recent 5 dishes (last added = highest id)
const recentDishes = computed(() =>
  [...dishesStore.items]
    .sort((a, b) => b.dish_code.localeCompare(a.dish_code))
    .slice(0, 5)
);

onMounted(() => {
  if (inventoryStore.items.length === 0) inventoryStore.fetchIngredients();
  if (dishesStore.items.length === 0) dishesStore.fetchDishes();
  if (suppliersStore.items.length === 0) suppliersStore.fetchSuppliers();
});

const downloadAllExcel = async () => {
  if (!visible.value) {
    toast.add({ severity: 'custom', summary: 'Exporting All Data...', group: 'headless', styleClass: 'backdrop-blur-lg rounded-2xl' });
    visible.value = true;
  }
  progress.value = 0;

  const progressInterval = setInterval(() => {
    if (progress.value < 85) progress.value += Math.floor(Math.random() * 10) + 5; 
  }, 150);

  try {
    // Wait for data if not loaded
    await Promise.all([
      inventoryStore.items.length === 0 ? inventoryStore.fetchIngredients() : Promise.resolve(),
      dishesStore.items.length === 0 ? dishesStore.fetchDishes() : Promise.resolve(),
      suppliersStore.items.length === 0 ? suppliersStore.fetchSuppliers() : Promise.resolve(),
    ]);
    
    await new Promise(resolve => setTimeout(resolve, 800)); // Fake loading

    const workbook = new ExcelJS.Workbook();
    
    // 1. Ingredients Sheet
    const ingSheet = workbook.addWorksheet('Ingredients');
    ingSheet.columns = [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Ingredient Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 15 },
      { header: 'Unit', key: 'unit', width: 10 },
      { header: 'Avg Cost (VND)', key: 'cost', width: 20 },
      { header: 'Total Value (VND)', key: 'total', width: 20 },
    ];
    styleHeaderRow(ingSheet.getRow(1));
    [...inventoryStore.items].sort((a, b) => a.sku.localeCompare(b.sku)).forEach(item => {
      ingSheet.addRow({
        sku: item.sku, name: item.name, category: item.category, 
        quantity: item.quantity, unit: item.unit, cost: item.cost, total: item.quantity * item.cost
      });
    });

    // 2. Dishes Sheet
    const dishSheet = workbook.addWorksheet('Dishes');
    dishSheet.columns = [
      { header: 'Dish Code', key: 'dish_code', width: 15 },
      { header: 'Dish Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Selling Price (VND)', key: 'selling_price', width: 20 },
      { header: 'Prep Time (min)', key: 'prep_time', width: 15 },
      { header: 'Servings', key: 'servings', width: 10 },
    ];
    styleHeaderRow(dishSheet.getRow(1));
    [...dishesStore.items].sort((a, b) => a.dish_code.localeCompare(b.dish_code)).forEach(item => {
      dishSheet.addRow({
        dish_code: item.dish_code, name: item.name, category: item.category,
        selling_price: item.selling_price, prep_time: item.prep_time, servings: item.servings
      });
    });

    // 3. Suppliers Sheet
    const supSheet = workbook.addWorksheet('Suppliers');
    supSheet.columns = [
      { header: 'Supplier Code', key: 'supplier_code', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Contact', key: 'contact_name', width: 25 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
    ];
    styleHeaderRow(supSheet.getRow(1));
    [...suppliersStore.items].sort((a, b) => a.supplier_code.localeCompare(b.supplier_code)).forEach(item => {
      supSheet.addRow({
        supplier_code: item.supplier_code, name: item.name, contact_name: item.contact_name,
        phone: item.phone, email: item.email, status: item.status
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    clearInterval(progressInterval);
    progress.value = 100;

    saveAs(blob, `FoodManager_Full_Export_${new Date().toISOString().split('T')[0]}.xlsx`);

    setTimeout(() => {
      visible.value = false;
      toast.removeAllGroups();
    }, 500);

  } catch (error) {
    console.error('Export Excel Error:', error);
    clearInterval(progressInterval);
    visible.value = false;
    toast.removeAllGroups();
  }
};

const styleHeaderRow = (row: ExcelJS.Row) => {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A2E16' } };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
};
</script>
