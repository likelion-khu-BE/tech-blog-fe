<!-- 푸터 — 제작 크레딧 (팀별 구분, 이름 클릭 시 멤버 상세로 이동) -->
<script setup lang="ts">
import { members } from '../data/members'

function memberId(name: string): string {
  return members.find((m) => m.name === name)?.id ?? ''
}

const teams = [
  { label: '백엔드', team: '콘텐츠 팀', names: ['김주연', '박현아', '심아현', '윤빈'] },
  { label: '백엔드', team: '유저 팀', names: ['김예빈', '안시현', '윤선재', '한예진'] },
  { label: '백엔드', team: '인프라 팀', names: ['박세인', '신선우', '임근엽', '장찬욱'] },
]
</script>

<template>
  <footer class="mt-16">
    <div class="max-w-[900px] mx-auto px-4 md:px-5 py-10 md:py-12">

      <!-- 상단: 로고 + 아이콘 -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <p class="text-sm font-semibold text-text-primary tracking-tight">KHU LikeLion</p>
          <p class="text-[11px] text-text-tertiary mt-0.5">멋쟁이사자처럼 경희대학교</p>
        </div>
        <a href="https://github.com/likelion-khu-BE" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          likelion-khu-BE
        </a>
      </div>

      <!-- 크레딧: 데스크탑 (팀별 그리드) -->
      <div class="border-t border-border-default pt-6 hidden md:block">
        <p class="text-[10px] text-accent-primary/40 uppercase tracking-widest mb-4">Built by</p>
        <div class="grid grid-cols-4 gap-4 text-[11px]">
          <div v-for="t in teams" :key="t.team">
            <p class="text-accent-primary/40 mb-1.5"><span class="text-accent-primary/60 font-medium">{{ t.label }}</span> · {{ t.team }}</p>
            <p class="leading-loose">
              <template v-for="(name, i) in t.names" :key="name">
                <router-link
                  :to="`/members/${memberId(name)}`"
                  class="text-text-tertiary/70 hover:text-accent-primary transition-colors"
                >{{ name }}</router-link>
                <span v-if="i < t.names.length - 1" class="text-text-tertiary/40"> · </span>
              </template>
            </p>
          </div>
          <div>
            <p class="text-text-tertiary/50 mb-1.5"><span class="text-accent-primary/60 font-medium">프론트엔드 · 디자인</span></p>
            <p>
              <router-link
                :to="`/members/${memberId('김우진')}`"
                class="text-text-tertiary/70 hover:text-accent-primary transition-colors"
              >김우진</router-link>
            </p>
          </div>
        </div>
        <p class="mt-6 text-[10px] text-text-tertiary/30">&copy; {{ new Date().getFullYear() }} KHU LikeLion</p>
      </div>

      <!-- 크레딧: 모바일 (2컬럼 압축) -->
      <div class="border-t border-border-default pt-6 md:hidden">
        <p class="text-[10px] text-accent-primary/40 uppercase tracking-widest mb-3">Built by</p>
        <div class="grid grid-cols-2 gap-3 text-[11px]">
          <div v-for="t in teams" :key="t.team">
            <p class="text-accent-primary/40 mb-1"><span class="text-accent-primary/60 font-medium">{{ t.label }}</span> · {{ t.team }}</p>
            <p class="text-text-tertiary/60">
              <template v-for="(name, i) in t.names" :key="name">
                <router-link :to="`/members/${memberId(name)}`" class="text-text-tertiary/70 hover:text-accent-primary transition-colors">{{ name }}</router-link>
                <span v-if="i < t.names.length - 1" class="text-text-tertiary/40"> · </span>
              </template>
            </p>
          </div>
          <div>
            <p class="text-text-tertiary/50 mb-1"><span class="text-accent-primary/60 font-medium">프론트엔드 · 디자인</span></p>
            <p><router-link :to="`/members/${memberId('김우진')}`" class="text-text-tertiary/70 hover:text-accent-primary transition-colors">김우진</router-link></p>
          </div>
        </div>
        <p class="mt-4 text-[10px] text-text-tertiary/30">&copy; {{ new Date().getFullYear() }} KHU LikeLion</p>
      </div>

    </div>
  </footer>
</template>
