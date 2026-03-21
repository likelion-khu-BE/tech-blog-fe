<!-- 아티클 목록 페이지 — 카테고리 필터 + NEW 뱃지(3일 이내, 쿠키 읽음 처리) -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { articles, categories } from '../data/mock'
import { findMember } from '../data/members'
import { timeAgo } from '../utils/time'
import MemberAvatar from '../components/MemberAvatar.vue'

const activeCategory = ref('전체')
const visible = ref(false)
const readSlugs = ref<Set<string>>(new Set())

onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
  const stored = document.cookie.match(/readArticles=([^;]+)/)
  if (stored) {
    stored[1].split(',').forEach((s) => readSlugs.value.add(s))
  }
})

function markAsRead(slug: string) {
  readSlugs.value.add(slug)
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `readArticles=${[...readSlugs.value].join(',')};expires=${expires};path=/`
}

function isNew(article: { slug: string; date: string }): boolean {
  if (readSlugs.value.has(article.slug)) return false
  return (Date.now() - new Date(article.date).getTime()) < 3 * 24 * 60 * 60 * 1000
}

const filteredArticles = computed(() => {
  if (activeCategory.value === '전체') return articles
  return articles.filter((a) => a.category === activeCategory.value)
})
</script>

<template>
  <main class="max-w-[700px] mx-auto px-4 md:px-5 pt-14">

    <!-- Header -->
    <header
      class="pt-14 md:pt-20 pb-8 transition-opacity duration-700 ease-out"
      :class="visible ? 'opacity-100' : 'opacity-0'"
    >
      <div class="flex items-end justify-between">
        <h1 class="text-2xl md:text-3xl font-bold text-text-primary tracking-tight break-keep">
          엔지니어링 아티클
        </h1>
        <p class="text-xs text-text-tertiary tabular-nums">{{ articles.length }}개의 아티클</p>
      </div>
      <p class="mt-2 text-sm text-text-secondary">"왜?"를 파고든 엔지니어링 기록</p>
    </header>

    <!-- Category tabs -->
    <nav
      class="flex gap-1 mb-2 overflow-x-auto scrollbar-hide transition-opacity duration-700 delay-200 ease-out"
      :class="visible ? 'opacity-100' : 'opacity-0'"
    >
      <button
        v-for="cat in categories"
        :key="cat"
        class="px-2.5 py-1.5 text-xs rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
        :class="
          activeCategory === cat
            ? 'text-text-primary bg-bg-tertiary'
            : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50'
        "
        @click="activeCategory = cat"
      >
        {{ cat }}
        <span v-if="cat !== '전체'" class="ml-0.5 text-text-tertiary/50">{{ articles.filter(a => a.category === cat).length }}</span>
      </button>
    </nav>

    <!-- Article list -->
    <section
      class="pb-16 transition-opacity duration-700 delay-300 ease-out"
      :class="visible ? 'opacity-100' : 'opacity-0'"
    >
      <TransitionGroup name="list" tag="div">
        <a
          v-for="article in filteredArticles"
          :key="article.slug"
          href="#"
          class="block py-5 border-b border-border-default group"
          @click="markAsRead(article.slug)"
        >
          <div class="flex items-center gap-2">
            <h3 class="text-sm md:text-base font-medium text-text-primary group-hover:text-accent-primary transition-colors break-keep leading-snug">
              {{ article.title }}
            </h3>
            <span
              v-if="isNew(article)"
              class="shrink-0 text-[10px] text-accent-primary/80"
            >NEW</span>
          </div>

          <p class="mt-1.5 text-sm text-text-secondary leading-relaxed break-keep line-clamp">
            {{ article.summary }}
          </p>

          <div class="mt-2.5 flex items-center gap-2 text-xs text-text-tertiary">
            <MemberAvatar :name="findMember(article.authorId)?.name ?? ''" :avatar="findMember(article.authorId)?.avatar" size="sm" class="!w-5 !h-5 !text-[9px]" />
            <span>{{ findMember(article.authorId)?.name }}</span>
            <span>&middot;</span>
            <span>{{ timeAgo(article.date) }}</span>
            <span>&middot;</span>
            <span class="inline-flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {{ article.readingTime }}분
            </span>
            <span class="ml-auto hidden sm:flex gap-1.5">
              <span v-for="tag in article.tags" :key="tag" class="font-mono px-1.5 py-0.5 bg-bg-tertiary rounded text-[10px]">{{ tag }}</span>
            </span>
          </div>
        </a>
      </TransitionGroup>

      <div v-if="filteredArticles.length === 0" class="py-16 text-center text-sm text-text-tertiary">
        해당 카테고리의 아티클이 아직 없습니다.
      </div>
    </section>

  </main>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.list-enter-active {
  transition: opacity 0.25s ease-out, transform 0.25s ease-out;
}
.list-leave-active {
  transition: opacity 0.15s ease-in;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.list-leave-to {
  opacity: 0;
}
</style>
