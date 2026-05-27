import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryTabs } from '../components/article/CategoryTabs'

const TABS = ['전체', '백엔드', '프론트엔드', 'AI/ML'] as const

function renderTabs(active = '전체', onSelect = vi.fn()) {
  render(<CategoryTabs categories={TABS} active={active} onSelect={onSelect} />)
  return { onSelect }
}

// ─────────────────────────────────────────────────────────────
describe('CategoryTabs — 렌더링', () => {
  it('모든 탭 버튼이 렌더링된다', () => {
    renderTabs()
    for (const tab of TABS) {
      expect(screen.getByRole('button', { name: tab })).toBeInTheDocument()
    }
  })
})

// ─────────────────────────────────────────────────────────────
describe('CategoryTabs — 선택', () => {
  it('탭 클릭 시 onSelect가 해당 값으로 호출된다', async () => {
    const { onSelect } = renderTabs()
    await userEvent.click(screen.getByRole('button', { name: '백엔드' }))
    expect(onSelect).toHaveBeenCalledWith('백엔드')
  })

  it('active 탭과 비활성 탭은 서로 다른 클래스를 갖는다', () => {
    renderTabs('백엔드')
    const activeBtn = screen.getByRole('button', { name: '백엔드' })
    const inactiveBtn = screen.getByRole('button', { name: '전체' })
    expect(activeBtn.className).not.toBe(inactiveBtn.className)
  })

  it('각 탭 클릭마다 각각의 값으로 onSelect가 호출된다', async () => {
    const onSelect = vi.fn()
    renderTabs('전체', onSelect)
    await userEvent.click(screen.getByRole('button', { name: '프론트엔드' }))
    await userEvent.click(screen.getByRole('button', { name: 'AI/ML' }))
    expect(onSelect).toHaveBeenNthCalledWith(1, '프론트엔드')
    expect(onSelect).toHaveBeenNthCalledWith(2, 'AI/ML')
  })
})
