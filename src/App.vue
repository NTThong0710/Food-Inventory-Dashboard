<template>
  <!-- Intro Loader -->
  <Transition name="loader-fade">
    <div v-if="isLoading" class="intro-loader">
      <div class="loader-content">
        <div class="letter-container">
          <span
            v-for="(letter, i) in 'WELCOME'.split('')"
            :key="i"
            class="letter"
            :style="{ animationDelay: `${i * 0.08}s` }"
          >
            {{ letter }}
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
    </div>
  </Transition>
  
  <Toast/>

  <!-- Main App -->
  <div class="flex flex-col min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
    <TopNavbar v-if="!isStandalonePage" />
    <main class="flex-1 overflow-y-auto w-full relative">
      <div :class="isStandalonePage ? 'w-full min-h-full' : 'p-4 md:p-8 w-full max-w-7xl mx-auto'">
        <router-view />
      </div>
    </main>

    <!-- Chatbot Widget cho nhân viên -->
    <ChatbotWidget v-if="!isStandalonePage" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/features/auth/store';
import TopNavbar from '@/shared/components/layout/TopNavbar.vue';
import ChatbotWidget from '@/features/chatbot/components/ChatbotWidget.vue';
import Toast from 'primevue/toast';

const route = useRoute();
const authStore = useAuthStore();
const isStandalonePage = computed(() => ['/', '/login', '/forgot-password', '/update-password', '/menu', '/booking', '/c-auth', '/c-profile'].includes(route.path));

const isLoading = ref(true);

onMounted(() => {
  authStore.initAuthListener();
  
  // Tổng thời gian loading: letters animate (0.7s) + progress bar (1.2s) + buffer
  setTimeout(() => {
    isLoading.value = false;
  }, 2200);
});
</script>

<style>
:root, body {
  color-scheme: light dark;
}

.intro-loader {
  position: fixed;
  inset: 0;
  background: #0C160A;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.letter-container {
  display: flex;
  gap: 6px;
}

.letter {
  display: inline-block;
  font-size: 64px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #4ade80;
  opacity: 0;
  transform: translateY(30px);
  animation: letterIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes letterIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.progress-bar {
  width: 220px;
  height: 2px;
  background: rgba(74, 222, 128, 0.15);
  border-radius: 999px;
  overflow: hidden;
  opacity: 0;
  animation: fadeIn 0.3s 0.7s forwards;
}

.progress-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #22c55e, #86efac);
  border-radius: 999px;
  animation: progressFill 1.2s 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes progressFill {
  0%   { width: 0%; }
  60%  { width: 75%; }
  100% { width: 100%; }
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.loader-fade-leave-active {
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.loader-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>