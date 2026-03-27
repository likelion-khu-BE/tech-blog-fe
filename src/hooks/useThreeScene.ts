import { useRef, useState, useEffect } from 'react'
import type * as THREE_NS from 'three'

interface ThreeSceneResult {
  scene: THREE_NS.Scene
  camera: THREE_NS.PerspectiveCamera
  animate: () => void
  dispose: () => void
}

type SetupFn = (
  THREE: typeof THREE_NS,
  canvas: HTMLCanvasElement,
) => ThreeSceneResult

export function useThreeScene(setup: SetupFn) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let raf = 0
    let renderer: THREE_NS.WebGLRenderer | null = null
    let disposeFn: (() => void) | null = null

    async function init() {
      const THREE = await import('three')
      if (!canvas) return

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      const { scene, camera, animate, dispose } = setup(THREE as typeof THREE_NS, canvas)
      disposeFn = dispose

      let lastW = 0
      let lastH = 0

      function loop() {
        const w = canvas!.clientWidth
        const h = canvas!.clientHeight
        if (w !== lastW || h !== lastH) {
          lastW = w
          lastH = h
          if (w > 0 && h > 0) {
            renderer!.setSize(w, h, false)
            camera.aspect = w / h
            camera.updateProjectionMatrix()
          }
        }
        animate()
        renderer!.render(scene, camera)
        raf = requestAnimationFrame(loop)
      }

      loop()
      setLoaded(true)
    }

    init()

    return () => {
      cancelAnimationFrame(raf)
      disposeFn?.()
      renderer?.dispose()
    }
  }, [setup])

  return { canvasRef, loaded }
}
