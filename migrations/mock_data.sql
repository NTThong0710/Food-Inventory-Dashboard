-- 1. Insert Suppliers
INSERT INTO public.supplier (name, contact_name, email, phone, address, status) VALUES
('Fresh Veggies Co.', 'Nguyen Van A', 'contact@freshveggies.com', '0901234567', 'Dalat, Lam Dong', 'Active'),
('Ocean Seafood Ltd.', 'Tran Thi B', 'sales@oceanseafood.vn', '0912345678', 'Nha Trang, Khanh Hoa', 'Active'),
('Premium Meats', 'Le Van C', 'info@premiummeats.com', '0987654321', 'District 1, HCMC', 'Active'),
('Daily Dairy', 'Pham Thi D', 'order@dailydairy.vn', '0934567890', 'Cu Chi, HCMC', 'Active'),
('Spices & Herbs', 'Hoang Van E', 'hello@spicesherbs.net', '0978901234', 'Hoi An, Quang Nam', 'Inactive');

-- 2. Insert Categories
INSERT INTO public.categories (name, type, description) VALUES
('Meat', 'ingredient', 'Fresh and frozen meats'),
('Seafood', 'ingredient', 'Fish, shellfish, and other seafood'),
('Dairy', 'ingredient', 'Milk, cheese, butter, and cream'),
('Vegetable', 'ingredient', 'Fresh vegetables and herbs'),
('Spice', 'ingredient', 'Dry spices, condiments, and oils'),
('Main Course', 'food', 'Primary dishes'),
('Appetizer', 'food', 'Starters and small plates');

-- 3. Insert Ingredients 
-- Note: Mapping to category_id, stock_quantity, unit_cost, production_date, expiry_date
INSERT INTO public.ingredients (name, category_id, stock_quantity, unit, unit_cost, production_date, expiry_date) VALUES
-- Meats
('Wagyu Beef A5', (SELECT id FROM public.categories WHERE name = 'Meat' LIMIT 1), 15.5, 'kg', 2500000, '2025-10-15', '2025-11-15'),
('Chicken Breast', (SELECT id FROM public.categories WHERE name = 'Meat' LIMIT 1), 50.0, 'kg', 85000, '2025-10-20', '2025-10-27'),
('Pork Belly', (SELECT id FROM public.categories WHERE name = 'Meat' LIMIT 1), 30.0, 'kg', 120000, '2025-10-18', '2025-10-28'),
-- Seafood
('Norwegian Salmon', (SELECT id FROM public.categories WHERE name = 'Seafood' LIMIT 1), 25.0, 'kg', 450000, '2025-10-19', '2025-10-26'),
('Tiger Prawns', (SELECT id FROM public.categories WHERE name = 'Seafood' LIMIT 1), 18.0, 'kg', 350000, '2025-10-21', '2025-10-25'),
-- Dairy
('Unsalted Butter', (SELECT id FROM public.categories WHERE name = 'Dairy' LIMIT 1), 10.0, 'kg', 180000, '2025-09-01', '2026-03-01'),
('Heavy Cream', (SELECT id FROM public.categories WHERE name = 'Dairy' LIMIT 1), 20.0, 'L', 120000, '2025-09-15', '2025-11-15'),
('Parmesan Cheese', (SELECT id FROM public.categories WHERE name = 'Dairy' LIMIT 1), 5.0, 'kg', 400000, '2025-01-01', '2026-01-01'),
-- Vegetables
('Cherry Tomatoes', (SELECT id FROM public.categories WHERE name = 'Vegetable' LIMIT 1), 12.0, 'kg', 60000, '2025-10-22', '2025-10-29'),
('Fresh Basil', (SELECT id FROM public.categories WHERE name = 'Vegetable' LIMIT 1), 2.0, 'kg', 150000, '2025-10-23', '2025-10-30'),
('Garlic', (SELECT id FROM public.categories WHERE name = 'Spice' LIMIT 1), 15.0, 'kg', 45000, '2025-08-01', '2026-02-01'),
('Onions', (SELECT id FROM public.categories WHERE name = 'Vegetable' LIMIT 1), 40.0, 'kg', 25000, '2025-08-15', '2025-12-15'),
-- Spices/Carbs
('Spaghetti Pasta', (SELECT id FROM public.categories WHERE name = 'Spice' LIMIT 1), 50.0, 'kg', 40000, '2025-01-01', '2027-01-01'),
('Olive Oil', (SELECT id FROM public.categories WHERE name = 'Spice' LIMIT 1), 15.0, 'L', 220000, '2025-05-01', '2027-05-01');

