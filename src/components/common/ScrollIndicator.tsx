interface Props {
  visible: boolean
}

export function ScrollIndicator({ visible }: Props) {
  return (
    <div
      className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-1000 delay-[1500ms] ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-5 h-8 rounded-full border border-text-tertiary/40 flex justify-center pt-1.5">
        <div className="w-0.5 h-2 bg-text-tertiary/60 rounded-full animate-scroll-dot" />
      </div>
    </div>
  )
}
