<template>
  <div class="flex flex-col w-full">

    <!-- Toast -->
    <div class="card flex justify-center">
      <Toast position="top-center" group="headless" @close="visible = false">
        <template #container="{ message, closeCallback }">
          <section class="flex flex-col p-5 gap-4 w-87.5 bg-[#1A241B] border border-[#37EC13]/40 shadow-[0_10px_40px_rgba(55,236,19,0.15)] rounded-2xl relative overflow-hidden">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-[#37EC13]/20 flex items-center justify-center shrink-0">
                <Download class="w-5 h-5 text-[#37EC13]" aria-hidden="true" />
              </div>
              <div class="flex flex-col flex-1">
                <span class="font-bold text-base text-white">{{ message.summary }}</span>
                <span class="text-xs text-gray-400 mt-0.5">{{ progress }}% hoàn tất</span>
              </div>
            </div>
            <div class="w-full h-1.5 bg-[#0F1410] rounded-full overflow-hidden shrink-0 shadow-inner block">
               <div class="h-full bg-linear-to-r from-green-500 to-[#37EC13] transition-all duration-300 ease-out rounded-full shadow-[0_0_10px_rgba(55,236,19,0.8)] will-change-[width]" 
                    :style="{ width: progress + '%' }">
               </div>
            </div>
            <button @click="closeCallback" class="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors p-1" aria-label="Đóng">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </section>
        </template>
      </Toast>
    </div>

    <!-- Page Header -->
    <div class="flex justify-between mb-6 items-center">
      <div>
        <h2 class="text-3xl font-bold text-amber-50">Tổng quan</h2>
        <p class="text-gray-400 text-sm mt-1">{{ today }}</p>
      </div>
      <button 
        @click="downloadAllExcel" 
        class="bg-linear-to-r from-green-500 to-[#37EC13] text-black px-5 py-2.5 rounded-xl font-black hover:scale-105 hover:shadow-[0_0_20px_rgba(55,236,19,0.5)] transition-all duration-300 flex items-center gap-2"
      >
        <Download class="w-5 h-5" aria-hidden="true" />
        Xuất toàn bộ dữ liệu
      </button>
    </div>

    <!-- Row 1: 4 KPI Cards -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

      <!-- Ingredients -->
      <div class="bg-[#1A2E16] p-5 rounded-2xl border border-[#2A362C] flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Nguyên liệu</span>
          <div class="w-8 h-8 rounded-xl bg-[#37EC13]/10 flex items-center justify-center">
            <AlignEndVertical class="w-4 h-4 text-[#37EC13]" aria-hidden="true"/>
          </div>
        </div>
        <div>
          <p class="text-4xl font-black text-amber-50 tabular-nums">{{ inventoryStore.totalItems }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ inventoryStore.totalCategories }} danh mục</p>
        </div>
      </div>

      <!-- Active Dishes -->
      <div class="bg-[#1A2E16] p-5 rounded-2xl border border-[#2A362C] flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Món ăn đang phục vụ</span>
          <div class="w-8 h-8 rounded-xl bg-[#37EC13]/10 flex items-center justify-center">
            <Utensils class="w-4 h-4 text-[#37EC13]" aria-hidden="true"/>
          </div>
        </div>
        <div>
          <p class="text-4xl font-black text-amber-50 tabular-nums">{{ dishesStore.totalDishes }}</p>
          <p class="text-xs text-gray-500 mt-1">trên thực đơn</p>
        </div>
      </div>

      <!-- Inventory Value -->
      <div class="bg-[#1A241B] p-5 rounded-2xl border border-[#2A362C] flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Giá trị tồn kho</span>
          <div class="w-8 h-8 rounded-xl bg-[#37EC13]/10 flex items-center justify-center">
            <DollarSign class="w-4 h-4 text-[#37EC13]" aria-hidden="true"/>
          </div>
        </div>
        <div>
          <p class="text-3xl font-black text-amber-50 tabular-nums leading-tight">{{ currencyStore.formatShort(inventoryStore.grandTotalValue) }}</p>
          <p class="text-xs text-gray-500 mt-1">tổng giá trị tồn kho</p>
        </div>
      </div>

      <!-- Avg Dish Cost -->
      <div class="bg-[#1A241B] p-5 rounded-2xl border border-[#2A362C] flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Chi phí món ăn TB</span>
          <div class="w-8 h-8 rounded-xl bg-[#37EC13]/10 flex items-center justify-center">
            <Receipt class="w-4 h-4 text-[#37EC13]" aria-hidden="true"/>
          </div>
        </div>
        <div>
          <p class="text-3xl font-black text-amber-50 tabular-nums leading-tight">{{ avgDishCostFormatted }}</p>
          <p class="text-xs text-gray-500 mt-1">trung bình mỗi món</p>
        </div>
      </div>

    </section>

    <!-- Row 2: Website Visits (Combo Chart) + Revenue (Bar Chart) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Left side spans 1 column -->
      <div class="lg:col-span-1">
        <WebsiteVisitsChart class="w-full h-full"/>
      </div>

      <!-- Right side spans 1 column -->
      <div class="lg:col-span-1">
        <RevenueChart />
      </div>

    </div>

    <!-- Row 3: Recent Dishes Table -->
    <div class="bg-[#1A2E16] border border-[#2A362C] rounded-2xl overflow-hidden">
      <div class="px-6 py-5 border-b border-[#2A362C] flex justify-between items-center">
        <div>
          <h3 class="font-bold text-white text-base">Món ăn gần đây</h3>
          <p class="text-gray-500 text-xs mt-0.5">Các món mới nhất trên thực đơn</p>
        </div>
        <router-link to="/dishes" class="text-xs text-[#37EC13] hover:underline font-medium">Xem tất cả</router-link>
      </div>

      <!-- Empty state -->
      <div v-if="dishesStore.items.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500 text-sm">
        <Utensils class="w-8 h-8 mb-2 opacity-30" aria-hidden="true"/>
        <p>Chưa có món ăn nào</p>
      </div>

      <!-- Table -->
      <template v-else>
        <!-- Header -->
        <div class="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-3 bg-[#132210] text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          <div>Tên món ăn</div>
          <div>Danh mục</div>
          <div class="text-right">Giá bán</div>
          <div class="text-right">Chi phí TB</div>
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
import WebsiteVisitsChart from '@/shared/components/ui/chart/WebsiteVisitsChart.vue';
import RevenueChart from '@/shared/components/ui/chart/RevenueChart.vue';
import { useInventoryStore } from '@/features/inventory/store';
import { useDishesStore } from '@/features/dishes/store';
import { useSuppliersStore } from '@/features/suppliers/store';
import { useCurrencyStore } from '@/shared/stores/currency';
import { useToast } from "primevue/usetoast";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const inventoryStore = useInventoryStore();
const dishesStore = useDishesStore();
const suppliersStore = useSuppliersStore();
const currencyStore = useCurrencyStore();
const toast = useToast();

