import { StrictMode, type CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { router } from './router'
import '../styles/style.css'

// 서비스 점검 모드. 점검이 끝나면 false 로 바꿔서 배포하면 평소 사이트로 복귀한다.
const MAINTENANCE_MODE = true

const keyframes = `
@keyframes mt-sweep {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(320%); }
}
`

const styles: Record<string, CSSProperties> = {
  root: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0A0A0B',
    color: '#EDEDEF',
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
    padding: '24px',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '-22%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '720px',
    height: '720px',
    maxWidth: '140vw',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, rgba(139, 92, 246, 0) 70%)',
    filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    textAlign: 'center',
    maxWidth: '460px',
    width: '100%',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(28px, 5vw, 40px)',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
    color: '#EDEDEF',
  },
  subtitle: {
    margin: '18px 0 0',
    fontSize: '15px',
    lineHeight: 1.75,
    color: '#8B8B93',
  },
  track: {
    position: 'relative',
    margin: '36px auto 0',
    width: '180px',
    height: '3px',
    borderRadius: '999px',
    background: '#1A1A1F',
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '38%',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg, rgba(139, 92, 246, 0) 0%, #8B5CF6 50%, rgba(139, 92, 246, 0) 100%)',
    animation: 'mt-sweep 1.6s ease-in-out infinite',
  },
  footer: {
    margin: '40px 0 0',
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '-0.01em',
    color: '#55555C',
  },
}

function MaintenanceScreen() {
  return (
    <div style={styles.root}>
      <style>{keyframes}</style>
      <div style={styles.glow} aria-hidden />
      <main style={styles.content}>
        <h1 style={styles.title}>
          잠시 서비스를
          <br />
          점검하고 있습니다
        </h1>
        <p style={styles.subtitle}>
          시스템을 더 안정적으로 다듬고 있어요.
          <br />
          잠시 후 다시 찾아와 주시면 평소처럼 이용하실 수 있습니다.
        </p>
        <div style={styles.track} aria-hidden>
          <div style={styles.bar} />
        </div>
        <div style={styles.footer}>멋쟁이사자처럼 경희대학교 기술블로그</div>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {MAINTENANCE_MODE ? (
      <MaintenanceScreen />
    ) : (
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    )}
  </StrictMode>,
)
