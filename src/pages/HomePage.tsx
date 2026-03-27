import { useFirstVisit } from '../hooks/useFirstVisit'
import { usePageTransition } from '../hooks/usePageTransition'
import { HeroSection } from '../components/home/HeroSection'
import { StudyMethodSection } from '../components/home/StudyMethodSection'
import { MemberNudgeSection } from '../components/home/MemberNudgeSection'
import { RecentArticlesSection } from '../components/home/RecentArticlesSection'

export default function HomePage() {
  const { canAnimate } = useFirstVisit()
  const visible = usePageTransition()

  return (
    <main>
      <HeroSection canAnimate={canAnimate} visible={canAnimate ? visible : true} />
      <StudyMethodSection />
      <MemberNudgeSection />
      <RecentArticlesSection />
    </main>
  )
}
