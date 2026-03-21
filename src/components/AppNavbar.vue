<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const scrolled = ref(false)

const isHome = computed(() => route.path === '/')

function onScroll() {
  scrolled.value = window.scrollY > 10
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const links = [
  { to: '/articles', label: '아티클' },
  { to: '/members', label: '멤버' },
]

function isActive(to: string): boolean {
  return route.path.startsWith(to)
}
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="[
      scrolled
        ? 'bg-bg-primary/95 backdrop-blur-lg border-b border-border-default'
        : isHome
          ? 'bg-transparent'
          : 'bg-bg-primary'
    ]"
  >
    <div class="max-w-[900px] mx-auto px-4 md:px-5 h-14 flex items-center justify-between">
      <router-link to="/" class="hover:opacity-80 transition-opacity leading-tight">
        <span class="block text-xs md:text-sm font-semibold text-text-primary tracking-tight">KHU LikeLion</span>
        <span class="block font-mono text-[9px] md:text-[10px] text-accent-primary/70 tracking-[0.2em] uppercase">Tech Blog</span>
      </router-link>

      <div class="flex items-center gap-1">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-md transition-colors"
          :class="isActive(link.to) ? 'text-text-primary' : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50'"
        >
          {{ link.label }}
        </router-link>
        <a
          href="https://github.com/likelion-khu-BE"
          target="_blank"
          rel="noopener"
          class="ml-1 p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
          aria-label="GitHub"
        >
          <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </a>
      </div>
    </div>
  </nav>
</template>
