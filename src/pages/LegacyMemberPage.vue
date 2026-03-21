<!-- 과거 기수 멤버(IT 대가) 상세 페이지 — 이스터에그 -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findLegacyMember, legacyMembers } from '../data/legacy-members'
import MemberAvatar from '../components/MemberAvatar.vue'

const route = useRoute()
const router = useRouter()
const visible = ref(false)

onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
})

const member = computed(() => findLegacyMember(route.params.id as string))

const otherMembers = computed(() => {
  if (!member.value) return []
  return legacyMembers
    .filter((m) => m.generation === member.value!.generation && m.id !== member.value!.id)
    .slice(0, 4)
})
</script>

<template>
  <main class="pt-14">

    <div v-if="!member" class="max-w-[700px] mx-auto px-4 md:px-5 py-32 text-center">
      <p class="text-text-tertiary text-sm">멤버를 찾을 수 없습니다.</p>
      <router-link to="/members" class="text-accent-primary text-sm mt-4 inline-block">역대 멤버로 돌아가기</router-link>
    </div>

    <template v-else>

      <section
        class="max-w-[700px] mx-auto px-4 md:px-5 pt-12 md:pt-20 pb-12 transition-all duration-700 ease-out"
        :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <button
          class="text-xs text-text-tertiary hover:text-text-secondary transition-colors mb-8 cursor-pointer"
          @click="router.back()"
        >
          &larr; 뒤로
        </button>

        <div class="flex items-center gap-4 mb-2">
          <MemberAvatar :name="member.name" size="lg" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h1 class="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">{{ member.name }}</h1>
              <span v-if="member.role === 'lead'" class="text-[11px] text-accent-primary/80 font-medium">파트장</span>
            </div>
            <p class="text-xs text-text-tertiary mt-0.5">{{ member.generation }}기 · {{ member.department }}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5 my-6">
          <span
            v-for="f in member.focus.split(' · ')"
            :key="f"
            class="font-mono text-[11px] text-accent-secondary px-2 py-0.5 bg-accent-muted rounded"
          >
            {{ f }}
          </span>
        </div>

        <p class="text-base text-text-primary leading-relaxed break-keep">{{ member.bio }}</p>

        <p class="mt-4 text-sm text-text-secondary leading-relaxed break-keep italic">
          "{{ member.message }}"
        </p>
      </section>

      <div class="max-w-[700px] mx-auto px-4 md:px-5"><div class="h-px bg-border-default" /></div>

      <section class="max-w-[700px] mx-auto px-4 md:px-5 py-12 md:py-16">
        <h2 class="text-lg font-bold text-text-primary tracking-tight mb-6">업적</h2>
        <ul class="space-y-3">
          <li v-for="a in member.achievements" :key="a" class="text-sm text-text-secondary leading-relaxed break-keep">
            {{ a }}
          </li>
        </ul>
      </section>

      <div class="max-w-[700px] mx-auto px-4 md:px-5"><div class="h-px bg-border-default" /></div>

      <section class="max-w-[700px] mx-auto px-4 md:px-5 py-12 md:py-16">
        <p class="text-xs text-text-tertiary mb-4">같은 기수</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <router-link
            v-for="m in otherMembers"
            :key="m.id"
            :to="`/legacy/${m.id}`"
            class="group flex items-center gap-3 p-3.5 bg-bg-secondary border border-border-default rounded-lg hover:border-border-hover transition-colors"
          >
            <MemberAvatar :name="m.name" size="sm" />
            <div class="min-w-0">
              <p class="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{{ m.name }}</p>
            </div>
          </router-link>
        </div>
      </section>

    </template>
  </main>
</template>
