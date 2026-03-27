import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

const items = [
  { q: '표면 너머를 본다', a: '하나를 고쳤더니 다른 곳이 깨집니다. 모든 설계에는 트레이드오프가 있고, 그걸 알고 선택하는 것과 모르고 선택하는 것은 다릅니다.' },
  { q: '직접 깨뜨려본다', a: '이론으로 아는 것과 손으로 확인한 것은 다릅니다. 직접 부딪히고, 실패하고, 원인을 찾는 과정에서 진짜 이해가 시작됩니다.' },
  { q: '서로의 코드를 읽는다', a: 'PR 코멘트 하나가 습관을 바꿔줍니다. 혼자였으면 몰랐을 것들을 리뷰에서 발견합니다. 가장 많이 배우는 시간은 다른 사람의 코드를 읽을 때입니다.' },
  { q: '아티클로 남긴다', a: '이해했다고 생각한 것을 쓰려니 설명할 수 없었습니다. 그 빈틈을 채우는 과정이 진짜 공부입니다.' },
]

export function StudyMethodSection() {
  const { ref, isVisible } = useIntersectionObserver()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`bg-bg-secondary transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="max-w-[900px] mx-auto px-4 md:px-5 py-14 md:py-28">
        <h2 className="text-lg md:text-xl font-bold text-text-primary tracking-tight mb-12">우리가 어떻게 공부하는가</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-16 md:gap-y-14">
          {items.map((item, idx) => (
            <div
              key={item.q}
              className={`transition-all duration-500 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: isVisible ? `${idx * 120 + 100}ms` : '0ms' }}
            >
              <h3 className="text-base md:text-lg font-bold text-text-primary tracking-tight break-keep mb-3">{item.q}</h3>
              <p className="text-sm text-text-secondary leading-relaxed break-keep">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
