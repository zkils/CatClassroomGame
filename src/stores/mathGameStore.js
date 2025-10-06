import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

const now = () => Date.now()
const PASS_THRESHOLD = 6

// ✅ 난수 유틸
const randomInt = n => Math.floor(Math.random() * n)

// ✅ 수학 문제 생성기
const makeMathQuestion = level => {
  let a, b, op, correct, question

  if (level === 1) {
    // 한자리 덧셈 (합 ≤ 10)
    do {
      a = randomInt(10)
      b = randomInt(10)
    } while (a + b > 10)
    op = '+'
    correct = a + b
  }

  else if (level === 2) {
    // 한자리 뺄셈 (음수 X)
    do {
      a = randomInt(10)
      b = randomInt(10)
    } while (a - b < 0)
    op = '-'
    correct = a - b
  }

  else if (level === 3) {
    // 두자리 덧셈 (합 ≤ 100)
    do {
      a = Math.floor(Math.random() * 90 + 10)
      b = Math.floor(Math.random() * 90 + 10)
    } while (a + b > 100)
    op = '+'
    correct = a + b
  }

  else if (level === 4) {
    // 두자리 뺄셈 (음수 X)
    do {
      a = Math.floor(Math.random() * 90 + 10)
      b = Math.floor(Math.random() * 90 + 10)
    } while (a - b < 0)
    op = '-'
    correct = a - b
  }

  else if (level === 5) {
    // 두자리 덧셈·뺄셈 혼합 (음수 X, 최대 999)
    do {
      a = Math.floor(Math.random() * 90 + 10)
      b = Math.floor(Math.random() * 90 + 10)
      op = Math.random() < 0.5 ? '+' : '-'
      correct = op === '+' ? a + b : a - b
    } while (correct < 0 || correct > 999)
  }

  question = `${a} ${op} ${b} = ?`
  return { question, correct }
}

export const useMathGameStore = defineStore('math-game', {
  state: () => ({
    // 진행 상태
    level: 1,
    score: 0,
    questionIndex: 0,   // 0~9
    correctCount: 0,
    currentQuestion: '',
    correctAnswer: null,
    lastResult: null,   // 'correct' | 'wrong' | 'fast' | 'perfect'
    isFinished: false,
    questionStartedAt: null,

    // 시작/카운트다운/타이머
    isStarted: false,
    isRunning: false,
    countdown: 0,
    startedAt: null,
    elapsedMs: 0,
    _tickId: null,
    nextLevelCountdown: 0,

    // 기록
    records: useLocalStorage('math-game-records', []), // { dateISO, score, durationMs }
  }),

  getters: {
    progressText: s => `${s.questionIndex + 1} / 10`,
    neededToPass: () => 8,
    levelScore: s => [0, 10, 20, 30, 40, 50][s.level] || 10,
    elapsedSec: s => Math.floor(s.elapsedMs / 1000),
  },

  actions: {
    // 타이머 제어
    _clearTimer() {
      if (this._tickId) {
        clearInterval(this._tickId)
        this._tickId = null
      }
    },
    _startTimer() {
      this.startedAt = now()
      this.isRunning = true
      this._clearTimer()
      this._tickId = setInterval(() => {
        this.elapsedMs = now() - this.startedAt
      }, 100)
    },
    _stopTimer() {
      if (!this.isRunning) return
      this.isRunning = false
      this._clearTimer()
    },

    // 전체 리셋
    _resetAll() {
      this.level = 1
      this.score = 0
      this.questionIndex = 0
      this.correctCount = 0
      this.currentQuestion = ''
      this.correctAnswer = null
      this.lastResult = null
      this.isFinished = false
      this.isStarted = false
      this.countdown = 0
      this.startedAt = null
      this.elapsedMs = 0
      this._stopTimer()
    },

    // 다음 문제 생성
    nextQuestion() {
      const q = makeMathQuestion(this.level)
      this.currentQuestion = q.question
      this.correctAnswer = q.correct
      this.questionStartedAt = now()
    },

    // 카운트다운 시작
    startWithCountdown() {
      this._resetAll()
      this.isStarted = true
      this.countdown = 3
      const step = () => {
        if (this.countdown > 0) {
          setTimeout(() => {
            this.countdown -= 1
            step()
          }, 1000)
        } else {
          this.startLevel(1)
          this._startTimer()
        }
      }
      step()
    },

    // 특정 레벨 시작
    startLevel(level = 1) {
      this.level = level
      this.questionIndex = 0
      this.correctCount = 0
      this.lastResult = null
      this.isFinished = false
      this.nextQuestion()
    },

    // 완전 초기화
    resetGame() {
      this._stopTimer()
      this.isStarted = false
      this.isRunning = false
      this.isFinished = false
      this.countdown = 0
      this.nextLevelCountdown = 0
      this.level = 1
      this.score = 0
      this.correctCount = 0
      this.questionIndex = 0
      this.currentQuestion = ''
      this.correctAnswer = null
      this.lastResult = null
      this.elapsedMs = 0
    },

    // 정답 제출
    submit(answerRaw) {
      if (!this.isStarted || this.countdown > 0 || this.isFinished) return

      const ans = Number(answerRaw)
      const correct = ans === this.correctAnswer
      this.lastResult = correct ? 'correct' : 'wrong'

      if (correct) {
        this.correctCount++

        // 기본 점수
        const base = this.levelScore

        // 소요시간 기반 가중치
        const nowTime = now()
        const timeTakenSec = (nowTime - this.questionStartedAt) / 1000
        const speedRatio = Math.max(0, (30 - timeTakenSec) / 30)
        const multiplier = 1 + speedRatio * 0.5 // 최대 1.5배
        const earned = Math.round(base * multiplier)
        this.score += earned

        if (speedRatio > 0.8) this.lastResult = 'perfect'
        else if (speedRatio > 0.5) this.lastResult = 'fast'
        else this.lastResult = 'correct'

        console.log(
          `레벨${this.level} 기본 ${base}점, ${timeTakenSec.toFixed(1)}초 → ${earned}점`
        )
      }

      // 다음 문제 또는 레벨 종료
      if (this.questionIndex < 9) {
        this.questionIndex++
        this.nextQuestion()
      } else {
        const passed = this.correctCount >= PASS_THRESHOLD
        if (this.level < 5 && passed) {
          // 다음 레벨 카운트다운
          this.nextLevelCountdown = 5
          const tick = () => {
            if (this.nextLevelCountdown > 0) {
              setTimeout(() => {
                this.nextLevelCountdown--
                tick()
              }, 1000)
            } else {
              this.startLevel(this.level + 1)
              this._stopTimer()
              this._startTimer()
            }
          }
          tick()
        } else {
          // 게임 종료
          this.isFinished = true
          this._stopTimer()
          this.records.unshift({
            dateISO: new Date().toISOString(),
            score: this.score,
            durationMs: this.elapsedMs,
          })
        }
      }
    },

    // 다시하기
    restart() {
      this.startWithCountdown()
    },
  },
})
