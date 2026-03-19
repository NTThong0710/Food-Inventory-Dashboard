import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', name: 'home', redirect: '/dashboard'},
    {path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { requiresAuth: false }},
    {path: '/forgot-password', name: 'forgot-password', component: () => import('../views/ForgotPasswordView.vue'), meta: { requiresAuth: false }},
    {path: '/update-password', name: 'update-password', component: () => import('../views/UpdatePasswordView.vue'), meta: { requiresAuth: false }},
    {path: '/dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiresAuth: true }},
    {path: '/account', name: 'account', component: () => import('../views/AccountView.vue'), meta: { requiresAuth: true }},
    {path: '/ingredients', name: 'ingredients', component: () => import('../views/IngredientsView.vue'), meta: { requiresAuth: true }},
    {path: '/dishes', name: 'dishes', component: () => import('../views/DishesView.vue'), meta: { requiresAuth: true }},
    {path: '/suppliers', name: 'suppliers', component: () => import('../views/SuppliersView.vue'), meta: { requiresAuth: true }}
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for initial auth state if needed, to prevent F5 redirecting to login
  if (authStore.loading) {
    await authStore.initAuthListener();
  }

  const requiresAuth = to.meta.requiresAuth ?? true

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/forgot-password' || to.path === '/update-password') && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
