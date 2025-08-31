<template>
  <div class="game-select-page">
    <h1 class="sr-only">게임 선택</h1>

    <!-- 3행 2열 그리드 버튼 -->
    <div class="grid">
      <button
        v-for="item in games"
        :key="item.key"
        class="game-btn"
        type="button"
        @click="handleClick(item.path)"
      >
        <span class="emoji" aria-hidden="true">{{ item.emoji }}</span>
        <span class="label">{{ item.title }}</span>
      </button>

      <div v-for="n in emptySlots" :key="'empty-'+n" class="empty-cell" aria-hidden="true" />
    </div>

    <!-- 우측 하단 캐릭터 -->
   <div v-if="characterSrc" class="character-with-bubble">
      <div class="speech-bubble">{{ speechText }}</div>
      <img :src="characterSrc" alt="선택한 캐릭터" class="character" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useSchoolStore } from '@/stores/school'

const router = useRouter()
const schoolStore = useSchoolStore()

const games = [
  { key: 'korean', title: '국어', path: '/korean-class', emoji: '📖' },
  { key: 'math', title: '수학', path: '/math-class', emoji: '🧮' },
  { key: 'break', title: '쉬는 시간', path: '/fun-play', emoji: '🎈' }
]

const emptySlots = computed(() => Math.max(0, 6 - games.length))

const handleClick = path => {
  router.push(path)
}

// 캐릭터 타입에 따른 이미지 매핑
const characterSrc = computed(() => {
  if (schoolStore.characterType === 'cat') {
    return '/images/img_char_cat.png'
  } else if (schoolStore.characterType === 'teacher') {
    return '/images/img_char_teacher.png'
  }
  return ''
})

const speechText = computed(() => {
  const schoolName = schoolStore.schoolName
if (schoolStore.characterType === 'cat') {
return `${schoolName} 친구들 교실을 골라보라냥!`
} else if (schoolStore.characterType === 'teacher') {
return `${schoolName} 어린이 여러분 교실을 선택해주세요`
}
return '원하는 게임을 선택하세요!'
})
</script>

<style scoped>
.game-select-page {
  position: relative;
  min-height: 100dvh;
  padding: 16px 16px 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: url('@/assets/img_bg_sprite.png');
  background-repeat: repeat;
  background-size: 400px 400px; /* 원하는 반복 단위 */
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 1fr));
  grid-template-rows: repeat(3, 1fr);
  gap: 14px;
  width: min(560px, 92vw);
}

.game-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 18px;
  background: #ffffffcc;
  box-shadow: 0 6px 0 #d9d4ff, 0 12px 18px rgba(0,0,0,.08);
  border: solid 0.5px #0000002b;
  padding: 18px 12px;
  cursor: pointer;
  transition: transform .08s ease, box-shadow .08s ease, background .2s ease;
  user-select: none;
}
.game-btn:focus { outline: 3px solid #ffc6f1 }
.game-btn:hover { transform: translateY(-2px) }
.game-btn:active {
  transform: translateY(2px);
  box-shadow: 0 3px 0 #d9d4ff, 0 8px 12px rgba(0,0,0,.08);
}

.game-btn .emoji { font-size: 34px; line-height: 1 }
.game-btn .label {
  margin-top: 8px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: .02em;
  color: #3b2a58;
}

.empty-cell { border-radius: 18px; opacity: .15 }
/* 캐릭터 + 말풍선 */
.character-with-bubble {
position: fixed;
right: 12px;
bottom: 12px;
display: flex;
flex-direction: column;
align-items: flex-end;
gap: 8px;
pointer-events: none;
}


.speech-bubble {
position: relative;
max-width: 260px;
padding: 12px 16px;
border-radius: 16px;
background: #ffffff;
border: 2px solid #ffd7f4;
box-shadow: 0 6px 18px rgba(0,0,0,.08);
font-size: 16px;
font-weight: 700;
color: #4a2e61;
text-align: center;
margin-right:48px;
}
.speech-bubble::after {
content: '';
position: absolute;
right: 28px;
bottom: -10px;
width: 18px;
height: 18px;
background: #ffffff;
border-right: 2px solid #ffd7f4;
border-bottom: 2px solid #ffd7f4;
transform: rotate(45deg);
box-shadow: 2px 2px 6px rgba(0,0,0,.05);
}


.character {
width: 200px;
height: 200px;
object-fit: contain;
filter: drop-shadow(0 6px 10px rgba(0,0,0,.15));
animation: floaty 2.6s ease-in-out infinite;
}


@keyframes floaty {
0%, 100% { transform: translateY(0) }
50% { transform: translateY(-6px) }
}


.sr-only {
position: absolute !important;
width: 1px; height: 1px; padding: 0; margin: -1px;
overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}


@media (min-width: 720px) {
.game-btn .emoji { font-size: 40px }
.game-btn .label { font-size: 20px }
.character { width: 240px; height: 240px }
}
</style>
