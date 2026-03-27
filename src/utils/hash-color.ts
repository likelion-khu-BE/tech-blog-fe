const colors = [
  'bg-[#5B21B6]', 'bg-[#1E40AF]', 'bg-[#065F46]',
  'bg-[#92400E]', 'bg-[#7C2D12]', 'bg-[#4C1D95]',
  'bg-[#1E3A5F]', 'bg-[#3730A3]', 'bg-[#6B21A8]',
  'bg-[#164E63]', 'bg-[#4338CA]', 'bg-[#0F766E]',
  'bg-[#7E22CE]',
]

export function getHashColor(name: string): string {
  let hash = 0
  for (const ch of name) {
    hash = ch.charCodeAt(0) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
