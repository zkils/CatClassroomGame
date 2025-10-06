<template>
  <div class="game-wrap">
    <!-- 상단 고정바 -->
    <header class="topbar">
      <button class="back-btn" @click="goBack"></button>
    </header>

    <section class="character-row">
    <!-- ✅ 새로 추가된 상태 패널 -->
        <div class="status-panel">
            <div class="status-top">
            <span class="level">LEVEL {{ game.level }}</span>
            <span class="score">점수 {{ game.score }}</span>
            <span class="time">시간 {{ formattedElapsed }}</span>
            </div>

            <!-- ✅ 진행도 바 -->
            <div class="progress-wrap">
            <div
                class="progress-bar"
                :style="{ width: progressPercent + '%' }"
                :key="progressKey"
            ></div>
            </div>

            <div class="progress-text">
            {{ game.progressText }}
            </div>
        </div>

        <div class="character-bubble">
            <!-- 캐릭터 -->
            <div class="character">
                <img :src="characterImg" alt="character" />
            </div>

            <!-- 말풍선 -->
            <div class="speech-bubble" :class="bubbleClass">
                <span>{{ bubbleText }}</span>
            </div>
        </div>
    </section>

    <!-- 메인 스테이지 -->
    <main class="stage">
      <!-- 시작 전 -->
      <div v-if="!game.isStarted" class="start-panel">
        <button class="start-btn" @click="onStart">시작</button>
      </div>

      <!-- 카운트다운 -->
      <template v-if="game.nextLevelCountdown > 0 || game.countdown > 0">
        <div v-if="game.nextLevelCountdown > 0" class="countdown">
          <div class="num">{{ game.nextLevelCountdown }}</div>
          <p class="next-level-text">다음 레벨로 넘어갑니다...</p>
        </div>
        <div v-if="game.countdown > 0" class="countdown">
          <div class="num">{{ game.countdown }}</div>
        </div>
      </template>

      <!-- 문제/입력/결과 -->
      <template v-else-if="game.isStarted && game.countdown === 0">
        <div
          v-if="!game.isFinished"
          class="question"
          :class="shakeClass"
        >
          {{ game.currentQuestion }}
        </div>

        <form
          v-if="!game.isFinished"
          class="answer"
          @submit.prevent="onSubmit"
        >
          <input
            ref="inputRef"
            v-model="answer"
            type="number"
            inputmode="numeric"
            autocomplete="off"
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
    <section v-if="game.records.length && game.isFinished" class="records">
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
import { ref, computed, nextTick, watch } from 'vue'
import { useMathGameStore } from '@/stores/mathGameStore'
import { useSchoolStore } from '@/stores/school'
import { useRouter } from 'vue-router'

const router = useRouter()
const game = useMathGameStore()
const school = useSchoolStore()
const progressKey = ref(0)

const answer = ref('')
const inputRef = ref(null)
const focusInput = () => nextTick(() => inputRef.value?.focus())
// 진행률 (예: 3 / 10 → 30%)
const progressPercent = computed(() => {
  const current = game.questionIndex + 1
  return (current / 10) * 100
})

watch(
  () => game.level,
  () => {
    // 레벨이 바뀌면 progress bar 재렌더링 트리거
    progressKey.value++
  }
)

