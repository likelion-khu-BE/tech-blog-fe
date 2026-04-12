import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import App from './App'

const HomePage = lazy(() => import('../pages/HomePage'))
const ArticlesPage = lazy(() => import('../pages/ArticlesPage'))
const GenerationsPage = lazy(() => import('../pages/GenerationsPage'))
const MemberPage = lazy(() => import('../pages/MemberPage'))
const LegacyMemberPage = lazy(() => import('../pages/LegacyMemberPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const SignupPage = lazy(() => import('../pages/SignupPage'))

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
      { path: 'members', element: <SuspenseWrapper><GenerationsPage /></SuspenseWrapper> },
      { path: 'members/:id', element: <SuspenseWrapper><MemberPage /></SuspenseWrapper> },
      { path: 'legacy/:id', element: <SuspenseWrapper><LegacyMemberPage /></SuspenseWrapper> },
      { path: 'login', element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
      { path: 'signup', element: <SuspenseWrapper><SignupPage /></SuspenseWrapper> },
      { path: '*', element: <SuspenseWrapper><NotFoundPage /></SuspenseWrapper> },
    ],
  },
])
