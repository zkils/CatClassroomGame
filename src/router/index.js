import { createRouter, createWebHistory } from 'vue-router'
import IntroPage from '@/views/IntroPage.vue'
import NameInputPage from '@/views/NameInputPage.vue'
import CharacterSelectPage from '@/views/CharacterSelectPage.vue'
import GameSelectPage from '@/views/GameSelectPage.vue'
import KoreanClassGame from '@/views/KoreanClassGame.vue'

import { useSchoolStore } from '@/stores/school'
import { pinia } from '@/main'

const routes = [
  { path: '/', name: 'IntroPage', component: IntroPage },
  { path: '/name', name: 'NameInputPage', component: NameInputPage },
  { path: '/character', name: 'CharacterSelectPage', component: CharacterSelectPage },
  { path: '/game-select', name: 'GameSelectPage', component: GameSelectPage },
  { path: '/korean-class', name: 'KoreanClassGame', component: KoreanClassGame },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 이름 없으면 캐릭터/게임 진입 불가
router.beforeEach((to, from, next) => {
  const school = useSchoolStore(pinia)
  if ((to.name === 'CharacterSelectPage' || to.name === 'GamePage') && !school.isValidName) {
    return next({ name: 'NameInputPage' })
  }
  next()
})

export default router
