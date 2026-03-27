import { useLocation, useOutlet } from 'react-router-dom'
import { AppNavbar } from '../components/layout/AppNavbar'
import { AppFooter } from '../components/layout/AppFooter'
import { PageTransition } from '../components/layout/PageTransition'

export default function App() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <div className="min-h-screen bg-bg-primary font-sans">
      <AppNavbar />
      <PageTransition locationKey={location.key}>
        {outlet}
      </PageTransition>
      <AppFooter />
    </div>
  )
}
