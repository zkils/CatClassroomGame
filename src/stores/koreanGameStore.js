import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

const JA = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const MO = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']

const WORDS = [
  // 동물
  '고양이','강아지','호랑이','사자','토끼','곰','판다','여우','늑대','다람쥐',
  '코끼리','기린','원숭이','돼지','소','닭','참새','펭귄','돌고래','상어',
  // 음식
  '사과','바나나','포도','수박','딸기','복숭아','오렌지','파인애플','체리','자두',
  '빵','우유','치즈','김밥','불고기','비빔밥','라면','떡볶이','과자','초콜릿',
  // 사물
  '자동차','자전거','버스','비행기','기차','배','우산','시계','책','연필',
  '지우개','가방','휴대폰','컴퓨터','텔레비전','냉장고','세탁기','신발','모자','옷',
  // 장소
  '학교','교실','도서관','운동장','놀이터','병원','공원','시장','바다','산',
  '강','호수','정원','집','동네','도시','마을','극장','박물관','놀이동산',
  // 자연
  '하늘','구름','바람','비','눈','태양','달','별','무지개','바위',
  '꽃','나무','풀','숲','모래','불','물','돌','씨앗','열매'
]

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

const now = () => Date.now()

export const useKoreanGameStore = defineStore('korean-game', {
  state: () => ({
    // 진행
    level: 1,
    score: 0,
    questionIndex: 0,   // 0~9
    correctCount: 0,
    currentQuestion: '',
    lastResult: null,   // 'correct' | 'wrong' | null
    isFinished: false,
    questionStartedAt: null,  

    // 시작/카운트다운/타이머
    isStarted: false,
    isRunning: false,
    countdown: 0,        // 3→2→1→0
    startedAt: null,     // timestamp(ms)
    elapsedMs: 0,        // 경과(ms)
    _tickId: null,       // setInterval id
    nextLevelCountdown: 0,

    // 기록
    records: useLocalStorage('korean-game-records', []),          // { dateISO, score, durationMs }
  }),
  getters: {
    progressText: s => `${s.questionIndex + 1} / 10`,
    neededToPass: () => 8,
    levelScore: s => (s.level === 1 ? 10 : s.level === 2 ? 20 : 30),
    elapsedSec: s => Math.floor(s.elapsedMs / 1000)
  },
  actions: {
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
    _resetAll() {
      this.level = 1
      this.score = 0
      this.questionIndex = 0
      this.correctCount = 0
      this.currentQuestion = ''
      this.lastResult = null
      this.isFinished = false
      this.isStarted = false
      this.countdown = 0
      this.startedAt = null
      this.elapsedMs = 0
      this._stopTimer()
    },
    nextQuestion() {
      this.currentQuestion = makeQuestion(this.level)
      this.questionStartedAt = Date.now() // ✅ 문제 시작 시각 기록
    },

    // 외부에서 호출: 홈에서 "시작" 눌렀을 때
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
          // 실제 게임 시작
          this.startLevel(1)
          this._startTimer()
        }
      }
      step()
    },

    startLevel(level = 1) {
      this.level = level
      this.questionIndex = 0
      this.correctCount = 0
      this.lastResult = null
      this.isFinished = false
      this.currentQuestion = makeQuestion(this.level)
    },

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
      this.lastResult = null
      this.elapsedMs = 0
    },

     submit(answerRaw) {
      if (!this.isStarted || this.countdown > 0 || this.isFinished) return

      const ans = (answerRaw ?? '').trim()
      const target = this.currentQuestion.trim()
      const correct = ans === target
      this.lastResult = correct ? 'correct' : 'wrong'

      if (correct) {
        this.correctCount++

        // ✅ 1) 기본 점수
        const base = this.level === 1 ? 10 : this.level === 2 ? 20 : 30

        // ✅ 2) 문제 푼 시간 계산
        const now = Date.now()
        const timeTakenSec = (now - this.questionStartedAt) / 1000

        // ✅ 3) 30초 단위 가중치 계산
        const speedRatio = Math.max(0, (30 - timeTakenSec) / 30) // 0~1
        const multiplier = 1 + speedRatio * 0.5 // 최대 1.5배

        // ✅ 4) 최종 점수 반영
        const earned = Math.round(base * multiplier)
        this.score += earned

         if (speedRatio > 0.8)      this.lastResult = 'perfect' // 아주 빠름
         else if (speedRatio > 0.5) this.lastResult = 'fast'    // 빠름
         else                       this.lastResult = 'correct' // 보통
        // ✅ 디버깅용 로그 (원하면 삭제)
        console.log(`기본 ${base}점, 소요 ${timeTakenSec.toFixed(1)}초 → ${earned}점 획득`)
      }

      // 다음 문제 로직 그대로...
      if (this.questionIndex < 9) {
        this.questionIndex++
        this.nextQuestion()
      } else {
        const passed = this.correctCount >= 8
        if (this.level < 3 && passed) {
          this.nextLevelCountdown = 5
          const tick = () => {
            if (this.nextLevelCountdown > 0) {
              setTimeout(() => {
                this.nextLevelCountdown--
                tick()
              }, 1000)
            } else {
              this.startLevel(this.level + 1)
              this._startTimer() 
            }
          }
          tick()
        } else {
          this.isFinished = true
          this._stopTimer()
          this.records.unshift({
            dateISO: new Date().toISOString(),
            score: this.score,
            durationMs: this.elapsedMs
          })
        }
      }
    },


    // 다시하기
    restart() {
      this.startWithCountdown()
    }
  }
})
