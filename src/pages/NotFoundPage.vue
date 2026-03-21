<!-- 404 페이지 — 와이어프레임 토러스 3D + 홈으로 링크 -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loaded = ref(false)
let raf = 0
let renderer: any = null
let geometry: any = null
let material: any = null
let onResize: (() => void) | null = null

onMounted(async () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const THREE = await import('three')
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  geometry = new THREE.TorusGeometry(1.2, 0.4, 16, 40)
  material = new THREE.MeshBasicMaterial({
    color: 0x8B5CF6,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  loaded.value = true

  function animate() {
    mesh.rotation.x += 0.003
    mesh.rotation.y += 0.005
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
  <main class="relative h-[80vh] flex items-center justify-center overflow-hidden pt-14">
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full transition-opacity duration-1000"
      :class="loaded ? 'opacity-100' : 'opacity-0'"
    />

    <div class="relative z-10 text-center">
      <p class="font-mono text-5xl md:text-8xl font-bold text-text-primary/10 tracking-tighter">404</p>
      <p class="mt-4 text-sm text-text-secondary">이 페이지는 존재하지 않습니다.</p>
      <router-link
        to="/"
        class="inline-flex items-center gap-1.5 mt-6 text-sm text-text-tertiary hover:text-accent-primary transition-colors"
      >
        &larr; 홈으로
      </router-link>
    </div>
  </main>
</template>
