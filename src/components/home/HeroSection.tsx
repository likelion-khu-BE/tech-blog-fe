import { Link } from 'react-router-dom'
import { HeroScene } from '../three/HeroScene'
import { ScrollIndicator } from '../common/ScrollIndicator'

interface Props {
  canAnimate: boolean
  visible: boolean
}

const studyItems = [
  { q: '표면 너머를 본다', a: '하나를 고쳤더니 다른 곳이 깨집니다. 모든 설계에는 트레이드오프가 있고, 그걸 알고 선택하는 것과 모르고 선택하는 것은 다릅니다.' },
  { q: '직접 깨뜨려본다', a: '이론으로 아는 것과 손으로 확인한 것은 다릅니다. 직접 부딪히고, 실패하고, 원인을 찾는 과정에서 진짜 이해가 시작됩니다.' },
  { q: '서로의 코드를 읽는다', a: 'PR 코멘트 하나가 습관을 바꿔줍니다. 혼자였으면 몰랐을 것들을 리뷰에서 발견합니다. 가장 많이 배우는 시간은 다른 사람의 코드를 읽을 때입니다.' },
  { q: '아티클로 남긴다', a: '이해했다고 생각한 것을 쓰려니 설명할 수 없었습니다. 그 빈틈을 채우는 과정이 진짜 공부입니다.' },
]

function animClass(canAnimate: boolean, visible: boolean, delay: string, fromClass = 'opacity-0 translate-y-3') {
  if (!canAnimate) return ''
  return `transition-all duration-700 ease-out ${delay} ${visible ? 'opacity-100 translate-y-0 scale-100' : fromClass}`
}

function heroLightClass(canAnimate: boolean, n: number) {
  if (canAnimate) return ''
  return `hero-light hero-light-${n}`
}

export function HeroSection({ canAnimate, visible }: Props) {
  return (
    <section className="relative h-[100svh] flex items-center overflow-hidden">
      <div className="absolute top-0 right-0 w-full md:w-[55%] h-full z-0">
        <HeroScene />
      </div>
      <div className="absolute inset-0 z-[1] bg-bg-primary/70 md:bg-transparent md:bg-gradient-to-r md:from-bg-primary md:via-bg-primary/80 md:to-transparent" />

      <div className="relative z-10 max-w-[900px] w-full mx-auto px-4 md:px-5 text-center md:text-left">
        <p className={`text-sm text-text-tertiary tracking-tight mb-6 ${
          canAnimate ? animClass(canAnimate, visible, 'delay-200') : heroLightClass(canAnimate, 1)
        }`}>
          멋쟁이사자처럼 경희대학교 기술블로그
        </p>

        <h1 className={`text-2xl md:text-5xl font-bold text-text-primary tracking-tight leading-[1.2] break-keep ${
          canAnimate ? animClass(canAnimate, visible, 'delay-500', 'opacity-0 translate-y-4') : heroLightClass(canAnimate, 2)
        }`}>
          <span className={`text-accent-primary ${
            canAnimate
              ? `inline-block transition-all duration-700 ease-out delay-[900ms] ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`
              : heroLightClass(canAnimate, 3)
          }`}>"왜?"</span>를 파고드는<br />엔지니어링 기록
        </h1>

        <Link
          to="/articles"
          className={`inline-flex items-center gap-1.5 mt-10 md:mt-16 text-sm text-text-secondary hover:text-accent-primary group/cta ${
            canAnimate ? animClass(canAnimate, visible, 'delay-[1200ms]') : heroLightClass(canAnimate, 4)
          }`}
        >
          아티클 읽으러 가기
          <span className="inline-block transition-transform group-hover/cta:translate-x-1">&rarr;</span>
        </Link>
      </div>

      <ScrollIndicator visible={visible} />
    </section>
  )
}

export { studyItems }
