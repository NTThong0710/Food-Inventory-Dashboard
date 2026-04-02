import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/shared/lib/axios';

export interface DishIngredient {
  ingredient_sku: string;
  quantity_needed: number;
}

export interface Dish {
  dish_code: string;
  name: string;
  description: string;
  image_url: string;
  selling_price: number;
  category: string; 
  category_code?: string; 
  ingredients: DishIngredient[];
  prep_time: number;
  servings: number;
  labor_cost: number;
  overhead_percent: number;
  target_margin?: number;
}

export const useDishesStore = defineStore('dishes', () => {
  const items = ref<Dish[]>([]);
  const categories = ref<any[]>([]);
  const isLoading = ref(false);

  // Sửa lại hàm fetchDishes siêu tối ưu (chỉ dùng nếu xài Supabase/PostgREST)
async function fetchDishes() {
  isLoading.value = true;
  try {
    if (categories.value.length === 0) {
      const { data: catData } = await api.get('/categories?type=eq.food');
      if (catData && Array.isArray(catData)) {
        categories.value = catData;
      }
    }

    // Lấy món ăn + join luôn bảng category và bảng dish_ingredients từ DB
    const { data: dishesData } = await api.get('/dishes?select=*,category:categories(name),ingredients:dish_ingredients(ingredient_sku,quantity_needed)&order=created_at.desc');

    if (dishesData && Array.isArray(dishesData)) {
      items.value = dishesData.map((dbDish: any) => ({
        ...dbDish,
        category: dbDish.category ? dbDish.category.name : 'Unknown',
        ingredients: dbDish.ingredients || []
      }));
    }
  } catch (error) {
    console.error('Error fetching dishes:', error);
  } finally {
    isLoading.value = false;
  }
}

  const totalDishes = computed(() => items.value.length);
  
  async function addDish(dish: Dish) {
    try {
      // 1. Insert Dish
      const { data } = await api.post('/dishes', {
        dish_code: dish.dish_code,
        name: dish.name,
        description: dish.description,
        image_url: dish.image_url,
        selling_price: dish.selling_price,
        category_code: dish.category_code || null,
        prep_time: dish.prep_time,
        servings: dish.servings,
        labor_cost: dish.labor_cost,
        overhead_percent: dish.overhead_percent,
        target_margin: dish.target_margin
      });
        
      if (data && Array.isArray(data) && data.length > 0) {
        const newDish = data[0];

        // 2. Insert mapped ingredients
        if (dish.ingredients.length > 0) {
          const ingredientsToInsert = dish.ingredients.map(ing => ({
            dish_code: newDish.dish_code,
            ingredient_sku: ing.ingredient_sku,
            quantity_needed: ing.quantity_needed
          }));

          await api.post('/dish_ingredients', ingredientsToInsert);
        }

        // Add to local state
        dish.dish_code = newDish.dish_code;
        items.value.unshift(dish);
      }

    } catch (error) {
      console.error('Error adding dish:', error);
    }
  }

  async function updateDish(dish: Dish) {
    try {
      // 1. Update Dish basics
      await api.patch(`/dishes?dish_code=eq.${dish.dish_code}`, {
        name: dish.name,
        description: dish.description,
        image_url: dish.image_url,
        selling_price: dish.selling_price,
        category_code: dish.category_code || null,
        prep_time: dish.prep_time,
        servings: dish.servings,
        labor_cost: dish.labor_cost,
        overhead_percent: dish.overhead_percent,
        target_margin: dish.target_margin
      });

      // 2. Update Ingredients (Delete all old mappings and re-insert)
      await api.delete(`/dish_ingredients?dish_code=eq.${dish.dish_code}`);
        
      if (dish.ingredients.length > 0) {
        const ingredientsToInsert = dish.ingredients.map(ing => ({
          dish_code: dish.dish_code,
          ingredient_sku: ing.ingredient_sku,
          quantity_needed: ing.quantity_needed
        }));

        await api.post('/dish_ingredients', ingredientsToInsert);
      }

      // Update local state
      const index = items.value.findIndex(item => item.dish_code === dish.dish_code);
      if (index !== -1) {
        items.value[index] = dish;
      }

    } catch (error) {
      console.error('Error updating dish', error);
    }
  }

  async function deleteDish(dish_code: string) {
    try {
      await api.delete(`/dishes?dish_code=eq.${dish_code}`);

      items.value = items.value.filter(item => item.dish_code !== dish_code);
    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  }

  // Prepare dish: deduct ingredients from stock
  async function prepareDish(dishCode: string, servings: number = 1): Promise<{ success: boolean; message: string; details?: string[] }> {
    const dish = items.value.find(d => d.dish_code === dishCode);
    if (!dish) return { success: false, message: 'Không tìm thấy món ăn' };
    if (!dish.ingredients || dish.ingredients.length === 0) {
      return { success: false, message: 'Món ăn chưa có công thức (nguyên liệu)' };
    }

    try {
      // 1. Fetch current stock for all ingredients in recipe
      const skus = dish.ingredients.map(i => i.ingredient_sku);
      const skuFilter = skus.map(s => `"${s}"`).join(',');
      const { data: ingredientRows } = await api.get(`/ingredients?sku=in.(${skuFilter})&select=sku,name,stock_quantity,unit`);

      if (!ingredientRows || !Array.isArray(ingredientRows)) {
        return { success: false, message: 'Không thể kiểm tra tồn kho' };
      }

      // 2. Check sufficient stock for ALL ingredients before any deduction
      const insufficientItems: string[] = [];
      const deductions: { sku: string; name: string; needed: number; current: number; unit: string }[] = [];

      for (const recipeIng of dish.ingredients) {
        const dbRow = ingredientRows.find((r: any) => r.sku === recipeIng.ingredient_sku);
        const needed = recipeIng.quantity_needed * servings;
        const current = dbRow ? Number(dbRow.stock_quantity) : 0;
        const name = dbRow ? dbRow.name : recipeIng.ingredient_sku;
        const unit = dbRow ? dbRow.unit : '';

        if (current < needed) {
          insufficientItems.push(`${name}: cần ${needed} ${unit}, tồn kho ${current} ${unit}`);
        }
        deductions.push({ sku: recipeIng.ingredient_sku, name, needed, current, unit });
      }

      if (insufficientItems.length > 0) {
        return {
          success: false,
          message: 'Không đủ nguyên liệu để chế biến',
          details: insufficientItems
        };
      }

      // 3. Deduct stock for each ingredient
      for (const d of deductions) {
        const newQty = Math.max(0, d.current - d.needed);
        await api.patch(`/ingredients?sku=eq.${d.sku}`, {
          stock_quantity: newQty
        });
      }

      // Record sale directly via API (avoid calling another store inside an action)
      try {
        // Profit formula: selling_price × (1 - cost_ratio) × servings
        // target_margin stores "% chi phí" (cost %), so profit% = 1 - cost%
        const costRatio = (dish.target_margin ?? 30) / 100;
        const profitPerServing = dish.selling_price * (1 - costRatio);
        const salePayload = {
          dish_code: dish.dish_code,
          dish_name: dish.name,
          quantity: servings,
          revenue: dish.selling_price * servings,
          profit: Math.round(profitPerServing * servings)
        };
        console.log('[Sale] Sending payload:', salePayload);
        const saleResponse = await api.post('/sales', salePayload);
        console.log('[Sale] Response:', saleResponse.data);
      } catch (saleErr: any) {
        console.error('[Sale] ERROR saving sale:', saleErr?.response?.data ?? saleErr);
      }

      const detailLines = deductions.map(d => `${d.name}: -${d.needed} ${d.unit}`);
      return {
        success: true,
        message: `Đã xuất kho cho "${dish.name}" x${servings}`,
        details: detailLines
      };
    } catch (error) {
      console.error('Error preparing dish:', error);
      return { success: false, message: 'Có lỗi xảy ra khi xuất kho' };
    }
  }

  return {
    items,
    categories,
    isLoading,
    totalDishes,
    fetchDishes,
    addDish,
    updateDish,
    deleteDish,
    prepareDish
  };
});
