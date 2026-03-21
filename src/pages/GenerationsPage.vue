<!-- 기수별 멤버 페이지 — 기수 탭 + 파트 필터(14기만) + 3D 토러스노트 배경 -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MemberAvatar from '../components/MemberAvatar.vue'
import { members } from '../data/members'
import { legacyMembers } from '../data/legacy-members'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const visible = ref(false)
const activeGen = ref(14)
const activePart = ref('전체')
let raf = 0
let renderer: any = null
let geometry: any = null
let material: any = null
let onResize: (() => void) | null = null

const gens = [14, 13, 12]
const parts = computed(() => {
  const unique = [...new Set(members.map((m) => m.part))]
  return ['전체', ...unique]
})
const filteredMembers = computed(() => {
  const list = activePart.value === '전체' ? members : members.filter((m) => m.part === activePart.value)
  return [...list].sort((a, b) => {
    if (a.role === 'lead' && b.role !== 'lead') return -1
    if (a.role !== 'lead' && b.role === 'lead') return 1
    return a.name.localeCompare(b.name, 'ko')
  })
})
const gen13 = legacyMembers.filter((m) => m.generation === 13)
const gen12 = legacyMembers.filter((m) => m.generation === 12)

onMounted(async () => {
  requestAnimationFrame(() => { visible.value = true })

  const canvas = canvasRef.value
  if (!canvas) return

  const THREE = await import('three')
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
  camera.position.z = 4.5

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  geometry = new THREE.TorusKnotGeometry(0.8, 0.3, 80, 16)
  material = new THREE.MeshBasicMaterial({
    color: 0x8B5CF6,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  function animate() {
    mesh.rotation.x += 0.001
    mesh.rotation.y += 0.002
    renderer.render(scene, camera)
    raf = requestAnimationFrame(animate)
  }
  animate()

  onResize = () => {
    if (!canvas || !renderer) return
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  }
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  if (onResize) window.removeEventListener('resize', onResize)
  renderer?.dispose()
  geometry?.dispose()
  material?.dispose()
})
</script>

<template>
  <main class="pt-14">

    <!-- Header with 3D -->
    <section
      class="relative max-w-[900px] mx-auto px-4 md:px-5 pt-14 md:pt-24 pb-8 transition-all duration-700 ease-out"
      :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    >
      <canvas
        ref="canvasRef"
        class="absolute right-0 top-0 w-[260px] h-[260px] pointer-events-none z-0 hidden md:block"
      />
      <div class="relative z-10">
        <p class="text-sm text-text-tertiary">멋쟁이사자처럼 경희대학교</p>
        <h1 class="text-2xl md:text-4xl font-bold text-text-primary tracking-tight mt-1">멤버</h1>
      </div>
    </section>

    <!-- 기수 탭 -->
    <div class="max-w-[900px] mx-auto px-4 md:px-5 mb-6">
      <nav class="flex items-center gap-1">
        <span class="text-[10px] text-text-tertiary/50 mr-1.5">기수</span>
        <button
          v-for="g in gens"
          :key="g"
          class="px-3 py-1.5 text-sm rounded-md transition-all duration-200 cursor-pointer"
          :class="
            activeGen === g
              ? 'text-text-primary bg-bg-tertiary'
              : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50'
          "
          @click="activeGen = g"
        >
          {{ g }}기
          <span v-if="g === 14" class="ml-1 text-[10px] text-accent-primary/80">현재</span>
        </button>
      </nav>

      <!-- 파트 필터 (14기에서만) -->
      <nav v-if="activeGen === 14" class="flex items-center gap-1 mt-3 overflow-x-auto scrollbar-hide">
        <span class="text-[10px] text-text-tertiary/50 mr-1.5 shrink-0">파트</span>
        <button
          v-for="p in parts"
          :key="p"
          class="px-2.5 py-1 text-xs rounded-md transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap"
          :class="
            activePart === p
              ? 'text-text-primary bg-bg-tertiary'
              : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50'
          "
          @click="activePart = p"
        >
          {{ p }}
        </button>
      </nav>
    </div>

    <!-- 멤버 리스트 -->
    <div class="max-w-[900px] mx-auto px-4 md:px-5 pb-20">

      <!-- 14기 -->
      <div v-if="activeGen === 14">
        <router-link
          v-for="m in filteredMembers"
          :key="m.id"
          :to="`/members/${m.id}`"
          class="group flex items-start gap-3 py-4 px-4 border-b border-border-default last:border-b-0 hover:bg-bg-secondary/50 transition-colors"
        >
          <MemberAvatar :name="m.name" :avatar="m.avatar" size="sm" class="mt-0.5" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{{ m.name }}</h3>
              <span class="text-[10px] text-text-tertiary">{{ m.part }}</span>
              <span v-if="m.role === 'lead'" class="text-[10px] text-accent-primary/80">파트장</span>
            </div>
            <p class="text-xs text-text-secondary break-keep leading-relaxed">{{ m.bio }}</p>
          </div>
          <p class="text-[11px] text-text-tertiary font-mono shrink-0 hidden sm:block whitespace-nowrap">
            {{ m.studying.join(' · ') }}
          </p>
        </router-link>
      </div>

      <!-- 13기 -->
      <div v-if="activeGen === 13">
        <router-link
          v-for="m in gen13"
          :key="m.id"
          :to="`/legacy/${m.id}`"
          class="group flex items-start gap-3 py-4 px-4 border-b border-border-default last:border-b-0 hover:bg-bg-secondary/50 transition-colors"
        >
          <MemberAvatar :name="m.name" size="sm" class="mt-0.5" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{{ m.name }}</h3>
              <span v-if="m.role === 'lead'" class="text-[10px] text-accent-primary/80">파트장</span>
              <span class="text-[10px] text-text-tertiary">{{ m.department }}</span>
            </div>
            <p class="text-xs text-text-secondary break-keep leading-relaxed">{{ m.bio }}</p>
          </div>
          <p class="text-[11px] text-text-tertiary font-mono shrink-0 hidden sm:block whitespace-nowrap">
            {{ m.focus }}
          </p>
        </router-link>
      </div>

      <!-- 12기 -->
      <div v-if="activeGen === 12">
        <router-link
          v-for="m in gen12"
          :key="m.id"
          :to="`/legacy/${m.id}`"
          class="group flex items-start gap-3 py-4 px-4 border-b border-border-default last:border-b-0 hover:bg-bg-secondary/50 transition-colors"
        >
          <MemberAvatar :name="m.name" size="sm" class="mt-0.5" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{{ m.name }}</h3>
              <span v-if="m.role === 'lead'" class="text-[10px] text-accent-primary/80">파트장</span>
              <span class="text-[10px] text-text-tertiary">{{ m.department }}</span>
            </div>
            <p class="text-xs text-text-secondary break-keep leading-relaxed">{{ m.bio }}</p>
          </div>
          <p class="text-[11px] text-text-tertiary font-mono shrink-0 hidden sm:block whitespace-nowrap">
            {{ m.focus }}
          </p>
        </router-link>
      </div>

    </div>

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
</style>
