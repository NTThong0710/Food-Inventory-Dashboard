import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', name: 'home', redirect: '/dashboard'},
    {path: '/login', name: 'login', component: () => import('../features/auth/views/LoginView.vue'), meta: { requiresAuth: false }},
    {path: '/forgot-password', name: 'forgot-password', component: () => import('../features/auth/views/ForgotPasswordView.vue'), meta: { requiresAuth: false }},
    {path: '/update-password', name: 'update-password', component: () => import('../features/auth/views/UpdatePasswordView.vue'), meta: { requiresAuth: false }},
    {path: '/dashboard', name: 'dashboard', component: () => import('../features/dashboard/views/DashboardView.vue'), meta: { requiresAuth: true, permission: 'dashboard_read' }},
    {path: '/account', name: 'account', component: () => import('../features/account/views/AccountView.vue'), meta: { requiresAuth: true }},
    {path: '/ingredients', name: 'ingredients', component: () => import('../features/inventory/views/IngredientsView.vue'), meta: { requiresAuth: true, permission: 'ingredient_read' }},
    {path: '/dishes', name: 'dishes', component: () => import('../features/dishes/views/DishesView.vue'), meta: { requiresAuth: true, permission: 'dish_read' }},
    {path: '/suppliers', name: 'suppliers', component: () => import('../features/suppliers/views/SuppliersView.vue'), meta: { requiresAuth: true, permission: 'supplier_read' }},
    {path: '/batches', name: 'batches', component: () => import('../features/batches/views/BatchesView.vue'), meta: { requiresAuth: true, permission: 'batch_read' }},
    {path: '/sales', name: 'sales', component: () => import('../features/sales/views/SalesView.vue'), meta: { requiresAuth: true, permission: 'sale_read' }}
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Always wait for the initAuthListener to fully complete (includes permissions fetch)
  // This prevents race conditions where permissions aren't loaded yet when the guard runs
  await authStore.initAuthListener();

  const requiresAuth = to.meta.requiresAuth ?? true
  const requiredPermission = to.meta.permission as string | undefined

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/forgot-password') && authStore.isAuthenticated) {
    if (authStore.hasPermission('dashboard_read')) {
      next('/dashboard')
    } else if (authStore.hasPermission('dish_read')) {
      next('/dishes')
    } else if (authStore.hasPermission('ingredient_read')) {
      next('/ingredients')
    } else {
      next('/account')
    }
  } else if (requiresAuth && requiredPermission && !authStore.hasPermission(requiredPermission)) {
    // If not authorized for this specific route, send them somewhere safe
    if (to.path !== '/dashboard' && authStore.hasPermission('dashboard_read')) {
      next('/dashboard')
    } else if (to.path !== '/dishes' && authStore.hasPermission('dish_read')) {
      next('/dishes')
    } else if (to.path !== '/ingredients' && authStore.hasPermission('ingredient_read')) {
      next('/ingredients')
    } else {
      next('/account') // fallback
    }
  } else {
    next()
  }
})

export default router
