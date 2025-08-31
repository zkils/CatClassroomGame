<template>
  <div class="character-select">
    <div class="stage">
      <!-- 좌측: 고양이 영역 버튼 -->
      <button
        class="zone left"
        :class="{ highlight: currentHighlight === 'cat', selected: result === 'cat' }"
        @click="pick('cat')"
        :disabled="isRolling"
        aria-label="고양이 선택"
      />

      <!-- 우측: 선생님 영역 버튼 -->
      <button
        class="zone right"
        :class="{ highlight: currentHighlight === 'teacher', selected: result === 'teacher' }"
        @click="pick('teacher')"
        :disabled="isRolling"
        aria-label="선생님 선택"
      />

      <!-- 하단: 시작 버튼 -->
      <button class="start-btn" @click="startRoll" :disabled="isRolling">
        랜덤 선택
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSchoolStore } from '@/stores/school'

const router = useRouter()
const school = useSchoolStore()

const isRolling = ref(false)
const currentHighlight = ref('cat')   // 'cat' | 'teacher'
const result = ref(null)               // 최종 결과

let intervalId = null
let timeoutId = null

const startRoll = () => {
  if (isRolling.value) return
  isRolling.value = true
  result.value = null

  // 150ms 간격으로 하이라이트 번갈아가며
  intervalId = setInterval(() => {
    currentHighlight.value = currentHighlight.value === 'cat' ? 'teacher' : 'cat'
  }, 150)

  // 3초 후 확정
  timeoutId = setTimeout(() => {
    clearInterval(intervalId)
    intervalId = null
    const pick = Math.random() < 0.5 ? 'cat' : 'teacher'
    result.value = pick
    currentHighlight.value = pick

    // store 저장 후 게임으로 이동
    school.setCharacter(pick)
    setTimeout(() => router.push('/game-select'), 600)
    isRolling.value = false
  }, 3000)
}

const pick = (type) => {
  // 사용자가 직접 누르면 즉시 확정
  if (isRolling.value) return
  result.value = type
  currentHighlight.value = type
  school.setCharacter(type)
  router.push('/game-select')
}

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<style scoped>
.character-select {
  height: 100vh;
  display: grid;
  place-items: center;
  background: #fffafc;
}

.stage {
  position: relative;
  width: min(1000px, 92vw);
  aspect-ratio: 16 / 10;
  background: url('@/assets/bg_2.png') no-repeat center / cover;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,.15);
  overflow: hidden;
}

/* 좌/우 클릭 영역 */
.zone {
  position: absolute;
  top: 18%;
  bottom: 26%;
  width: 400px;
  height:400px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: box-shadow .2s, transform .2s, outline .2s;
  outline: none;
  opacity:0.3;
}

/* 좌측(고양이) */
.zone.left {
  left: 8%;
  background: url('@/assets/img_char_cat.png');
  background-size: contain;
}

/* 우측(선생님) */
.zone.right {
  right: 17%;
    background: url('@/assets/img_char_teacher.png');
  background-size: contain;
}

/* 번갈아 하이라이트 */
.zone.highlight {
  opacity: 1;
  animation: pulse .6s ease-in-out infinite alternate;
}

/* 확정 표시 */
.zone.selected {
  transform: scale(1.1);
}

/* 시작 버튼 */
.start-btn {
  position: absolute;
  left: 50%;
  bottom: 6%;
  transform: translateX(-50%);
  padding: 12px 48px;
  border: none;
  border-radius: 14px;
  font-weight: 800;
  font-size: 1.2rem;
  color: #fff;
  background: linear-gradient(135deg, #ff6b81, #9b5de5);
  cursor: pointer;
  transition: transform .15s, box-shadow .2s;
}
.start-btn:hover { transform: translateX(-50%) scale(1.03) }
.start-btn:active { transform: translateX(-50%) scale(.95) }
.start-btn:disabled { opacity: .7; cursor: not-allowed }

@keyframes pulse {
  from { filter: drop-shadow(0 0 0 rgba(0,0,0,0)) }
  to   { filter: drop-shadow(0 0 12px rgba(155,93,229,.6)) }
}

/* 모바일 터치 접근성: 기본 포커스 아웃라인 제거 */
.zone:focus,
.zone:active,
.start-btn:focus,
.start-btn:active {
  outline: none;
  box-shadow: none;
}
</style>
