import { memo } from 'react'
import { getHashColor } from '../../utils/hash-color'
import type { AvatarSize } from '../../types'

interface Props {
  name: string
  avatar?: string
  size?: AvatarSize
  className?: string
  style?: React.CSSProperties
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
}

export const MemberAvatar = memo(function MemberAvatar({ name, avatar, size = 'sm', className = '', style }: Props) {
  const sizeClass = sizeMap[size]
  const imgSize = sizeClass.split(' ').slice(0, 2).join(' ')

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`rounded-full object-cover shrink-0 ${imgSize} ${className}`}
        loading="lazy"
        style={style}
      />
    )
  }

  const colorClass = getHashColor(name)
  const initial = name.charAt(0)

  return (
    <div className={`rounded-full shrink-0 flex items-center justify-center font-medium text-white/90 ${sizeClass} ${colorClass} ${className}`} style={style}>
      {initial}
    </div>
  )
})
