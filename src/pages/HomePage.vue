<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { articles } from '../data/mock'
import { timeAgo } from '../utils/time'
import { members, findMember } from '../data/members'
import HeroScene from '../components/HeroScene.vue'
import MemberAvatar from '../components/MemberAvatar.vue'

// 첫 방문 시 transition 대신 @keyframes 경량 애니메이션 사용
// 이유: 첫 방문에서 CSS/JS/폰트 동시 로드 시 transition 프레임 드롭 발생
const canAnimate = !!sessionStorage.getItem('visited')
const visible = ref(!canAnimate)
const sectionsVisible = ref<Record<string, boolean>>({})

onMounted(async () => {
  sessionStorage.setItem('visited', '1')
  if (canAnimate) {
    requestAnimationFrame(() => { visible.value = true })
  }
  await nextTick()
  setupObserver()
})

// 스크롤 진입 시 섹션별 fade-in 트리거
let observer: IntersectionObserver | null = null

function setupObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          sectionsVisible.value[entry.target.id] = true
        }
      })
    },
    { threshold: 0.1 }
  )
  document.querySelectorAll('[data-animate]').forEach((el) => {
    observer!.observe(el)
  })
}

onUnmounted(() => observer?.disconnect())

const recentArticles = articles.slice(0, 4)
</script>

