import { useCallback } from 'react'
import { ThreeCanvas } from './ThreeCanvas'
import type * as THREE_NS from 'three'

export function HeroScene() {
  const setup = useCallback((THREE: typeof THREE_NS, _canvas: HTMLCanvasElement) => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 4

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

    return {
      scene,
      camera,
      animate() {
        mesh.rotation.x += 0.002
        mesh.rotation.y += 0.003
        innerMesh.rotation.x -= 0.003
        innerMesh.rotation.y -= 0.002
        particles.rotation.y += 0.0005
      },
      dispose() {
        geometry.dispose()
        material.dispose()
        innerGeo.dispose()
        innerMat.dispose()
        particleGeo.dispose()
        particleMat.dispose()
      },
    }
  }, [])

  return <ThreeCanvas setup={setup} />
}
