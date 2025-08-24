<template>
<transition name="fade" mode="out-in">
    <router-view />
  </transition>
</template>

<script setup>
// 아무 것도 필요 없음: 라우터에 따라 자동으로 컴포넌트 로드됨
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}
/* transition 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
