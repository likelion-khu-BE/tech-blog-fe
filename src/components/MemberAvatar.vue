<!--
  멤버 아바타 컴포넌트
  avatar URL이 있으면 이미지, 없으면 이름 첫 글자 이니셜 원형 표시
  색상은 이름 해시 기반으로 고정 — 같은 사람은 항상 같은 색
-->
<script setup lang="ts">
const props = defineProps<{
  name: string
  avatar?: string
  size?: 'sm' | 'md' | 'lg'
}>()

const initial = props.name.charAt(0)

// 이름 기반 고정 색상 (같은 이름이면 항상 같은 색)
const colors = [
  'bg-[#5B21B6]', 'bg-[#1E40AF]', 'bg-[#065F46]',
  'bg-[#92400E]', 'bg-[#7C2D12]', 'bg-[#4C1D95]',
  'bg-[#1E3A5F]', 'bg-[#3730A3]', 'bg-[#6B21A8]',
  'bg-[#164E63]', 'bg-[#4338CA]', 'bg-[#0F766E]',
  'bg-[#7E22CE]',
]

let hash = 0
for (const ch of props.name) {
  hash = ch.charCodeAt(0) + ((hash << 5) - hash)
}
const colorClass = colors[Math.abs(hash) % colors.length]

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
}

const sizeClass = sizeClasses[props.size ?? 'sm']
</script>

<template>
  <img
    v-if="avatar"
    :src="avatar"
    :alt="name"
    class="rounded-full object-cover shrink-0"
    :class="sizeClass.split(' ').slice(0, 2).join(' ')"
    loading="lazy"
  />
  <div
    v-else
    class="rounded-full shrink-0 flex items-center justify-center font-medium text-white/90"
    :class="[sizeClass, colorClass]"
  >
    {{ initial }}
  </div>
</template>
