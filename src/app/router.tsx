import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import App from './App'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

const HomePage = lazy(() => import('../pages/HomePage'))
const ArticlesPage = lazy(() => import('../pages/ArticlesPage'))
const ArticleDetailPage = lazy(() => import('../pages/ArticleDetailPage'))
const ArticleWritePage = lazy(() => import('../pages/ArticleWritePage'))
const GenerationsPage = lazy(() => import('../pages/GenerationsPage'))
const MemberPage = lazy(() => import('../pages/MemberPage'))
const LegacyMemberPage = lazy(() => import('../pages/LegacyMemberPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const SignupPage = lazy(() => import('../pages/SignupPage'))
const SessionBoardPage = lazy(() => import('../pages/SessionBoardPage'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <SuspenseWrapper><HomePage /></SuspenseWrapper> },
      { path: 'articles', element: <SuspenseWrapper><ArticlesPage /></SuspenseWrapper> },
      { path: 'articles/write', element: <SuspenseWrapper><ProtectedRoute><ArticleWritePage /></ProtectedRoute></SuspenseWrapper> },
      { path: 'articles/:slug', element: <SuspenseWrapper><ArticleDetailPage /></SuspenseWrapper> },
      { path: 'members', element: <SuspenseWrapper><GenerationsPage /></SuspenseWrapper> },
      { path: 'members/:id', element: <SuspenseWrapper><MemberPage /></SuspenseWrapper> },
      { path: 'legacy/:id', element: <SuspenseWrapper><LegacyMemberPage /></SuspenseWrapper> },
      { path: 'sessions', element: <SuspenseWrapper><SessionBoardPage /></SuspenseWrapper> },
      { path: 'login', element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
      { path: 'signup', element: <SuspenseWrapper><SignupPage /></SuspenseWrapper> },
      { path: '*', element: <SuspenseWrapper><NotFoundPage /></SuspenseWrapper> },
    ],
  },
])
