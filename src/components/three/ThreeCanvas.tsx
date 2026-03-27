import { useThreeScene } from '../../hooks/useThreeScene'
import type * as THREE_NS from 'three'

interface ThreeSceneResult {
  scene: THREE_NS.Scene
  camera: THREE_NS.PerspectiveCamera
  animate: () => void
  dispose: () => void
}

interface Props {
  setup: (THREE: typeof THREE_NS, canvas: HTMLCanvasElement) => ThreeSceneResult
  className?: string
}

export function ThreeCanvas({ setup, className = '' }: Props) {
  const { canvasRef, loaded } = useThreeScene(setup)

  return (
    <div className={`w-full h-full relative ${className}`}>
      <canvas
        ref={canvasRef}
        className={`w-full h-full transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
