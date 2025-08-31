<template>
  <div class="game-wrap">
    <header class="topbar">
      <div class="level">LEVEL {{ game.level }}</div>
      <div class="progress">{{ game.progressText }}</div>
      <div class="score">점수: {{ game.score }}</div>
    </header>

    <main class="stage">
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
          placeholder="여기에 정답을 입력하고 Enter"
        />
        <button type="submit">확인</button>
      </form>

      <p class="hint">
        1레벨: 자음/모음 한 글자 · 2레벨: 완성형 한 글자 · 3레벨: 단어
      </p>

      <div v-if="game.lastResult" class="result" :class="game.lastResult">
        {{ game.lastResult === 'correct' ? '정답!' : '오답!' }}
      </div>

      <div v-if="game.isFinished" class="finish">
        <h2>게임 종료</h2>
        <p>최종 점수: <strong>{{ game.score }}</strong></p>
        <button @click="restart">처음부터 다시</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, nextTick } from 'vue'
import { useKoreanGameStore } from '@/stores/koreanGame'

const game = useKoreanGameStore()
const answer = ref('')
const inputRef = ref(null)
const isComposing = ref(false)

const maxLen = computed(() => game.level === 3 ? 12 : 1)

const focusInput = () => nextTick(() => inputRef.value?.focus())
const onCompEnd = () => { isComposing.value = false }

const submitCore = () => {
  const payload = game.level === 3 ? answer.value : answer.value.slice(0, 1)
  game.submit(payload)
  answer.value = ''
  focusInput()
}

const onSubmit = () => {
  if (isComposing.value) return
  submitCore()
}

const restart = () => {
  game.start(1)
  answer.value = ''
  focusInput()
}

onMounted(() => {
  game.start(1)
  focusInput()
})

const shakeClass = computed(() => game.lastResult === 'wrong' ? 'shake' : '')
</script>

<style scoped>
.game-wrap {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 20px 32px;
  font-family: system-ui, -apple-system, 'Noto Sans KR', Segoe UI, Roboto, sans-serif;
}

.topbar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.level { font-weight: 700 }
.progress { text-align: center; color: #666 }
.score { text-align: right; font-weight: 800; position: sticky; top: 8px }

.stage {
  display: grid;
  justify-items: center;
  gap: 16px;
}

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
  width: min(480px, 100%);
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

.hint { color: #777; font-size: 13px }

.result { font-size: 18px; font-weight: 800 }
.result.correct { color: #00a884 }
.result.wrong   { color: #ff3b30 }

/* 오답 시 살짝 흔들림 */
@keyframes k-shake {
  0% { transform: translateX(0) }
  20% { transform: translateX(-8px) }
  40% { transform: translateX(6px) }
  60% { transform: translateX(-4px) }
  80% { transform: translateX(2px) }
  100%{ transform: translateX(0) }
}
.shake { animation: k-shake .25s linear 1 }
</style>
