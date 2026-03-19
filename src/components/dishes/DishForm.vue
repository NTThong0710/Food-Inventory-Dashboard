<template>
  <div class="w-full text-white pb-10">

    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium flex items-center gap-2">
      <AlertCircle class="w-5 h-5"/> {{ errorMessage }}
    </div>

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] xl:grid-cols-[1fr_2.5fr] gap-6">

      <!-- Cột trái: Dish Details -->
      <div class="bg-[#131A14] border border-[#2A362C] p-6 shadow-md flex flex-col h-fit">
        <h3 class="font-bold text-white text-lg mb-4">Dish Details</h3>
        
        <div class="space-y-4">
          <!-- Dish Code -->
          <div>
            <label class="block text-sm font-bold text-gray-300 mb-1.5">Dish Code</label>
            <input v-model="formData.dish_code" :disabled="isEditing" required placeholder="e.g., DISH_001" class="w-full bg-[#1B241D] border border-transparent rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-[#37EC13] transition-colors outline-none disabled:opacity-50" />
          </div>

          <!-- Dish Name -->
          <div>
            <label class="block text-sm font-bold text-gray-300 mb-1.5">Dish Name</label>
            <input v-model="formData.name" placeholder="e.g., Spicy Tuna Roll" class="w-full bg-[#1B241D] border border-transparent rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-[#37EC13] transition-colors outline-none" />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-bold text-gray-300 mb-1.5">Category</label>
            <div class="relative">
              <select v-model="formData.category_code" class="w-full bg-[#1B241D] border border-transparent rounded-lg pl-4 pr-10 py-2.5 text-white focus:ring-1 focus:ring-[#37EC13] transition-colors outline-none appearance-none cursor-pointer">
                <option value="" disabled>Select category</option>
                <option v-for="cat in dishesStore.categories" :key="cat.category_code" :value="cat.category_code">{{ cat.name }}</option>
              </select>
              <ChevronDown class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <!-- Prep Time và Servings -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-300 mb-1.5">Prep Time (min)</label>
              <input v-model.number="formData.prep_time" type="number" inputmode="numeric" min="0" class="w-full bg-[#1B241D] rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-[#37EC13] outline-none border border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-300 mb-1.5">Servings (optional)</label>
              <input v-model.number="formData.servings" type="number" inputmode="numeric" min="1" class="w-full bg-[#1B241D] rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-[#37EC13] outline-none border border-transparent" />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-bold text-gray-300 mb-1.5">Description / Preparation</label>
            <textarea v-model="formData.description" rows="4" class="w-full bg-[#1B241D] rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-[#37EC13] outline-none border border-transparent resize-y" placeholder="Describe the dish and how it is prepared..."></textarea>
          </div>

          <!-- Image Upload -->
          <!-- <div>
            <label class="block text-sm font-bold text-gray-300 mb-1.5">Dish Image</label>
            <div
              class="border-2 border-dashed border-[#2A362C] bg-[#0F1410] rounded-xl h-28 flex flex-col items-center justify-center text-gray-500 hover:text-gray-300 hover:border-gray-500 hover:bg-[#1B241D] cursor-pointer transition-colors group"
              role="button"
              tabindex="0"
              aria-label="Upload dish image"
              @keydown.enter.prevent="() => {}"
            >
              <ImagePlus class="w-6 h-6 mb-1 text-gray-400 group-hover:text-white transition-colors" aria-hidden="true" />
              <span class="text-xs font-medium">Click to upload image</span>
            </div>
          </div> -->
        </div>
      </div>

      <!-- Cột phải: Builder Data -->
      <div class="flex flex-col gap-6">
        
        <!-- Ingredients & Costing List -->
        <div class="bg-[#131A14] border border-[#2A362C] rounded-xl p-6 shadow-md">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-white text-lg">Ingredients & Costing</h3>
            <button @click="addIngredientRow" class="text-sm font-bold text-[#37EC13] hover:text-[#45F522] flex items-center gap-1 transition-colors">
              <Plus class="w-4 h-4"/> Add Ingredient
            </button>
          </div>

          <!-- Ingredient Table Header -->
          <div class="grid grid-cols-[minmax(120px,2fr)_minmax(60px,1fr)_1fr_1fr_40px] gap-3 text-[10px] font-bold text-gray-500 py-2 border-b border-[#2A362C] uppercase tracking-wider items-center">
            <div class="pl-2">Ingredient</div>
            <div>Quantity</div>
            <div>Unit</div>
            <div>Cost</div>
            <div></div> <!-- Delete col -->
          </div>

          <!-- Rows -->
          <div class="flex flex-col gap-2 mt-3">
            <div v-if="formData.ingredients.length === 0" class="text-center py-6 text-gray-500 text-sm">
              No ingredients added. Build your recipe!
            </div>
            
            <div v-for="(ing, idx) in formData.ingredients" :key="idx" class="grid grid-cols-[minmax(120px,2fr)_minmax(60px,1fr)_1fr_1fr_40px] gap-3 items-center group">
              
              <!-- Ingredient Select -->
              <div class="relative">
                <select v-model="ing.ingredient_sku" class="w-full bg-[#1B241D] border border-transparent rounded-lg pl-3 md:pl-8 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#37EC13] outline-none appearance-none cursor-pointer">
                  <option value="" disabled>Select...</option>
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
            <input v-model.number="ing.quantity_needed" type="number" inputmode="decimal" step="any" min="0" class="w-full bg-[#1B241D] border border-transparent rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#37EC13] text-center outline-none">

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
            <input v-model="ingredientSearchQuery" @focus="showIngredientSearch = true" @blur="closeIngredientSearch" type="text" placeholder="Search ingredient to add..." class="bg-transparent text-sm text-white font-medium placeholder:text-gray-500 outline-none w-full flex-1">
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
                  No matching ingredients found.
               </div>
            </div>
          </transition>
        </div>
        
      </div>

        <!-- TWO-PANEL ROW: Cost Breakdown & Pricing Strategy -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          <!-- Cost Breakdown Panel -->
          <div class="bg-[#131A14] border border-[#2A362C] rounded-xl p-6 flex flex-col justify-between shadow-md">
            <h3 class="font-bold text-white text-lg mb-5">Cost Breakdown</h3>
            <div class="space-y-4 text-sm font-medium flex-1">
              <div class="flex justify-between text-gray-400 items-center">
                <span>Ingredient Cost</span>
                <span class="text-white">{{ formatCurrency(ingredientCost) }}</span>
              </div>
              
              <div class="flex justify-between items-center group">
                <span class="text-gray-400">Overhead (%)</span>
                <div class="flex items-center gap-1">
                  <input v-model.number="formData.overhead_percent" type="number" inputmode="numeric" min="0" class="w-14 bg-[#1B241D] border border-transparent rounded-md px-2 py-1 text-white text-right focus:ring-1 focus:ring-[#37EC13] outline-none">
                  <span class="text-gray-500 w-16 text-right">{{ formatCurrency(overheadCost) }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center group">
                <span class="text-gray-400">Labor Estimate</span>
                <div class="flex items-center gap-1">
                  <span class="text-gray-500">₫</span>
                  <input v-model.number="formData.labor_cost" type="number" inputmode="decimal" step="any" min="0" class="w-16 bg-[#1B241D] border border-transparent rounded-md px-2 py-1 text-white text-right focus:ring-1 focus:ring-[#37EC13] outline-none">
                </div>
              </div>
            </div>

            <div class="mt-5 pt-4 border-t border-[#2A362C] flex justify-between items-center">
              <span class="font-bold text-white text-base">Total Cost</span>
              <span class="font-bold text-[#37EC13] text-2xl tracking-tight">{{ formatCurrency(totalCost) }}</span>
            </div>
          </div>

          <!-- Pricing Strategy Panel -->
          <div class="bg-black border border-[#2A362C] rounded-xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
            <!-- Decorative Glow -->
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-[#37EC13] opacity-10 blur-[50px] pointer-events-none"></div>

            <h3 class="font-bold text-white text-lg mb-4 relative z-10">Pricing Strategy</h3>
            
            <div class="grid grid-cols-2 gap-4 mb-2 relative z-10">
              <!-- Target Food Cost -->
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Target Food Cost %</label>
                <div class="flex items-center bg-[#1B241D] rounded-lg pr-3 border border-transparent focus-within:border-[#2A362C] transition-colors">
                  <input v-model.number="formData.target_margin" @input="calculatePriceFromTarget" type="number" min="1" max="100" class="w-full bg-transparent rounded-lg px-4 py-3 text-white font-bold text-lg outline-none">
                  <span class="text-gray-400 font-bold">%</span>
                </div>
              </div>

              <!-- Selling Price -->
              <div>
                <label class="block text-[10px] font-bold text-[#37EC13] uppercase tracking-wider mb-2">Selling Price</label>
                <div class="flex items-center bg-transparent border-2 border-[#37EC13] rounded-lg shadow-[0_0_15px_rgba(55,236,19,0.15)] px-3 py-2.5">
                  <span class="text-[#37EC13] font-bold opacity-80">₫</span>
                  <input v-model.number="formData.selling_price" type="number" inputmode="decimal" step="any" min="0" class="w-full bg-transparent text-white font-bold text-xl text-right outline-none">
                </div>
              </div>
            </div>

            <!-- Profit Stats -->
            <div class="mt-auto grid grid-cols-2 divide-x divide-[#2A362C] pt-4 relative z-10">
              <div class="flex flex-col pr-4">
                <span class="text-[10px] text-gray-400 mb-1">Profit per serving</span>
                <span :class="['font-bold text-lg', profitPerServing >= 0 ? 'text-[#37EC13]' : 'text-red-400']">
                  {{ profitPerServing > 0 ? '+' : '' }}{{ formatCurrency(profitPerServing) }}
                </span>
              </div>
              <div class="flex flex-col text-right pl-4">
                <span class="text-[10px] text-gray-400 mb-1">Margin</span>
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
        Cancel
      </button>
      <button @click="handleSubmit" type="button" class="px-6 py-3 rounded-lg font-bold bg-[#37EC13] text-[#131A14] hover:bg-[#45F522] transition-colors shadow-[0_0_15px_rgba(55,236,19,0.3)] focus:ring-2 focus:ring-[#37EC13] outline-none">
        {{ isEditing ? 'Update Dish' : 'Save Dish' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ChevronDown, Plus, Trash2, Search, ImagePlus, Package, AlertCircle } from 'lucide-vue-next';
import { Apple, Drumstick, Milk, Wheat, Settings } from 'lucide-vue-next';
import { useInventoryStore } from '@/stores/inventory';
import { useDishesStore } from '@/stores/dishes';
import type { Dish, DishIngredient } from '@/stores/dishes';

const props = defineProps<{ itemToEdit: Dish | null }>();
const emit = defineEmits(['save', 'cancel-edit']);
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

watch(() => props.itemToEdit, (newVal) => {
  if (newVal) {
    formData.value = JSON.parse(JSON.stringify(newVal));
  } else {
    resetForm();
  }
  errorMessage.value = '';
}, { immediate: true });

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

// Submission
function handleSubmit() {
  errorMessage.value = '';
  
  if (!formData.value.dish_code) {
    errorMessage.value = "Dish code is required.";
    return window.scrollTo(0,0);
  }
  if (!formData.value.name) {
    errorMessage.value = "Dish name is required.";
    return window.scrollTo(0,0);
  }
  if (!formData.value.category_code) {
    errorMessage.value = "Category is required.";
    return window.scrollTo(0,0);
  }

  // Filter out empty rows
  const cleanData = JSON.parse(JSON.stringify(formData.value));
  cleanData.ingredients = cleanData.ingredients.filter((i: any) => i.ingredient_sku && i.quantity_needed > 0);
  
  // Convert strings to nums
  cleanData.selling_price = parseFloat(cleanData.selling_price) || 0;
  cleanData.labor_cost = parseFloat(cleanData.labor_cost) || 0;
  cleanData.prep_time = parseFloat(cleanData.prep_time) || 0;
  cleanData.servings = parseFloat(cleanData.servings) || 1;
  
  emit('save', cleanData);
}
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