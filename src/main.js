import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { inject } from '@vercel/analytics'
import va from '@vercel/analytics'  // track 함수용

// Pinia 초기화
export const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')

// ✅ 초기 페이지 로드 시 Analytics 초기화
inject()

// ✅ 라우트 이동 시 pageview 이벤트 기록
router.afterEach((to) => {
  va.track('pageview', {
    path: to.fullPath,   // 전체 경로 (/users/123?tab=info)
    name: to.name || '', // 라우트 이름
  })
})
