<template>
  <div class="game-wrap">
    <!-- 상단 고정바: 레벨/진행/점수+시간 -->
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
            :key="progressKey"
            :style="{ width: progressPercent + '%' }"
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

     
    <template v-if="game.nextLevelCountdown > 0 || game.countdown > 0">
 <!-- 카운트다운 오버레이 -->
      <div v-if="game.nextLevelCountdown > 0" class="countdown">
        <div class="num">{{ game.nextLevelCountdown }}</div>
        <p class="next-level-text">다음 레벨로 넘어갑니다...</p>
      </div>
       <!-- 카운트다운 오버레이 -->
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
import { onMounted, ref, computed, nextTick, watch } from 'vue'
import { useKoreanGameStore } from '@/stores/koreanGameStore'
import { useSchoolStore } from '@/stores/school' // characterType: 'cat' | 'teacher'
import { useRouter } from 'vue-router'

const router = useRouter()
const game = useKoreanGameStore()
const school = useSchoolStore()

const answer = ref('')
const inputRef = ref(null)
const isComposing = ref(false)
const progressKey = ref(0)

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

const goBack = () => {
  game.resetGame()     // ✅ 게임 완전 초기화
  router.back()        // ✅ 이전 페이지로 이동
}

watch(
  () => game.level,
  () => {
    // 레벨이 바뀌면 progress bar 재렌더링 트리거
    progressKey.value++
  }
)

// 카운트다운 끝나면 자동 포커스
watch(() => game.countdown, v => {
  if (v === 0 && game.isStarted && !game.isFinished) focusInput()
})

// ✅ 레벨 전환 카운트다운도 끝나면 자동 포커스
watch(() => game.nextLevelCountdown, v => {
  if (v === 0 && game.isStarted && !game.isFinished) {
    // 다음 레벨이 막 시작된 시점이므로
    // DOM이 갱신된 다음에 포커스하도록 nextTick 사용
    nextTick(() => focusInput())
  }
})

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
   // ✅ 새로 추가: 속도 피드백
  if (game.lastResult === 'perfect') {
    return school.characterType === 'teacher' ? '정말 빠르네요!' : '엄청 빠르다냥!'
  }
  if (game.lastResult === 'fast') {
    return school.characterType === 'teacher' ? '아주 좋아요, 빠릅니다!' : '좋은 속도라냥!'
  }
  if (game.lastResult === 'correct') {
    return school.characterType === 'teacher' ? '정답!' : '정답!'
  }
  if (game.lastResult === 'wrong') {
    return school.characterType === 'teacher' ? '아쉽네요!' : '아깝다냥!'
  }
  if (game.nextLevelCountdown > 0) {
    return school.characterType === 'teacher'
      ? `다음 레벨 준비! ${game.nextLevelCountdown}초 후 시작!`
      : `${game.nextLevelCountdown}초 후 다음 레벨이라냥!`
  }
  // 평상시
  return school.characterType === 'teacher'
    ? '정답을 입력해 보세요'
    : '정답을 적어보라냥!'
})

// 말풍선 스타일용 클래스
const bubbleClass = computed(() => {
  const ok = ['correct','perfect','fast'].includes(game.lastResult)
  return {
    correct: ok,
    wrong: game.lastResult === 'wrong'
  }
})

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
  background-image: url('@/assets/bg_game_korean.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 16px;
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
  width: 120px;
  height: 120px;
  padding: 12px 20px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #790483, #7c4dff);
  color: white;
  font-weight: 800;
  font-size: 22px;
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
  line-height: 1.5;
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
.finish { 
  text-align: center;
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center;
  width: 300px;
  height: fit-content;
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
.records { margin-top: 24px;
      background: rgb(249 248 248 / 30%);
  backdrop-filter: blur(2px);
  border: solid 0.5px rgba(200, 200, 200, 0.3);
 }
 .records h3 { text-align: center;}
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
  font-size: 20px;
  cursor: pointer;
  color: #555;
  padding: 4px 8px;
  font-weight: 700;
  background-image: url('@/assets/img_back.png');
  width: 120px;
  height: 80px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 16px;
}
.back-btn:hover, .back-btn:active { transform: scale(0.9); }
.next-level-wait {
  font-size: 20px;
  font-weight: 700;
  color: #7c4dff;
  animation: blink 1s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1 }
  50% { opacity: .4 }
}
.next-level-text {
  position: absolute;
  bottom: 10%;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 4px 10px rgba(0,0,0,.4);
}
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
  width: 45%;
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
