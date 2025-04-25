import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import SpecManagement from '@/pages/SpecManagement.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/specs', component: SpecManagement },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
