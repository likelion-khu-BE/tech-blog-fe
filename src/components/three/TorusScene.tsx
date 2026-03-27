import { useCallback } from 'react'
import { ThreeCanvas } from './ThreeCanvas'
import type * as THREE_NS from 'three'

export function TorusScene({ className = '' }: { className?: string }) {
  const setup = useCallback((THREE: typeof THREE_NS, _canvas: HTMLCanvasElement) => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 5

    const geometry = new THREE.TorusGeometry(1.2, 0.4, 16, 40)
    const material = new THREE.MeshBasicMaterial({
      color: 0x8B5CF6,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    return {
      scene,
      camera,
      animate() {
        mesh.rotation.x += 0.003
        mesh.rotation.y += 0.005
      },
      dispose() {
        geometry.dispose()
        material.dispose()
      },
    }
  }, [])

  return <ThreeCanvas setup={setup} className={className} />
}