const visible = ref(false);
const progress = ref(0);

const today = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

// Avg Dish Cost across all dishes
const avgDishCostFormatted = computed(() => {
  const items = dishesStore.items;
  if (items.length === 0) return '—';
  const total = items.reduce((sum, d) => sum + (d.selling_price || 0), 0);
  const avg = total / items.length;
  return currencyStore.formatShort(avg);
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
    toast.add({ severity: 'custom', summary: 'Đang xuất toàn bộ dữ liệu...', group: 'headless', styleClass: 'backdrop-blur-lg rounded-2xl' });
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
    const ingSheet = workbook.addWorksheet('Nguyên liệu');
    ingSheet.columns = [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Tên nguyên liệu', key: 'name', width: 30 },
      { header: 'Danh mục', key: 'category', width: 20 },
      { header: 'Số lượng', key: 'quantity', width: 15 },
      { header: 'Đơn vị', key: 'unit', width: 10 },
      { header: 'Chi phí TB (VND)', key: 'cost', width: 20 },
      { header: 'Tổng giá trị (VND)', key: 'total', width: 20 },
    ];
    styleHeaderRow(ingSheet.getRow(1));
    [...inventoryStore.items].sort((a, b) => a.sku.localeCompare(b.sku)).forEach(item => {
      ingSheet.addRow({
        sku: item.sku, name: item.name, category: item.category, 
        quantity: item.quantity, unit: item.unit, cost: item.cost, total: item.quantity * item.cost
      });
    });

    // 2. Dishes Sheet
    const dishSheet = workbook.addWorksheet('Món ăn');
    dishSheet.columns = [
      { header: 'Mã món ăn', key: 'dish_code', width: 15 },
      { header: 'Tên món ăn', key: 'name', width: 30 },
      { header: 'Danh mục', key: 'category', width: 20 },
      { header: 'Giá bán (VND)', key: 'selling_price', width: 20 },
      { header: 'Thời gian chuẩn bị (phút)', key: 'prep_time', width: 15 },
      { header: 'Khẩu phần', key: 'servings', width: 10 },
    ];
    styleHeaderRow(dishSheet.getRow(1));
    [...dishesStore.items].sort((a, b) => a.dish_code.localeCompare(b.dish_code)).forEach(item => {
      dishSheet.addRow({
        dish_code: item.dish_code, name: item.name, category: item.category,
        selling_price: item.selling_price, prep_time: item.prep_time, servings: item.servings
      });
    });

    // 3. Suppliers Sheet
    const supSheet = workbook.addWorksheet('Nhà cung cấp');
    supSheet.columns = [
      { header: 'Mã nhà cung cấp', key: 'supplier_code', width: 15 },
      { header: 'Tên', key: 'name', width: 30 },
      { header: 'Liên hệ', key: 'contact_name', width: 25 },
      { header: 'Số điện thoại', key: 'phone', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Trạng thái', key: 'status', width: 15 },
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
