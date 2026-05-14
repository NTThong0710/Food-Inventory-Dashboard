import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(true)

  function initTheme() {
    isDark.value = true
    applyTheme()
  }

  function toggleTheme() {
    // Theme switching removed: stay in dark mode.
  }

  function applyTheme() {
    const html = document.documentElement
    html.classList.add('dark')
    html.classList.remove('light')
    localStorage.setItem('theme', 'dark')
  }

  watch(isDark, applyTheme)

  return { isDark, toggleTheme, initTheme }
})
