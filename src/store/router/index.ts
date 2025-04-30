import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import SpecManagement from '@/pages/SpecManagement.vue'
import ProductPage from '@/pages/ProductPage.vue'


const routes = [
  { path: '/', component: Home },
  { path: '/specsmanagement', component: SpecManagement },
  {path: '/productpage',component: ProductPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
