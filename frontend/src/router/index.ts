import { createRouter, createWebHistory } from 'vue-router'
// @ts-ignore
import AppVue from '@/App.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AppVue,
    }
  ],
})

export default router
