import { defineStore } from 'pinia'

const JA = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const MO = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']

// 3레벨 단어 예시
const WORDS = [
  '고양이','교실','선생님','자동차','바다','나무','사과','컴퓨터',
  '비행기','하늘','초콜릿','친구','바람','강아지','우산','문구점'
]

// 한글 합성용
const CHOSEONG = JA
const JUNGSEONG = MO
const JONGSEONG = ['', 'ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

const HANGUL_BASE = 0xac00
const JUNG = 21
const JONG = 28

const randomInt = n => Math.floor(Math.random() * n)

const composeHangul = (c, v, t) =>
  String.fromCharCode(HANGUL_BASE + (c * JUNG + v) * JONG + t)

const makeQuestion = level => {
  if (level === 1) {
    return Math.random() < 0.5
      ? JA[randomInt(JA.length)]
      : MO[randomInt(MO.length)]
  }
  if (level === 2) {
    const c = randomInt(CHOSEONG.length)
    const v = randomInt(JUNGSEONG.length)
    const t = Math.random() < 0.55 ? 0 : 1 + randomInt(JONGSEONG.length - 1)
    return composeHangul(c, v, t)
  }
  return WORDS[randomInt(WORDS.length)]
}

export const useKoreanGameStore = defineStore('korean-game', {
  state: () => ({
    level: 1,
    score: 0,
    questionIndex: 0,   // 0~9
    correctCount: 0,
    currentQuestion: '',
    isFinished: false,
    lastResult: null,   // 'correct' | 'wrong' | null
  }),
  getters: {
    progressText: s => `${s.questionIndex + 1} / 10`,
    neededToPass: () => 8,
    levelScore: s => (s.level === 1 ? 10 : s.level === 2 ? 20 : 30),
  },
  actions: {
    start(level = 1) {
      this.level = level
      this.score = 0
      this.resetLevelState()
      this.isFinished = false
      this.nextQuestion()
    },
    resetLevelState() {
      this.questionIndex = 0
      this.correctCount = 0
      this.lastResult = null
    },
    nextQuestion() {
      this.currentQuestion = makeQuestion(this.level)
    },
    submit(answerRaw) {
      if (this.isFinished) return
      const ans = (answerRaw ?? '').trim()
      const target = this.currentQuestion.trim()

      const correct = ans === target
      this.lastResult = correct ? 'correct' : 'wrong'
      if (correct) {
        this.correctCount++
        this.score += this.level === 1 ? 10 : this.level === 2 ? 20 : 30
      }

      if (this.questionIndex < 9) {
        this.questionIndex++
        this.nextQuestion()
      } else {
        const passed = this.correctCount >= 8
        if (this.level < 3 && passed) {
          this.level = this.level + 1
          this.resetLevelState()
          this.nextQuestion()
        } else {
          this.isFinished = true
        }
      }
    },
  }
})
