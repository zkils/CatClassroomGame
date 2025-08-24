import { createRouter, createWebHistory } from 'vue-router'
import IntroPage from '@/views/IntroPage.vue'
import NameInputPage from '@/views/NameInputPage.vue'
import GamePage from '@/views/GamePage.vue'

const routes = [
  { path: '/', name: 'IntroPage', component: IntroPage },
  { path: '/name', name: 'NameInputPage', component: NameInputPage },
  { path: '/game', name: 'GamePage', component: GamePage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
