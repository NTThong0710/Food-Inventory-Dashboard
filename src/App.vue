<template>
  <div class="flex h-screen bg-[#0C160A] font-sans text-white overflow-hidden">
    <!-- Sidebar Application Layout -->
    <Sidebar />

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto w-full relative">
      <div class="p-4 md:p-8 w-full max-w-400 mx-auto">
        <!-- Router View replaces the hardcoded components -->
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/layout/Sidebar.vue';
</script>