import { Link, useLocation } from 'react-router-dom'
import { useScrollPosition } from '../../hooks/useScrollPosition'
import { useAuth } from '../../contexts/AuthContext'

const links = [
  { to: '/articles', label: '아티클' },
  { to: '/members', label: '멤버' },
  { to: '/sessions', label: '세션보드' },
]

export function AppNavbar() {
  const scrolled = useScrollPosition()
  const { pathname } = useLocation()
  const { isAuthenticated, logout, role } = useAuth()
  const isHome = pathname === '/'

  const bgClass = scrolled
    ? 'bg-bg-primary/95 backdrop-blur-lg border-b border-border-default'
    : isHome
      ? 'bg-transparent'
      : 'bg-bg-primary'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-[900px] mx-auto px-4 md:px-5 h-14 flex items-center justify-between">
        <Link to="/" className="hover:opacity-80 transition-opacity leading-tight">
          <span className="block text-xs md:text-sm font-semibold text-text-primary tracking-tight">KHU LikeLion</span>
          <span className="block font-mono text-[9px] md:text-[10px] text-accent-primary/70 tracking-[0.2em] uppercase">Tech Blog</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-md transition-colors ${
                pathname.startsWith(link.to)
                  ? 'text-text-primary'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-md transition-colors ${
                pathname.startsWith('/admin')
                  ? 'text-text-primary'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50'
              }`}
            >
              관리자
            </Link>
          )}
          <a
            href="https://github.com/likelion-khu-BE"
            target="_blank"
            rel="noopener"
            className="ml-1 p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
          {isAuthenticated ? (
            <>
              <Link
                to="/articles/write"
                className="ml-1 text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-md bg-accent-muted text-accent-secondary hover:bg-accent-primary hover:text-white transition-colors"
              >
                글쓰기
              </Link>
              <button
                onClick={() => logout()}
                className="ml-1 text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="ml-1 text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
