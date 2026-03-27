import { Link } from 'react-router-dom'
import { TorusScene } from '../components/three/TorusScene'

export default function NotFoundPage() {
  return (
    <main className="relative h-[80vh] flex items-center justify-center overflow-hidden pt-14">
      <div className="absolute inset-0 w-full h-full">
        <TorusScene />
      </div>

      <div className="relative z-10 text-center">
        <p className="font-mono text-5xl md:text-8xl font-bold text-text-primary/10 tracking-tighter">404</p>
        <p className="mt-4 text-sm text-text-secondary">이 페이지는 존재하지 않습니다.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 mt-6 text-sm text-text-tertiary hover:text-accent-primary transition-colors"
        >
          &larr; 홈으로
        </Link>
      </div>
    </main>
  )
}
