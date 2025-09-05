import type { NavigationGuard } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/index.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/login.vue'),
  },
]

export default routes
