import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', name: 'home', component: () => import('../views/HomeView.vue')},
    {path: '/dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue')},
    {path: '/ingredients', name: 'ingredients', component: () => import('../views/IngredientsView.vue')},
    {path: '/dishes', name: 'dishes', component: () => import('../views/DishesView.vue')}
  ],
})

export default router
