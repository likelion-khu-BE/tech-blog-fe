<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loaded = ref(false)
let raf = 0
let renderer: any = null

onMounted(async () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const THREE = await import('three')
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.z = 4

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const geometry = new THREE.IcosahedronGeometry(1.2, 1)
  const material = new THREE.MeshBasicMaterial({
    color: 0x8B5CF6,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
  })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  const innerGeo = new THREE.IcosahedronGeometry(0.6, 0)
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xA78BFA,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  })
  const innerMesh = new THREE.Mesh(innerGeo, innerMat)
  scene.add(innerMesh)

  const particleCount = 60
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 6
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4
  }
  const particleGeo = new THREE.BufferGeometry()
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particleMat = new THREE.PointsMaterial({
    color: 0x8B5CF6,
    size: 0.015,
    transparent: true,
    opacity: 0.4,
  })
  const particles = new THREE.Points(particleGeo, particleMat)
  scene.add(particles)

  loaded.value = true

  let lastW = 0
  let lastH = 0

  function animate() {
    // 매 프레임 크기 체크 — CSS 크기와 renderer 동기화
    const w = canvas!.clientWidth
    const h = canvas!.clientHeight
    if (w !== lastW || h !== lastH) {
      lastW = w
      lastH = h
      if (w > 0 && h > 0) {
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
    }

    mesh.rotation.x += 0.002
    mesh.rotation.y += 0.003
    innerMesh.rotation.x -= 0.003
    innerMesh.rotation.y -= 0.002
    particles.rotation.y += 0.0005
    renderer.render(scene, camera)
    raf = requestAnimationFrame(animate)
  }

  animate()

  onUnmounted(() => {
    cancelAnimationFrame(raf)
    renderer?.dispose()
    geometry.dispose()
    material.dispose()
    innerGeo.dispose()
    innerMat.dispose()
    particleGeo.dispose()
    particleMat.dispose()
  })
})
</script>

<template>
  <div class="w-full h-full relative">
    <canvas
      ref="canvasRef"
      class="w-full h-full transition-opacity duration-1000"
      :class="loaded ? 'opacity-100' : 'opacity-0'"
    />
  </div>
</template>
