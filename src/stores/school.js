import { defineStore } from 'pinia'

export const useSchoolStore = defineStore('school', {
  state: () => ({
    schoolName: '',
    characterType: null // 'cat' | 'teacher' | null
  }),
  getters: {
    isValidName: s => s.schoolName.length >= 1 && s.schoolName.length <= 10
  },
  actions: {
    setSchoolName(name) {
      this.schoolName = name.trim()
    },
    setCharacter(type) {
      this.characterType = type
    },
    reset() {
      this.schoolName = ''
      this.characterType = null
    }
  },
  persist: {
    enabled: true,
    strategies: [{ key: 'school', storage: localStorage }]
  }
})
