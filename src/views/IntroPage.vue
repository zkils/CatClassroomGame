<template>
  <div class="intro" @click="goNext">
    <img src="@/assets/intro.jpg" alt="인트로" class="intro-image" />
    <div class="touch-to-start">터치하여 시작하기</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goNext = () => {
  router.push('/name')
}
</script>

<style scoped>
.intro {
  width: 100%;
  height: 100vh;
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.intro-image {
  max-width: 100%;
  max-height: 100%;
}

/* 하단 문구 */
.touch-to-start {
  position: absolute;
  bottom: 80px;
  font-size: 2rem;
  color: #ff00c8d4;
  padding: 8px 16px;
  --webkit-text-stroke: 1px black;  /* 윤곽선 두께와 색상 */
  border: 1px solid gold;
  border-radius: 20px;
  background: linear-gradient(
    to right,
    rgba(255, 192, 203, 0.6), /* 핑크 */
    rgba(186, 85, 211, 0.6)   /* 보라 */
  );
  backdrop-filter: blur(2px); /* 흐림 효과 추가(optional) */
}

@keyframes blink {
  0%, 100% { opacity: 1 }
  50% { opacity: 0.4 }
}
</style>
