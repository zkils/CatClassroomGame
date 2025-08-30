<template>
  <div class="name-input">
    <h2>고양이 초등학교 이름을 입력하세요</h2>

    <!-- 이름 입력 -->
    <input
      v-model="schoolNameModel"
      type="text"
      maxlength="10"
      placeholder="학교 이름 (1~10글자)"
      @keyup.enter="isValid && startGame()"
    />

    <p v-if="schoolNameModel.length > 10" class="error-msg">
      이름은 최대 10글자까지 입력할 수 있습니다.
    </p>

    <!-- 시작 버튼 -->
    <button class="start-btn" :disabled="!isValid" @click="startGame">
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSchoolStore } from '@/stores/school'

const router = useRouter()
const schoolStore = useSchoolStore()

// store 상태에 직접 v-model (입력 시 trim 적용)
const schoolNameModel = computed({
  get: () => schoolStore.schoolName,
  set: v => schoolStore.setSchoolName(v)
})

// 유효성은 store의 getter 사용
const isValid = computed(() => schoolStore.isValidName)

const startGame = () => {
  if (!isValid.value) return
  router.push('/character')
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
  animation: fade-in 1s ease;
   /* 배경 설정 */
  background: url('@/assets/bg_1.png') no-repeat center center;
  background-size: contain; 
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px) }
  to { opacity: 1; transform: translateY(0) }
}

h2 {
  margin-bottom: 20px;
  font-size: 1.2rem;
  color: #444
}

input {
  padding: 10px 15px;
  font-size: 1rem;
  border: 3px solid transparent;
  border-radius: 12px;
  margin-bottom: 10px;
  width: 250px;
  text-align: center;
   /* 🌈 테두리 그라데이션 */
  background-image: linear-gradient(white, white),
    linear-gradient(45deg, #ff6b81, #ffa94d, #4dabf7, #9775fa);
  background-origin: border-box;
  background-clip: padding-box, border-box;

  /* 안쪽 배경도 살짝 색감 */
  background-color: #fffafc;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  /* 🌟 포커스 시 애니메이션 강조 */
  box-shadow: 0 0 12px rgba(255, 107, 129, 0.8),
              0 0 24px rgba(74, 219, 247, 0.6);
  transform: scale(1.05);
}

/* placeholder도 예쁘게 */
input::placeholder {
  color: #aaa;
  font-style: italic;
}

.error-msg {
  color: #ff4757;
  font-size: 0.9rem;
  margin: 0 0 15px;
}

.start-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: .2s;
  background: url('@/assets/img_start_button.png');
  background-size: contain;
  width:250px;
  height: 267px;
}
.start-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity:0.5;
}
.start-btn:active{
  transform: scale(0.8);
  border: none;
  outline: none; 
}
.start-btn:focus, .start-btn:hover {
  outline: none;   /* 기본 포커스 라인 제거 */
  box-shadow: none; /* 혹시 남아있을 수 있는 그림자 제거 */
}
.cat-face { font-size: 1.3rem; }
</style>
