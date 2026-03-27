import { useCallback } from 'react'
import { ThreeCanvas } from './ThreeCanvas'
import type * as THREE_NS from 'three'

export function TorusKnotScene({ className = '' }: { className?: string }) {
  const setup = useCallback((THREE: typeof THREE_NS, _canvas: HTMLCanvasElement) => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 4.5

    const geometry = new THREE.TorusKnotGeometry(0.8, 0.3, 80, 16)
    const material = new THREE.MeshBasicMaterial({
      color: 0x8B5CF6,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    return {
      scene,
      camera,
      animate() {
        mesh.rotation.x += 0.001
        mesh.rotation.y += 0.002
      },
      dispose() {
        geometry.dispose()
        material.dispose()
      },
    }
  }, [])

  return <ThreeCanvas setup={setup} className={className} />
}
