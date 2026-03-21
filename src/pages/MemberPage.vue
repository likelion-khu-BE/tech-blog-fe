<!-- 14기 멤버 상세 페이지 — 탐구 기록 + 관심 분야 + 작성 아티클 -->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findMember, members } from '../data/members'
import MemberAvatar from '../components/MemberAvatar.vue'
import { articles } from '../data/mock'
import { timeAgo } from '../utils/time'

const route = useRoute()
const router = useRouter()
const visible = ref(false)

onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
})

watch(() => route.params.id, () => {
  window.scrollTo(0, 0)
})

const member = computed(() => findMember(route.params.id as string))

const memberArticles = computed(() => {
  if (!member.value) return []
  return articles.filter((a) => member.value!.articles.includes(a.slug))
})

// 현재 멤버 제외, 셔플해서 4명
const otherMembers = computed(() => {
  if (!member.value) return []
  const others = members.filter((m) => m.id !== member.value!.id)
  return others.sort(() => Math.random() - 0.5).slice(0, 4)
})

</script>

<template>
  <main class="pt-14">

    <div v-if="!member" class="max-w-[700px] mx-auto px-4 md:px-5 py-32 text-center">
      <p class="text-text-tertiary text-sm">멤버를 찾을 수 없습니다.</p>
      <router-link to="/" class="text-accent-primary text-sm mt-4 inline-block">돌아가기</router-link>
    </div>

    <template v-else>

      <!-- Header -->
      <section
        class="relative max-w-[700px] mx-auto px-4 md:px-5 pt-12 md:pt-20 pb-12 transition-all duration-700 ease-out"
        :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <button
          class="text-xs text-text-tertiary hover:text-text-secondary transition-colors mb-8 cursor-pointer"
          @click="router.back()"
        >
          &larr; 뒤로
        </button>

        <div class="flex items-center gap-4 mb-2">
          <MemberAvatar :name="member.name" :avatar="member.avatar" size="lg" />
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
              {{ member.name }}
            </h1>
          <a
            :href="`https://github.com/${member.github}`"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent-primary transition-colors font-mono"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            {{ member.github }}
          </a>
          </div>
        </div>

        <p class="text-xs text-text-tertiary mb-6">{{ member.generation }}기 · {{ member.part }} · {{ member.department }}</p>

        <!-- Focus 태그 -->
        <div class="flex flex-wrap gap-1.5 mb-8">
          <span
            v-for="tag in member.studying"
            :key="tag"
            class="font-mono text-[11px] text-accent-secondary px-2 py-0.5 bg-accent-muted rounded"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Bio — 자기소개 -->
        <p class="text-base text-text-primary leading-relaxed break-keep">
          {{ member.bio }}
        </p>

        <!-- Message — 대외 메시지, bio 아래에 자연스럽게 -->
        <p class="mt-4 text-sm text-text-secondary leading-relaxed break-keep">
          "{{ member.message }}"
        </p>
      </section>

      <div class="max-w-[700px] mx-auto px-4 md:px-5"><div class="h-px bg-border-default" /></div>

      <!-- 탐구 기록 + 관심 분야 -->
      <section
        class="max-w-[700px] mx-auto px-4 md:px-5 py-12 md:py-16 transition-all duration-700 delay-100 ease-out"
        :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <h2 class="text-lg font-bold text-text-primary tracking-tight mb-8">탐구 기록</h2>

        <div class="divide-y divide-border-default">
          <div v-for="c in member.logs" :key="c.title" class="py-5 first:pt-0">
            <h3 class="text-sm font-medium text-text-primary">{{ c.title }}</h3>
            <p class="mt-1.5 text-sm text-text-secondary leading-relaxed break-keep">{{ c.description }}</p>
          </div>
        </div>

        <!-- 관심 분야: 기여 아래에 가볍게 -->
        <div class="mt-8">
          <p class="text-xs text-text-tertiary mb-3">관심 분야</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="interest in member.curious"
              :key="interest"
              class="text-xs text-text-secondary px-2.5 py-1 border border-border-default rounded-md"
            >
              {{ interest }}
            </span>
          </div>
        </div>
      </section>

      <!-- 작성한 아티클 -->
      <template v-if="memberArticles.length > 0">
        <div class="max-w-[700px] mx-auto px-4 md:px-5"><div class="h-px bg-border-default" /></div>

        <section
          class="max-w-[700px] mx-auto px-4 md:px-5 py-12 md:py-16 transition-all duration-700 delay-200 ease-out"
          :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          <h2 class="text-lg font-bold text-text-primary tracking-tight mb-6">작성한 아티클</h2>

          <router-link
            v-for="article in memberArticles"
            :key="article.slug"
            to="/articles"
            class="block py-4 border-b border-border-default group"
          >
            <h3 class="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors break-keep">
              {{ article.title }}
            </h3>
            <p class="mt-1 text-xs text-text-secondary break-keep line-clamp">
              {{ article.summary }}
            </p>
            <div class="mt-2 flex items-center gap-2 text-[11px] text-text-tertiary">
              <time class="tabular-nums">{{ timeAgo(article.date) }}</time>
              <span>&middot;</span>
              <span>{{ article.readingTime }}분</span>
            </div>
          </router-link>
        </section>
      </template>

      <div class="max-w-[700px] mx-auto px-4 md:px-5"><div class="h-px bg-border-default" /></div>

      <!-- 다른 멤버 -->
      <section class="max-w-[700px] mx-auto px-4 md:px-5 py-12 md:py-16">
        <p class="text-xs text-text-tertiary mb-4">다른 멤버</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <router-link
            v-for="m in otherMembers"
            :key="m.id"
            :to="`/members/${m.id}`"
            class="group flex items-center gap-3 p-3.5 bg-bg-secondary border border-border-default rounded-lg hover:border-border-hover transition-colors"
          >
            <MemberAvatar :name="m.name" :avatar="m.avatar" size="sm" />
            <div class="min-w-0">
              <p class="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{{ m.name }}</p>
              <p class="text-[11px] text-text-tertiary truncate">{{ m.studying[0] }}</p>
            </div>
          </router-link>
        </div>
      </section>

    </template>
  </main>
</template>

<style scoped>
.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
