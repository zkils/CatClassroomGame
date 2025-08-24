<template>
  <div class="name-input">
    <h2>고양이 초등학교 이름을 입력하세요</h2>

    <!-- 이름 입력 -->
    <input
      v-model="schoolName"
      type="text"
      maxlength="10"
      placeholder="학교 이름 (1~10글자)"
    />

    <!-- 시작 버튼 -->
    <button class="start-btn" :disabled="!isValid" @click="startGame">
      <span class="cat-face">🐱</span>
      시작
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const schoolName = ref('')

// 1~10글자 체크
const isValid = computed(() => schoolName.value.length >= 1 && schoolName.value.length <= 10)

const startGame = () => {
  // 입력값을 다음 페이지에 전달하고 싶다면 query나 store에 저장 가능
  router.push({ path: '/game', query: { school: schoolName.value } })
}
</script>

<style scoped>
.name-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #fffafc;
  font-family: 'Pretendard', sans-serif;
}

h2 {
  margin-bottom: 20px;
  font-size: 1.2rem;
  color: #444;
}

input {
  padding: 10px 15px;
  font-size: 1rem;
  border: 2px solid #ccc;
  border-radius: 8px;
  margin-bottom: 20px;
  width: 250px;
  text-align: center;
}

.start-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
  background-color: #ff6b81;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.start-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.start-btn:hover:not(:disabled) {
  background-color: #ff4757;
}

.cat-face {
  font-size: 1.3rem;
}
</style>
