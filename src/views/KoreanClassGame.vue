<template>
  <div class="game-wrap">
    <!-- 상단 고정바: 레벨/진행/점수+시간 -->
    <header class="topbar">
      <div class="level">LEVEL {{ game.level }}</div>
      <div class="progress">{{ game.progressText }}</div>
      <div class="meta">
        <span class="score">점수 {{ game.score }}</span>
        <span class="time">시간 {{ formattedElapsed }}</span>
      </div>
    </header>

    <!-- 캐릭터 + 말풍선 -->
    <section class="character-row">
      <div class="character">
        <img
          :src="characterImg"
          alt="character"
        />
      </div>
      <div class="speech-bubble" :class="bubbleClass">
        <span>{{ bubbleText }}</span>
      </div>
    </section>

    <!-- 메인 스테이지 -->
    <main class="stage">
      <!-- 시작 전 -->
      <div v-if="!game.isStarted" class="start-panel">
        <button class="start-btn" @click="onStart">시작</button>
      </div>

      <!-- 카운트다운 오버레이 -->
      <div v-if="game.isStarted && game.countdown > 0" class="countdown">
        <div class="num">{{ game.countdown }}</div>
      </div>

      <!-- 문제/입력/결과 -->
      <template v-if="game.isStarted && game.countdown === 0">
        <div class="question" :class="shakeClass">
          {{ game.currentQuestion }}
        </div>

        <form class="answer" @submit.prevent="onSubmit">
          <input
            ref="inputRef"
            v-model="answer"
            type="text"
            :maxlength="maxLen"
            inputmode="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            @compositionstart="isComposing = true"
            @compositionend="onCompEnd"
            placeholder="정답을 입력하고 Enter"
          />
          <button type="submit">확인</button>
        </form>

        <div v-if="game.isFinished" class="finish">
          <h2>게임 종료</h2>
          <p>최종 점수: <strong>{{ game.score }}</strong></p>
          <p>플레이타임: <strong>{{ formattedElapsed }}</strong></p>
          <button @click="onRestart">처음부터 다시</button>
        </div>
      </template>
    </main>

    <!-- 기록 -->
    <section v-if="game.records.length" class="records">
      <h3>기록</h3>
      <table>
        <thead>
          <tr>
            <th>일시</th>
            <th>점수</th>
            <th>플레이타임</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in game.records" :key="i">
            <td>{{ formatDate(r.dateISO) }}</td>
            <td>{{ r.score }}</td>
            <td>{{ formatMs(r.durationMs) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, nextTick, watch } from 'vue'
import { useKoreanGameStore } from '@/stores/koreanGameStore'
import { useSchoolStore } from '@/stores/school' // characterType: 'cat' | 'teacher'

const game = useKoreanGameStore()
const school = useSchoolStore()

const answer = ref('')
const inputRef = ref(null)
const isComposing = ref(false)

const maxLen = computed(() => game.level === 3 ? 12 : 1)
const focusInput = () => nextTick(() => inputRef.value?.focus())
const onCompEnd = () => { isComposing.value = false }

const onSubmit = () => {
  if (isComposing.value) return
  const payload = game.level === 3 ? answer.value : answer.value.slice(0, 1)
  game.submit(payload)
  answer.value = ''
  focusInput()
}

const onStart = () => {
  game.startWithCountdown()
}

const onRestart = () => {
  game.restart()
  answer.value = ''
  focusInput()
}

// 흔들림
const shakeClass = computed(() => game.lastResult === 'wrong' ? 'shake' : '')

// 시간 포맷
const formatMs = ms => {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const ss = String(s % 60).padStart(2, '0')
  return `${m}:${ss}`
}
const formattedElapsed = computed(() => formatMs(game.elapsedMs))

// 👉 이 부분 추가!
const formatDate = iso => {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

// 캐릭터 이미지 경로 (프로젝트 자산에 맞게 바꿔줘)
const characterImg = computed(() => {
  return school.characterType === 'teacher'
    ? new URL('@/assets/img_char_teacher.png', import.meta.url).href
    : new URL('@/assets/img_char_cat.png', import.meta.url).href
})

// 말풍선 문구
const bubbleText = computed(() => {
  if (!game.isStarted) {
    return school.characterType === 'teacher'
      ? '어린이 여러분, 시작 버튼을 눌러주세요'
      : '시작을 눌러보라냥!'
  }
  if (game.countdown > 0) {
    return `${game.countdown}... 준비!`
  }
  if (game.isFinished) {
    return school.characterType === 'teacher'
      ? '수고했어요! 다시 도전해볼까요?'
      : '멋졌어! 또 해보자냥!'
  }
  if (game.lastResult === 'correct') {
    return school.characterType === 'teacher' ? '정답!' : '정답!'
  }
  if (game.lastResult === 'wrong') {
    return school.characterType === 'teacher' ? '아쉽네요!' : '아깝다냥!'
  }
  // 평상시
  return school.characterType === 'teacher'
    ? '정답을 입력해 보세요'
    : '정답을 적어보라냥!'
})

// 말풍선 스타일용 클래스
const bubbleClass = computed(() => ({
  correct: game.lastResult === 'correct',
  wrong: game.lastResult === 'wrong'
}))

// 카운트다운 끝나면 자동 포커스
watch(() => game.countdown, v => {
  if (v === 0 && game.isStarted && !game.isFinished) focusInput()
})

onMounted(() => {
  // 페이지 진입 즉시 포커스는 시작 후에 줄게
})
</script>

<style scoped>
.game-wrap {
  max-width: 880px;
  margin: 0 auto;
  padding: 16px 20px 48px;
  font-family: system-ui, -apple-system, 'Noto Sans KR', Segoe UI, Roboto, sans-serif;
}

/* 상단 바 */
.topbar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.level { font-weight: 700 }
.progress { text-align: center; color: #666 }
.meta { text-align: right; display: flex; gap: 12px; justify-content: flex-end; }
.meta .score { font-weight: 800 }
.meta .time  { color: #444 }

/* 캐릭터 + 말풍선 */
.character-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: end;
  margin-bottom: 12px;
}
.character img {
  width: 200px;
  height: 200px;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
}

/* 말풍선 */
.speech-bubble {
  position: relative;
  display: inline-block;
  max-width: 100%;
  padding: 12px 16px;
  border-radius: 16px;
  background: #fff;
  border: 2px solid #ffd24d;
  box-shadow: 0 6px 18px rgba(0,0,0,.06);
  font-weight: 700;
}
.speech-bubble::after {
  content: '';
  position: absolute;
  left: -12px;
  bottom: 12px;
  border-width: 10px;
  border-style: solid;
  border-color: transparent #ffd24d transparent transparent;
}
.speech-bubble.correct { border-color: #00a884 }
.speech-bubble.correct::after { border-right-color: #00a884 }
.speech-bubble.wrong { border-color: #ff3b30 }
.speech-bubble.wrong::after { border-right-color: #ff3b30 }

/* 스테이지 */
.stage {
  display: grid;
  justify-items: center;
  gap: 16px;
  min-height: 280px;
  position: relative;
}

/* 시작 패널 */
.start-panel { margin-top: 8px }
.start-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff8ad4, #7c4dff);
  color: white;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 22px rgba(124,77,255,.25);
}

/* 카운트다운 */
.countdown {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,.25);
  border-radius: 16px;
  z-index: 5;
}
.countdown .num {
  font-size: clamp(64px, 12vw, 140px);
  font-weight: 900;
  color: #fff;
  text-shadow: 0 6px 18px rgba(0,0,0,.35);
  animation: pop .9s ease-out infinite;
}
@keyframes pop {
  0% { transform: scale(.8); opacity: .9 }
  70% { transform: scale(1.1); opacity: 1 }
  100% { transform: scale(1); opacity: .95 }
}

/* 문제/입력 */
.question {
  font-size: clamp(64px, 12vw, 120px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 2px;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
  background: white;
}
.answer {
  display: flex;
  gap: 8px;
  width: min(520px, 100%);
}
.answer input {
  flex: 1;
  font-size: 20px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #ddd;
  outline: none;
}
.answer input:focus { border-color: #7c4dff; box-shadow: 0 0 0 3px rgba(124,77,255,.15) }
.answer button {
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: #7c4dff;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

/* 결과 */
.finish { text-align: center }
.finish button {
  margin-top: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  background: #00a884;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

/* 오답 흔들림 */
@keyframes k-shake {
  0% { transform: translateX(0) }
  20% { transform: translateX(-8px) }
  40% { transform: translateX(6px) }
  60% { transform: translateX(-4px) }
  80% { transform: translateX(2px) }
  100%{ transform: translateX(0) }
}
.shake { animation: k-shake .25s linear 1 }

/* 기록 */
.records { margin-top: 24px }
.records table { width: 100%; border-collapse: collapse; }
.records th, .records td {
  border-bottom: 1px solid #eee;
  text-align: left;
  padding: 8px 6px;
}
.records th { color: #666; font-weight: 700 }
</style>
