<template>
  <div class="w-full text-white pb-5">

    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium flex items-center gap-2">
      <AlertCircle class="w-5 h-5"/> {{ errorMessage }}
    </div>

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] xl:grid-cols-[1fr_2.5fr] gap-6">

      <!-- Cột trái: Dish Details -->
      <div class="bg-[#131A14] border border-[#2A362C] p-6 shadow-md flex flex-col h-fit">
        <h3 class="font-bold text-white text-lg mb-4">Chi tiết món ăn</h3>
        
        <div class="space-y-4">
          <!-- Dish Code -->
          <BaseInput id="d-code" label="Mã món ăn" v-model="formData.dish_code" :disabled="isEditing" required placeholder="VD: MON_001" />

          <!-- Dish Name -->
          <BaseInput id="d-name" label="Tên món ăn" v-model="formData.name" placeholder="VD: Bò bít tết" />

          <!-- Category -->
          <BaseSelect id="d-cat" label="Danh mục" v-model="formData.category_code" placeholder="Chọn danh mục">
            <template #icon>
              <ChevronDown class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </template>
            <option v-for="cat in dishesStore.categories" :key="cat.category_code" :value="cat.category_code">{{ cat.name }}</option>
          </BaseSelect>

          <!-- Prep Time và Servings -->
          <div class="grid gap-4">
            <BaseInput id="d-prep" type="number" inputmode="numeric" min="0" label="Thời gian chuẩn bị (phút)" v-model.number="formData.prep_time" />
            <!-- <BaseInput id="d-serv" type="number" inputmode="numeric" min="1" label="Khẩu phần" v-model.number="formData.servings" /> -->
          </div>

          <!-- Description -->
          <BaseTextarea id="d-desc" label="Mô tả / Cách làm" v-model="formData.description" :rows="4" placeholder="Mô tả món ăn và cách làm..." />

          <!-- Image Upload -->
         <div>
            <label class="block text-sm font-bold text-gray-300 mb-1.5">Hình ảnh món ăn</label>
            
            <input 
              type="file" 
              ref="fileInput" 
              class="hidden" 
              @change="uploadImageToCloudinary" 
              accept="image/*" 
            />
            
            <div
              v-if="!formData.image_url"
              @click="triggerFileInput"
              class="relative border-2 border-dashed border-[#2A362C] bg-[#0F1410] rounded-xl h-32 flex flex-col items-center justify-center text-gray-500 hover:text-gray-300 hover:border-gray-500 hover:bg-[#1B241D] cursor-pointer transition-colors group overflow-hidden"
            >
              <div v-if="isUploading" class="absolute inset-0 bg-[#0F1410]/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                <span class="w-6 h-6 border-2 border-[#37EC13] border-t-transparent rounded-full animate-spin mb-2"></span>
                <span class="text-xs text-[#37EC13] font-medium">Đang tải lên...</span>
              </div>

              <ImagePlus class="w-8 h-8 mb-2 text-gray-400 group-hover:text-[#37EC13] transition-colors" />
              <span class="text-sm font-medium">Click để tải ảnh lên</span>
            </div>

            <div v-else class="relative group h-40 w-full rounded-xl overflow-hidden border border-[#2A362C]">
              <img :src="formData.image_url" class="w-full h-full object-cover" alt="Dish preview" />
              
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button @click.prevent="triggerFileInput" type="button" class="px-3 py-1.5 bg-[#1B241D] hover:bg-[#2A362C] border border-[#37EC13] text-[#37EC13] rounded-lg text-sm font-medium transition-colors">
                  Đổi ảnh
                </button>
                <button @click.prevent="formData.image_url = ''" type="button" class="p-1.5 bg-red-900/50 hover:bg-red-500/80 text-white rounded-lg transition-colors" title="Xóa ảnh">
                  <Trash2 class="w-4 h-4"/>
                </button>
              </div>

              <div v-if="isUploading" class="absolute inset-0 bg-[#0F1410]/80 flex items-center justify-center z-10">
                <span class="w-6 h-6 border-2 border-[#37EC13] border-t-transparent rounded-full animate-spin"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột phải: Builder Data -->
      <div class="flex flex-col gap-6">
        
        <!-- Ingredients & Costing List -->
        <div class="bg-[#131A14] border border-[#2A362C] p-8 shadow-md">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-white text-lg">Nguyên liệu & Chi phí</h3>
            <button @click="addIngredientRow" class="text-sm font-bold text-[#37EC13] hover:text-[#45F522] flex items-center gap-1 transition-colors">
              <Plus class="w-4 h-4"/> Thêm nguyên liệu
            </button>
          </div>

          <!-- Ingredient Table Header -->
          <div class="grid grid-cols-[minmax(120px,2fr)_minmax(60px,1fr)_1fr_1fr_40px] gap-3 text-[10px] font-bold text-gray-500 py-2 border-b border-[#2A362C] uppercase tracking-wider items-center">
            <div class="pl-2">Nguyên liệu</div>
            <div>Số lượng</div>
            <div>Đơn vị</div>
            <div>Giá</div>
            <div></div> <!-- Delete col -->
          </div>

          <!-- Rows -->
          <div class="flex flex-col gap-2 mt-3">
            <div v-if="formData.ingredients.length === 0" class="text-center py-6 text-gray-500 text-sm">
              Chưa có nguyên liệu nào.
            </div>
            
            <div v-for="(ing, idx) in formData.ingredients" :key="idx" class="grid grid-cols-[minmax(120px,2fr)_minmax(60px,1fr)_1fr_1fr_40px] gap-3 items-center group">
              
              <!-- Ingredient Select -->
              <div class="relative">
                <select v-model="ing.ingredient_sku" class="w-full bg-[#1B241D] border border-transparent rounded-lg pl-3 md:pl-8 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#37EC13] outline-none appearance-none cursor-pointer">
                  <option value="" disabled>Chọn...</option>
                  <option v-for="inv in inventoryStore.items" :key="inv.sku" :value="inv.sku">{{ inv.name }}</option>
                </select>
              <!-- Dynamic image icon -->
              <div class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded bg-[#0F1410] hidden md:flex items-center justify-center">
                 <component 
                    v-if="ing.ingredient_sku"
                    :is="getIngredientIconMap(getInvItem(ing.ingredient_sku)?.category || '')" 
                    class="w-3 h-3" 
                    :class="getIngredientColorMap(getInvItem(ing.ingredient_sku)?.category || '')" 
                 />
                 <Package v-else class="w-3 h-3 text-gray-500" />
              </div>
            </div>

            <!-- Quantity input -->
            <input v-model.number="ing.quantity_needed" type="number" inputmode="decimal" step="any"
            @keydown="preventInvalidKey($event, ing.ingredient_sku)"
            @input="ing.quantity_needed = Math.max(0, ing.quantity_needed || 0)" 
            class="w-full bg-[#1B241D] border border-transparent rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#37EC13] text-center outline-none">

            <!-- Unit Display -->
            <div class="text-sm text-gray-400 capitalize truncate">{{ getInvUnit(ing.ingredient_sku) || '--' }}</div>

            <!-- Cost Display -->
            <div class="text-sm text-white font-medium truncate">{{ formatCurrency(getIngCost(ing)) }}</div>

            <!-- Delete Action -->
            <button @click="removeIngredientRow(idx)" class="p-2 bg-[#1B241D] text-gray-500 hover:text-red-400 rounded-lg flex items-center justify-center border border-transparent hover:border-[#2A362C] transition-colors focus:outline-none">
              <Trash2 class="w-4 h-4"/>
            </button>
          </div>
        </div>

        <!-- Search Ingredient Input -->
        <div class="mt-4 pt-4 border-t border-[#2A362C] relative">
          <div class="flex items-center gap-3 bg-[#1B241D] rounded-lg px-3 py-2 border border-transparent focus-within:border-[#37EC13] transition-colors">
            <Search class="w-4 h-4 text-[#37EC13]" />
            <input v-model="ingredientSearchQuery" @focus="showIngredientSearch = true" @blur="closeIngredientSearch" type="text" placeholder="Tìm kiếm nguyên liệu để thêm..." class="bg-transparent text-sm text-white font-medium placeholder:text-gray-500 outline-none w-full flex-1">
          </div>
          
          <transition name="fade">
            <div v-if="showIngredientSearch && ingredientSearchQuery" class="absolute left-0 top-full mt-2 w-full bg-[#1B241D] border border-[#2A362C] rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
               <button v-for="inv in filteredSearchIngredients" :key="inv.sku" @mousedown.prevent="addIngredientFromSearch(inv.sku)" class="w-full text-left px-4 py-2 hover:bg-[#2A362C] transition-colors flex items-center gap-3">
                   <div class="w-6 h-6 rounded bg-[#0F1410] flex items-center justify-center shadow-inner">
                      <component :is="getIngredientIconMap(inv.category)" class="w-4 h-4" :class="getIngredientColorMap(inv.category)" />
                   </div>
                   <span class="text-sm text-gray-200">{{ inv.name }}</span>
                   <span class="text-xs text-gray-500 ml-auto">{{ formatCurrency(inv.cost) }} / {{ inv.unit }}</span>
               </button>
               <div v-if="filteredSearchIngredients.length === 0" class="px-4 py-3 text-sm text-gray-500 text-center">
                  Không tìm thấy nguyên liệu phù hợp.
               </div>
            </div>
          </transition>
        </div>
        
      </div>

        <!-- TWO-PANEL ROW: Cost Breakdown & Pricing Strategy -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mt-2">
          
          <!-- Cost Breakdown Panel -->
          <div class="bg-[#131A14] border border-[#2A362C] p-6 flex flex-col justify-between shadow-md">
            <h3 class="font-bold text-white text-lg mb-5">Phân tích chi phí</h3>
            <div class="space-y-4 text-sm font-medium flex-1">
              <div class="flex justify-between text-gray-400 items-center">
                <span>Chi phí nguyên liệu</span>
                <span class="text-white">{{ formatCurrency(ingredientCost) }}</span>
              </div>
              
              <div class="flex justify-between items-center group">
                <span class="text-gray-400">Hao hụt (%)</span>
                <div class="flex items-center gap-1">
                  <input v-model.number="formData.overhead_percent" type="number" inputmode="numeric" min="0" @keydown="preventNegative" class="w-14 bg-[#1B241D] border border-transparent rounded-md px-2 py-1 text-white text-right focus:ring-1 focus:ring-[#37EC13] outline-none">
                  <span class="text-gray-500 w-16 text-right">{{ formatCurrency(overheadCost) }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center group">
                <span class="text-gray-400">Ước tính nhân công</span>
                <div class="flex items-center gap-1">
                  <input v-model="displayLaborCost" type="text" inputmode="numeric" class="w-20 bg-[#1B241D] border border-transparent rounded-md px-2 py-1 text-white text-right focus:ring-1 focus:ring-[#37EC13] outline-none">
                  <span class="text-gray-500">₫</span>
                </div>
              </div>
            </div>

            <div class="mt-5 pt-4 border-t border-[#2A362C] flex justify-between items-center">
              <span class="font-bold text-white text-base">Tổng chi phí</span>
              <span class="font-bold text-[#37EC13] text-2xl tracking-tight">{{ formatCurrency(totalCost) }}</span>
            </div>
          </div>

          <!-- Pricing Strategy Panel -->
          <div class="bg-black border border-[#2A362C] p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
            <!-- Decorative Glow -->
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-[#37EC13] opacity-10 blur-[50px] pointer-events-none"></div>

            <h3 class="font-bold text-white text-lg mb-4 relative z-10">Chiến lược giá</h3>
            
            <div class="grid grid-cols-2 gap-4 mb-2 relative z-10">
              <!-- Target Food Cost -->
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">% Chi phí</label>
                <div class="flex items-center bg-[#1B241D] rounded-lg pr-3 border border-transparent focus-within:border-[#2A362C] transition-colors">
                  <input v-model.number="formData.target_margin" @input="calculatePriceFromTarget" type="number" min="1" max="100" @keydown="preventNegative" class="w-full bg-transparent rounded-lg px-4 py-3 text-white font-bold text-lg outline-none">
                  <span class="text-gray-400 font-bold">%</span>
                </div>
              </div>

              <!-- Selling Price -->
              <div>
                <label class="block text-[10px] font-bold text-[#37EC13] uppercase tracking-wider mb-2">Giá bán</label>
                <div class="flex items-center bg-transparent border-2 border-[#37EC13] rounded-lg shadow-[0_0_15px_rgba(55,236,19,0.15)] px-3 py-2.5">
                  <span class="text-[#37EC13] font-bold opacity-80">₫</span>
                  <input v-model="displaySellingPrice" type="text" inputmode="numeric" class="w-full bg-transparent text-white font-bold text-xl text-right outline-none">
                </div>
              </div>
            </div>

            <!-- Profit Stats -->
            <div class="mt-auto grid grid-cols-2 divide-x divide-[#2A362C] pt-4 relative z-10">
              <div class="flex flex-col pr-4">
                <span class="text-[10px] text-gray-400 mb-1">Lợi nhuận mỗi phần</span>
                <span :class="['font-bold text-lg', profitPerServing >= 0 ? 'text-[#37EC13]' : 'text-red-400']">
                  {{ profitPerServing > 0 ? '+' : '' }}{{ formatCurrency(profitPerServing) }}
                </span>
              </div>
              <div class="flex flex-col text-right pl-4">
                <span class="text-[10px] text-gray-400 mb-1">Biên lợi nhuận</span>
                <span class="font-bold text-white text-lg">{{ profitMarginPercent }}%</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="mt-8 pt-6 border-t border-[#2A362C] flex justify-end gap-4">
      <button @click="$emit('cancel-edit')" type="button" class="px-6 py-3 rounded-lg font-bold text-white bg-[#1B241D] border border-[#2A362C] hover:bg-[#2A362C] transition-colors focus:ring-2 focus:ring-gray-500 outline-none">
        Hủy
      </button>
      <button @click="handleSubmit" type="button" :disabled="isSubmitting" class="px-6 py-3 rounded-lg font-bold transition-colors shadow-[0_0_15px_rgba(55,236,19,0.3)] focus:ring-2 focus:ring-[#37EC13] outline-none flex items-center justify-center gap-2" :class="isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#37EC13] text-[#131A14] hover:bg-[#45F522]'">
        <span v-if="isSubmitting" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        {{ isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật món' : 'Lưu món ăn') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ChevronDown, Plus, Trash2, Search, ImagePlus, Package, AlertCircle } from 'lucide-vue-next';
import BaseInput from '@/shared/components/ui/BaseInput.vue';
import BaseSelect from '@/shared/components/ui/BaseSelect.vue';
import BaseTextarea from '@/shared/components/ui/BaseTextarea.vue';
import { Apple, Drumstick, Milk, Wheat, Settings } from 'lucide-vue-next';
import { useInventoryStore } from '@/features/inventory/store';
import { useDishesStore } from '@/features/dishes/store';
import type { Dish, DishIngredient } from '@/features/dishes/store';

const props = defineProps<{ itemToEdit: Dish | null; isSubmitting?: boolean; }>();
const emit = defineEmits(['save', 'cancel-edit']);
const fileInput = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const inventoryStore = useInventoryStore();
const dishesStore = useDishesStore();

const isEditing = computed(() => !!props.itemToEdit);
const errorMessage = ref('');

const formData = ref<Dish>({
  dish_code: '',
  name: '',
  description: '',
  image_url: '',
  selling_price: 0,
  category: '',
  category_code: undefined,
  ingredients: [],
  prep_time: 0,
  servings: 1,
  labor_cost: 0,
  overhead_percent: 10
});

const displaySellingPrice = computed({
  get() {
    return formData.value.selling_price ? formData.value.selling_price.toLocaleString('vi-VN') : (formData.value.selling_price === 0 ? '0' : '');
  },
  set(val: string) {
    let cleaned = val.replace(/\D/g, '');
    const num = Number(cleaned);
    formData.value.selling_price = isNaN(num) ? 0 : num;
  }
});

const displayLaborCost = computed({
  get() {
    return formData.value.labor_cost ? formData.value.labor_cost.toLocaleString('vi-VN') : (formData.value.labor_cost === 0 ? '0' : '');
  },
  set(val: string) {
    let cleaned = val.replace(/\D/g, '');
    const num = Number(cleaned);
    formData.value.labor_cost = isNaN(num) ? 0 : num;
  }
});

watch(() => props.itemToEdit, (newVal) => {
  if (newVal) {
    formData.value = JSON.parse(JSON.stringify(newVal));
  } else {
    resetForm();
  }
  errorMessage.value = '';
}, { immediate: true });

// Auto-suggest Category based on Dish Name
watch(() => formData.value.name, (newName) => {
  // Only auto-suggest if user hasn't manually selected a category and name exists
  if (!newName || formData.value.category_code || isEditing.value) return;
  
  const nameLower = newName.toLowerCase();
  
  const categoryKeywords = [
    { keywords: ['trà', 'nước', 'sữa', 'cafe', 'cà phê', 'bia', 'sinh tố', 'nước ép', 'rượu', 'coca', 'pepsi', '7up', 'sprite'], searchStr: 'uống' }, // Đồ uống
    { keywords: ['bò', 'gà', 'heo', 'cá', 'tôm', 'mực', 'cơm', 'phở', 'bún', 'lẩu', 'cua', 'nướng', 'hấp', 'mì', 'cháo'], searchStr: 'chính' }, // Món chính
    { columns: ['súp', 'sup', 'salad', 'gỏi', 'nem', 'chả'], searchStr: 'khai vị' }, // Khai vị
    { keywords: ['khoai tây', 'ngô', 'bắp', 'kim chi', 'bánh mì', 'quẩy', 'ăn kèm'], searchStr: 'kèm' }, // Ăn kèm
    { keywords: ['chè', 'bánh', 'kem', 'trái cây', 'tráng miệng', 'flan', 'sữa chua', 'yogurt', 'rau câu'], searchStr: 'tráng miệng' } // Tráng miệng
  ];

  for (const block of categoryKeywords) {
    // Treat 'columns' as 'keywords' if misspelled in definition above
    const words = block.keywords || block.columns || [];
    if (words.some(kw => nameLower.includes(kw))) {
      // Find matching category from store
      const matchedCat = dishesStore.categories.find(cat => 
        cat.name.toLowerCase().includes(block.searchStr) || 
        cat.category_code.toLowerCase().includes(block.searchStr)
      );
      if (matchedCat) {
        formData.value.category_code = matchedCat.category_code;
        break;
      }
    }
  }
});

function resetForm() {
  formData.value = {
    dish_code: '',
    name: '',
    description: '',
    image_url: '',
    selling_price: 0,
    category: '', //này chỉ để hiển thị tên category, còn category_code mới là quan trọng để lưu vào DB và liên kết với category
    category_code: undefined,
    ingredients: [],
    prep_time: 0,
    servings: 1,
    labor_cost: 0,
    overhead_percent: 10,
    target_margin: 30
  };
}

function addIngredientRow() {
  formData.value.ingredients.push({ ingredient_sku: '', quantity_needed: 1 });
}

function removeIngredientRow(index: number) {
  formData.value.ingredients.splice(index, 1);
}

//hàm tiện ích để lấy thông tin item từ inventory dựa trên SKU, giúp tránh lặp code khi cần truy xuất thông tin item trong nhiều chỗ khác nhau
function getInvItem(sku: string) {
  return inventoryStore.items.find(i => i.sku === sku);
}

function getInvUnit(sku: string) {
  const item = getInvItem(sku);
  // Định dạng lại tên đơn vị cho dễ hiểu hơn
  if(!item) return '';
  if(item.unit === 'g') return 'Grams (g)';
  if(item.unit === 'kg') return 'Kilograms (kg)';
  if(item.unit === 'ml') return 'Milliliters (ml)';
  if(item.unit === 'l') return 'Liters (l)';
  if(item.unit === 'p/c') return 'Piece (pc)';
  return item.unit;
}

// Tính toán chi phí nguyên liệu cho mỗi dòng ingredient, được sử dụng trong bảng cost breakdown và tính toán tổng chi phí
function getIngCost(ing: DishIngredient) {
  const item = getInvItem(ing.ingredient_sku);
  if (item) return parseFloat((item.cost * ing.quantity_needed).toFixed(3));
  return 0;
}

// Advanced Cost Calculations
const ingredientCost = computed(() => {
  let total = 0;
  for (const ing of formData.value.ingredients) {
    if (ing.ingredient_sku && ing.quantity_needed) {
      total += getIngCost(ing);
    }
  }
  return total;
});

const overheadCost = computed(() => {
  return (ingredientCost.value * (formData.value.overhead_percent || 0)) / 100;
});

const totalCost = computed(() => {
  return ingredientCost.value + overheadCost.value + (formData.value.labor_cost || 0);
});

// Pricing strategy
const profitPerServing = computed(() => {
  const rawProfit = (formData.value.selling_price || 0) - totalCost.value;
  const srv = formData.value.servings || 1;
  return rawProfit / srv;
});

const profitMarginPercent = computed(() => {
  const sp = formData.value.selling_price || 0;
  if (sp <= 0) return 0;
  const margin = ((sp - totalCost.value) / sp) * 100;
  return Math.round(margin);
});

function calculatePriceFromTarget() {

  const baseCost = ingredientCost.value + overheadCost.value; 
  const target = formData.value.target_margin || 30;
  if (target > 0) {
    const rawPrice = baseCost / (target / 100);
    
    formData.value.selling_price = parseFloat(rawPrice.toFixed(2));
  }
}

// Formatting
function formatCurrency(val: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
}

// Icon formatting
const getIngredientIconMap = (cat: string) => {
  switch(cat) {
    case 'Vegetable': return Apple;
    case 'Meat': return Drumstick;
    case 'Dairy': return Milk;
    case 'Spice': return Wheat;
    case 'Seafood': return Package;
    default: return Settings;
  }
};

const getIngredientColorMap = (cat: string) => {
  switch(cat) {
    case 'Vegetable': return 'text-green-400';
    case 'Meat': return 'text-red-400';
    case 'Dairy': return 'text-blue-400';
    case 'Spice': return 'text-purple-400';
    case 'Seafood': return 'text-cyan-400';
    default: return 'text-gray-400';
  }
};

// Search handling
const ingredientSearchQuery = ref('');
const showIngredientSearch = ref(false);

const closeIngredientSearch = () => {
  setTimeout(() => { showIngredientSearch.value = false; }, 150);
};

const filteredSearchIngredients = computed(() => {
  if (!ingredientSearchQuery.value) return [];
  const query = ingredientSearchQuery.value.toLowerCase();
  return inventoryStore.items.filter(item => 
    item.name.toLowerCase().includes(query) || 
    item.category.toLowerCase().includes(query)
  );
});

function addIngredientFromSearch(ingredientSku: string) {
  const existing = formData.value.ingredients.find(i => i.ingredient_sku === ingredientSku);
  if (!existing) {
    formData.value.ingredients.push({ ingredient_sku: ingredientSku, quantity_needed: 1 });
  } else {
    existing.quantity_needed += 1;
  }
  ingredientSearchQuery.value = '';
  showIngredientSearch.value = false;
}

function preventNegative(e: KeyboardEvent) {
  if (e.key === '-' || e.key === 'e') {
    e.preventDefault();
  }
}

function preventInvalidKey(e: KeyboardEvent, sku: string) {
  if (e.key === '-' || e.key === 'e') {
    e.preventDefault();
    return;
  }
  
  if (e.key === '.' || e.key === ',') {
    const item = getInvItem(sku);
    if (!item) return;
    const selectedUnit = (item.unit || '').toLowerCase();
    const discreteUnits = ['p/c', 'cái', 'hộp', 'khay', 'chai', 'lon', 'cuộn', 'bao', 'gói', 'thùng', 'vỉ'];
    const isDiscrete = discreteUnits.some(u => selectedUnit.includes(u));
    if (isDiscrete) {
      e.preventDefault();
    }
  }
}

// Hàm này sẽ được gọi khi người dùng nhấn nút lưu, nó sẽ kiểm tra tính hợp lệ của dữ liệu, chuẩn hóa dữ liệu trước khi gửi lên component cha để xử lý lưu vào database hoặc cập nhật state
function handleSubmit() {
  errorMessage.value = '';
  
  if (!formData.value.dish_code) {
    errorMessage.value = "Dish code is required.";
    return window.scrollTo(0,0);
  }
  if (!formData.value.name) {
    errorMessage.value = "Bắt buộc nhập tên món ăn.";
    return window.scrollTo(0,0);
  }
  if (!formData.value.category_code) {
    errorMessage.value = "Category is required.";
    return window.scrollTo(0,0);
  }

  // Chỗ này tạo một bản sao sạch của formData để loại bỏ các nguyên liệu không hợp lệ trước khi gửi lên cha component
  const cleanData = JSON.parse(JSON.stringify(formData.value));
  cleanData.ingredients = cleanData.ingredients.filter((i: any) => i.ingredient_sku && i.quantity_needed > 0);
  
  // Chuyển chuỗi sang số và đảm bảo không có giá trị NaN
  cleanData.selling_price = parseFloat(cleanData.selling_price) || 0;
  cleanData.labor_cost = parseFloat(cleanData.labor_cost) || 0;
  cleanData.prep_time = parseFloat(cleanData.prep_time) || 0;
  cleanData.servings = parseFloat(cleanData.servings) || 1;
  
  emit('save', cleanData);
}

// Hàm kích hoạt input file ẩn
const triggerFileInput = () => {
  if (isUploading.value) return;
  fileInput.value?.click();
};

// Hàm xử lý đẩy lên Cloudinary
const uploadImageToCloudinary = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploading.value = true;
  errorMessage.value = '';

  const uploadData = new FormData();
  uploadData.append('file', file);
  uploadData.append('upload_preset', 'dish_upload');

  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/dv6njxx6x/image/upload', {
      method: 'POST',
      body: uploadData
    });

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();
    formData.value.image_url = data.secure_url; // Gán URL lấy được vào form data
    
  } catch (error) {
    console.error('Lỗi upload:', error);
    errorMessage.value = 'Không thể tải ảnh lên Cloudinary. Vui lòng thử lại sau.';
  } finally {
    isUploading.value = false;
    // Reset lại value của input để nếu xóa ảnh rồi chọn lại đúng ảnh đó thì trình duyệt vẫn nhận diện là onchange
    if (fileInput.value) fileInput.value.value = '';
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }

/* Custom Scrollbar cho dropdown */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #132210;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #2A362C;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #37EC13;
}
</style>