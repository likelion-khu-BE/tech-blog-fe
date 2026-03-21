<script setup lang="ts">
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <div class="min-h-screen bg-bg-primary font-sans">
    <AppNavbar />
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <AppFooter />
  </div>
</template>

<style>
.page-enter-active {
  transition: opacity 0.2s ease-out;
}
.page-leave-active {
  transition: opacity 0.15s ease-in;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