const onSubmit = () => {
  if (answer.value === null || answer.value === undefined) return
  game.submit(answer.value)
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

const goBack = () => {
  game.resetGame()
  router.back()
}

// 흔들림
const shakeClass = computed(() => (game.lastResult === 'wrong' ? 'shake' : ''))

// 시간 포맷
const formatMs = ms => {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const ss = String(s % 60).padStart(2, '0')
  return `${m}:${ss}`
}
const formattedElapsed = computed(() => formatMs(game.elapsedMs))

// 날짜 포맷
const formatDate = iso => {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

// 캐릭터 이미지
const characterImg = computed(() =>
  school.characterType === 'teacher'
    ? new URL('@/assets/img_char_teacher.png', import.meta.url).href
    : new URL('@/assets/img_char_cat.png', import.meta.url).href
)

// 말풍선 문구
const bubbleText = computed(() => {
  if (!game.isStarted) {
    return school.characterType === 'teacher'
      ? '시작 버튼을 눌러 수학 퀴즈를 시작해요!'
      : '수학 게임, 시작하라냥!'
  }
  if (game.countdown > 0) return `${game.countdown}... 준비!`
  if (game.isFinished) {
    return school.characterType === 'teacher'
      ? '수고했어요! 다시 해볼까요?'
      : '대단하냥! 또 해보자냥!'
  }
  if (game.lastResult === 'perfect')
    return school.characterType === 'teacher' ? '정말 빠르네요!' : '엄청 빠르다냥!'
  if (game.lastResult === 'fast')
    return school.characterType === 'teacher' ? '아주 좋아요, 빠릅니다!' : '좋은 속도라냥!'
  if (game.lastResult === 'correct')
    return school.characterType === 'teacher' ? '정답이에요!' : '정답이라냥!'
  if (game.lastResult === 'wrong')
    return school.characterType === 'teacher' ? '다시 계산해봐요!' : '틀렸다냥!'
  if (game.nextLevelCountdown > 0)
    return school.characterType === 'teacher'
      ? `다음 레벨 준비! ${game.nextLevelCountdown}초 후 시작!`
      : `${game.nextLevelCountdown}초 후 다음 레벨이라냥!`

  return school.characterType === 'teacher'
    ? '답을 계산해 보세요'
    : '답을 계산해보라냥!'
})

// 말풍선 스타일
const bubbleClass = computed(() => ({
  correct: ['correct', 'perfect', 'fast'].includes(game.lastResult),
  wrong: game.lastResult === 'wrong'
}))

// 카운트다운 종료 후 포커스
watch(() => game.countdown, v => {
  if (v === 0 && game.isStarted && !game.isFinished) focusInput()
})
watch(() => game.nextLevelCountdown, v => {
  if (v === 0 && game.isStarted && !game.isFinished) nextTick(() => focusInput())
})
</script>

<style scoped>
.game-wrap {
  max-width: 880px;
  margin: 0 auto;
  padding: 16px 20px 48px;
  font-family: system-ui, -apple-system, 'Noto Sans KR', Segoe UI, Roboto, sans-serif;
  background-image: url('@/assets/bg_game_math.png'); /* ✅ 수학 게임용 배경 */
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 16px;
}

/* 상단바 */
.topbar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  margin-bottom: 12px;
}
.level { font-weight: 700 }
.progress { text-align: center; color: #666 }
.meta { text-align: right; display: flex; gap: 12px; justify-content: flex-end; }
.meta .score { font-weight: 800 }
.meta .time { color: #444 }

/* 캐릭터 */
.character-row {
  display: flex;
  flex-direction: column; /* ✅ 세로 정렬 */
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
}
 .character-row .character-bubble{
      display: grid;
        grid-template-columns: auto 1fr;
        gap: 16px;
        align-items: center;
        margin-bottom: 12px;
        width: 100%;
  }
.character-row .character-bubble img {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 16px;
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
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
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

/* 시작 */
.start-btn {
  width: 120px;
  height: 120px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #51077c, #a600ff);
  color: white;
  font-weight: 800;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 8px 22px rgba(0, 122, 255, 0.25);
}

/* 카운트다운 */
.countdown {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  z-index: 5;
}
.countdown .num {
  font-size: clamp(64px, 12vw, 140px);
  font-weight: 900;
  color: #fff;
  text-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  animation: pop 0.9s ease-out infinite;
}
@keyframes pop {
  0% { transform: scale(.8); opacity: .9 }
  70% { transform: scale(1.1); opacity: 1 }
  100% { transform: scale(1); opacity: .95 }
}
.next-level-text {
  position: absolute;
  bottom: 10%;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 4px 10px rgba(0, 0, 0, .4);
}

/* 문제/입력 */
.question {
  font-size: clamp(64px, 12vw, 120px);
  font-weight: 900;
  background: white;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .08);
}
.answer {
  display: flex;
  gap: 8px;
  width: min(520px, 100%);
}
.answer input {
  flex: 1;
  font-size: 24px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #ddd;
  outline: none;
  text-align: center;
}
.answer input:focus {
  border-color: #00aaff;
  box-shadow: 0 0 0 3px rgba(0, 170, 255, 0.15);
}
.answer button {
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: #00aaff;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

/* 결과 */
.finish {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 300px;
  padding: 16px;
  border-radius: 16px;
  background: rgb(249 248 248 / 30%);
  backdrop-filter: blur(2px);
  border: solid 0.5px rgba(200, 200, 200, 0.3);
}
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

/* 흔들림 */
@keyframes k-shake {
  0% { transform: translateX(0) }
  20% { transform: translateX(-8px) }
  40% { transform: translateX(6px) }
  60% { transform: translateX(-4px) }
  80% { transform: translateX(2px) }
  100% { transform: translateX(0) }
}
.shake { animation: k-shake .25s linear 1 }

/* 기록 */
.records {
  margin-top: 24px;
  background: rgb(249 248 248 / 30%);
  backdrop-filter: blur(2px);
  border: solid 0.5px rgba(200, 200, 200, 0.3);
}
.records h3 { text-align: center; }
.records table { width: 100%; border-collapse: collapse; }
.records th, .records td {
  border-bottom: 1px solid #eee;
  text-align: left;
  padding: 8px 6px;
}
.records th { color: #666; font-weight: 700 }

.back-btn {
  border: none;
  background: transparent;
  width: 120px;
  height: 80px;
  background-image: url('@/assets/img_back.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
}
.back-btn:hover { transform: scale(0.9); }
.status-panel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  gap: 16px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  font-weight: 700;
  font-size: 18px;
  color: #333;
}

.status-panel .status-top {
    display:flex;
    gap: 16px;
}

.status-panel .level {
  color: #7c4dff;
  font-weight: 900;
}

.status-panel .progress {
  color: #555;
}

.status-panel .meta {
  display: flex;
  gap: 12px;
}

.status-panel .score {
  color: #ff9800;
  font-weight: 900;
}

.status-panel .time {
  color: #0078d7;
  font-weight: 900;
}

/* ✅ 진행도 바 */
.progress-wrap {
  width: 40%;
  height: 12px;
  background: rgba(200, 200, 200, 0.25);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ffd24d, #7c4dff);
  border-radius: 8px;
  transition: width 0.3s ease;
}
.progress-text {
  font-size: 14px;
  color: #555;
}
</style>
