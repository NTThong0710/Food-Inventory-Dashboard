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
    const { data: dishesData } = await api.get('/dishes?deleted_at=is.null&select=*,category:categories(name),ingredients:dish_ingredients(ingredient_sku,quantity_needed)&order=created_at.desc');

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
      await api.patch(`/dishes?dish_code=eq.${dish_code}`, {
        deleted_at: new Date().toISOString()
      });

      items.value = items.value.filter(item => item.dish_code !== dish_code);
    } catch (error) {
      console.error('Error deleting dish:', error);
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
    deleteDish
  };
});