<template>
  <main>

    <!-- 히어로: 100svh 풀스크린, 3D는 우측에 배치 -->
    <section class="relative h-[100svh] flex items-center overflow-hidden">
      <div class="absolute top-0 right-0 w-full md:w-[55%] h-full z-0">
        <HeroScene />
      </div>
      <!-- 모바일: 반투명 오버레이로 텍스트 가독성 확보 / 데스크탑: 좌→우 그라데이션 -->
      <div class="absolute inset-0 z-[1] bg-bg-primary/70 md:bg-transparent md:bg-gradient-to-r md:from-bg-primary md:via-bg-primary/80 md:to-transparent" />

      <!-- 모바일: text-center / 데스크탑: text-left -->
      <div class="relative z-10 max-w-[900px] w-full mx-auto px-4 md:px-5 text-center md:text-left">
        <p
          class="text-sm text-text-tertiary tracking-tight mb-6"
          :class="canAnimate
            ? [visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3', 'transition-all duration-700 ease-out delay-200']
            : 'hero-light hero-light-1'"
        >
          멋쟁이사자처럼 경희대학교 기술블로그
        </p>

        <h1
          class="text-2xl md:text-5xl font-bold text-text-primary tracking-tight leading-[1.2] break-keep"
          :class="canAnimate
            ? [visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4', 'transition-all duration-1000 ease-out delay-500']
            : 'hero-light hero-light-2'"
        >
          <span
            class="text-accent-primary"
            :class="canAnimate
              ? ['inline-block', visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90', 'transition-all duration-700 ease-out delay-[900ms]']
              : 'hero-light hero-light-3'"
          >"왜?"</span>를 파고드는<br />엔지니어링 기록
        </h1>

        <router-link
          to="/articles"
          class="inline-flex items-center gap-1.5 mt-10 md:mt-16 text-sm text-text-secondary hover:text-accent-primary group/cta"
          :class="canAnimate
            ? [visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3', 'transition-all duration-700 ease-out delay-[1200ms]']
            : 'hero-light hero-light-4'"
        >
          아티클 읽으러 가기
          <span class="inline-block transition-transform group-hover/cta:translate-x-1">&rarr;</span>
        </router-link>
      </div>

      <!-- 스크롤 유도 -->
      <div
        class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-1000 delay-[1500ms]"
        :class="visible ? 'opacity-100' : 'opacity-0'"
      >
        <div class="w-5 h-8 rounded-full border border-text-tertiary/40 flex justify-center pt-1.5">
          <div class="w-0.5 h-2 bg-text-tertiary/60 rounded-full animate-scroll-dot" />
        </div>
      </div>
    </section>

    <!-- 공부 방식: 2x2 그리드, bg-secondary로 시각 리듬 -->
    <section
      id="why"
      data-animate
      class="bg-bg-secondary transition-all duration-700 ease-out"
      :class="sectionsVisible['why'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
    >
      <div class="max-w-[900px] mx-auto px-4 md:px-5 py-14 md:py-28">
        <h2 class="text-lg md:text-xl font-bold text-text-primary tracking-tight mb-12">우리가 어떻게 공부하는가</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-16 md:gap-y-14">
          <div v-for="(item, idx) in [
            { q: '표면 너머를 본다', a: '하나를 고쳤더니 다른 곳이 깨집니다. 모든 설계에는 트레이드오프가 있고, 그걸 알고 선택하는 것과 모르고 선택하는 것은 다릅니다.' },
            { q: '직접 깨뜨려본다', a: '이론으로 아는 것과 손으로 확인한 것은 다릅니다. 직접 부딪히고, 실패하고, 원인을 찾는 과정에서 진짜 이해가 시작됩니다.' },
            { q: '서로의 코드를 읽는다', a: 'PR 코멘트 하나가 습관을 바꿔줍니다. 혼자였으면 몰랐을 것들을 리뷰에서 발견합니다. 가장 많이 배우는 시간은 다른 사람의 코드를 읽을 때입니다.' },
            { q: '아티클로 남긴다', a: '이해했다고 생각한 것을 쓰려니 설명할 수 없었습니다. 그 빈틈을 채우는 과정이 진짜 공부입니다.' },
          ]" :key="item.q">
            <!-- stagger: 각 항목이 120ms 간격으로 순차 등장 -->
            <div
              class="transition-all duration-500 ease-out"
              :class="sectionsVisible['why'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
              :style="{ transitionDelay: sectionsVisible['why'] ? `${idx * 120 + 100}ms` : '0ms' }"
            >
              <h3 class="text-base md:text-lg font-bold text-text-primary tracking-tight break-keep mb-3">{{ item.q }}</h3>
              <p class="text-sm text-text-secondary leading-relaxed break-keep">{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 멤버 넛지: 전체 리스트 대신 아바타로 존재감만, /members로 유도 -->
    <section
      id="team"
      data-animate
      class="max-w-[900px] mx-auto px-4 md:px-5 py-14 md:py-28 transition-all duration-700 ease-out"
      :class="sectionsVisible['team'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
    >
      <h2 class="text-lg md:text-xl font-bold text-text-primary tracking-tight">함께 공부하는 사람들</h2>
      <p class="text-sm text-text-tertiary mt-1">14기 · {{ members.length }}명</p>

      <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-6">
        <!-- 데스크탑: 아바타 겹침 + stagger -->
        <router-link to="/members" class="hidden sm:flex -space-x-2 hover:opacity-80 transition-opacity">
          <MemberAvatar
            v-for="(m, i) in members"
            :key="m.id"
            :name="m.name"
            :avatar="m.avatar"
            size="sm"
            class="ring-2 ring-bg-primary transition-all duration-300"
            :class="sectionsVisible['team'] ? 'opacity-100 scale-100' : 'opacity-0 scale-75'"
            :style="{ transitionDelay: sectionsVisible['team'] ? `${i * 40 + 200}ms` : '0ms' }"
          />
        </router-link>

        <!-- 모바일: 아바타가 넘치므로 우→좌 무한 스크롤 -->
        <router-link to="/members" class="sm:hidden block overflow-hidden">
          <div class="marquee-track flex gap-1.5">
            <MemberAvatar
              v-for="m in [...members, ...members]"
              :key="m.id + Math.random()"
              :name="m.name"
              :avatar="m.avatar"
              size="sm"
              class="ring-2 ring-bg-primary shrink-0"
            />
          </div>
        </router-link>

        <router-link
          to="/members"
          class="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-primary transition-colors group/cta"
        >
          14기 멤버 보러 가기
          <span class="inline-block transition-transform group-hover/cta:translate-x-1">&rarr;</span>
        </router-link>
      </div>
    </section>

    <!-- 최근 아티클: stagger로 순차 등장 -->
    <section
      id="articles"
      data-animate
      class="bg-bg-secondary transition-all duration-700 ease-out"
      :class="sectionsVisible['articles'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
    >
      <div class="max-w-[900px] mx-auto px-4 md:px-5 py-14 md:py-28">
        <div class="flex items-end justify-between mb-3">
          <h2 class="text-lg md:text-xl font-bold text-text-primary tracking-tight">엔지니어링 아티클</h2>
          <router-link to="/articles" class="text-xs text-text-tertiary hover:text-accent-primary transition-colors">
            전체 보기 &rarr;
          </router-link>
        </div>

        <div class="border-t border-border-default">
          <router-link
            v-for="(article, idx) in recentArticles"
            :key="article.slug"
            to="/articles"
            class="block py-5 border-b border-border-default group transition-all duration-500 ease-out"
            :class="sectionsVisible['articles'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
            :style="{ transitionDelay: sectionsVisible['articles'] ? `${idx * 80 + 200}ms` : '0ms' }"
          >
            <h3 class="text-sm md:text-base font-medium text-text-primary group-hover:text-accent-primary transition-colors break-keep leading-snug">
              {{ article.title }}
            </h3>
            <p class="mt-1.5 text-sm text-text-secondary leading-relaxed break-keep line-clamp">
              {{ article.summary }}
            </p>
            <div class="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
              <span>{{ findMember(article.authorId)?.name }}</span>
              <span>&middot;</span>
              <time class="tabular-nums">{{ timeAgo(article.date) }}</time>
              <span>&middot;</span>
              <span class="inline-flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                {{ article.readingTime }}분
              </span>
              <span class="ml-auto hidden sm:flex gap-1.5 font-mono text-[10px]">
                <span v-for="tag in article.tags" :key="tag">{{ tag }}</span>
              </span>
            </div>
          </router-link>
        </div>
      </div>
    </section>

  </main>
</template>

<style scoped>
/* 첫 방문용 경량 애니메이션 — @keyframes는 GPU에서 독립 실행되어 메인 스레드 부하에 강함 */
@keyframes hero-light-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.hero-light {
  opacity: 0;
  animation: hero-light-fade 0.4s ease-out forwards;
}

.hero-light-1 { animation-delay: 0.1s; }
.hero-light-2 { animation-delay: 0.2s; }
.hero-light-3 { animation-delay: 0.35s; }
.hero-light-4 { animation-delay: 0.5s; }

.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 모바일 아바타 무한 스크롤 — 멤버를 2벌 복제해서 끊김 없는 루프 */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee-track {
  animation: marquee 20s linear infinite;
}

/* 히어로 하단 스크롤 유도 dot */
@keyframes scroll-dot {
  0%, 100% { opacity: 0; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(4px); }
}

.animate-scroll-dot {
  animation: scroll-dot 1.8s ease-in-out infinite;
}
</style>