-- 4. Insert Dishes
INSERT INTO public.dishes (name, description, selling_price, prep_time, servings, labor_cost, overhead_percent, target_margin, image_url) VALUES
('Spaghetti Carbonara', 'Classic Italian pasta dish', 250000, 20, 1, 30000, 10.0, 70.0, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80'),
('Grilled Salmon Steak', 'Fresh Norwegian salmon', 450000, 25, 1, 40000, 10.0, 65.0, 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&q=80'),
('Caprese Salad', 'Fresh tomatoes and mozzarella', 150000, 10, 1, 20000, 10.0, 70.0, 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&q=80'),
('Wagyu Ribeye Steak', 'Premium A5 Wagyu beef', 1200000, 30, 1, 100000, 10.0, 55.0, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80'),
('Garlic Butter Prawns', 'Succulent tiger prawns', 220000, 15, 1, 35000, 10.0, 60.0, 'https://images.unsplash.com/photo-1559742811-822873691fc8?auto=format&fit=crop&q=80');

-- 5. Insert Dish Ingredients (Recipes linking Dishes -> Ingredients)

-- Spaghetti Carbonara Recipe
INSERT INTO public.dish_ingredients (dish_id, ingredient_id, quantity_needed) VALUES
((SELECT id FROM public.dishes WHERE name = 'Spaghetti Carbonara'), (SELECT id FROM public.ingredients WHERE name = 'Spaghetti Pasta'), 0.15),
((SELECT id FROM public.dishes WHERE name = 'Spaghetti Carbonara'), (SELECT id FROM public.ingredients WHERE name = 'Pork Belly'), 0.1),
((SELECT id FROM public.dishes WHERE name = 'Spaghetti Carbonara'), (SELECT id FROM public.ingredients WHERE name = 'Parmesan Cheese'), 0.05),
((SELECT id FROM public.dishes WHERE name = 'Spaghetti Carbonara'), (SELECT id FROM public.ingredients WHERE name = 'Heavy Cream'), 0.05);

-- Grilled Salmon Steak Recipe
INSERT INTO public.dish_ingredients (dish_id, ingredient_id, quantity_needed) VALUES
((SELECT id FROM public.dishes WHERE name = 'Grilled Salmon Steak'), (SELECT id FROM public.ingredients WHERE name = 'Norwegian Salmon'), 0.25),
((SELECT id FROM public.dishes WHERE name = 'Grilled Salmon Steak'), (SELECT id FROM public.ingredients WHERE name = 'Unsalted Butter'), 0.03),
((SELECT id FROM public.dishes WHERE name = 'Grilled Salmon Steak'), (SELECT id FROM public.ingredients WHERE name = 'Garlic'), 0.01),
((SELECT id FROM public.dishes WHERE name = 'Grilled Salmon Steak'), (SELECT id FROM public.ingredients WHERE name = 'Olive Oil'), 0.02);

-- Caprese Salad Recipe
INSERT INTO public.dish_ingredients (dish_id, ingredient_id, quantity_needed) VALUES
((SELECT id FROM public.dishes WHERE name = 'Caprese Salad'), (SELECT id FROM public.ingredients WHERE name = 'Cherry Tomatoes'), 0.15),
((SELECT id FROM public.dishes WHERE name = 'Caprese Salad'), (SELECT id FROM public.ingredients WHERE name = 'Fresh Basil'), 0.02),
((SELECT id FROM public.dishes WHERE name = 'Caprese Salad'), (SELECT id FROM public.ingredients WHERE name = 'Olive Oil'), 0.03);

-- Wagyu Ribeye Steak Recipe
INSERT INTO public.dish_ingredients (dish_id, ingredient_id, quantity_needed) VALUES
((SELECT id FROM public.dishes WHERE name = 'Wagyu Ribeye Steak'), (SELECT id FROM public.ingredients WHERE name = 'Wagyu Beef A5'), 0.2),
((SELECT id FROM public.dishes WHERE name = 'Wagyu Ribeye Steak'), (SELECT id FROM public.ingredients WHERE name = 'Unsalted Butter'), 0.02),
((SELECT id FROM public.dishes WHERE name = 'Wagyu Ribeye Steak'), (SELECT id FROM public.ingredients WHERE name = 'Garlic'), 0.01);

-- Garlic Butter Prawns Recipe
INSERT INTO public.dish_ingredients (dish_id, ingredient_id, quantity_needed) VALUES
((SELECT id FROM public.dishes WHERE name = 'Garlic Butter Prawns'), (SELECT id FROM public.ingredients WHERE name = 'Tiger Prawns'), 0.2),
((SELECT id FROM public.dishes WHERE name = 'Garlic Butter Prawns'), (SELECT id FROM public.ingredients WHERE name = 'Unsalted Butter'), 0.05),
((SELECT id FROM public.dishes WHERE name = 'Garlic Butter Prawns'), (SELECT id FROM public.ingredients WHERE name = 'Garlic'), 0.03),
((SELECT id FROM public.dishes WHERE name = 'Garlic Butter Prawns'), (SELECT id FROM public.ingredients WHERE name = 'Fresh Basil'), 0.01);
