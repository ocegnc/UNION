import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/questionnaire',
      name: 'questionnaire',
      component: () => import('../views/Questionnaire.vue')
    },
    {
      path: '/new-patient',
      name: 'newpatient',
      component: () => import('../views/NewPatient.vue')
    },
  ],
})

export default router
