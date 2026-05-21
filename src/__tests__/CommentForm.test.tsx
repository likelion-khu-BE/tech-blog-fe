import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentForm } from '../components/comment/CommentForm'

type FormProps = React.ComponentProps<typeof CommentForm>

function renderForm(overrides: Partial<FormProps> = {}) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  render(<CommentForm onSubmit={onSubmit} {...overrides} />)
  return { onSubmit }
}

afterEach(() => vi.clearAllMocks())

// ─────────────────────────────────────────────────────────────
describe('CommentForm — 렌더링', () => {
  it('기본 플레이스홀더가 표시된다', () => {
    renderForm()
    expect(screen.getByPlaceholderText('댓글을 작성하세요')).toBeInTheDocument()
  })

  it('커스텀 placeholder가 표시된다', () => {
    renderForm({ placeholder: '답글을 작성하세요' })
    expect(screen.getByPlaceholderText('답글을 작성하세요')).toBeInTheDocument()
  })

  it('커스텀 submitLabel이 버튼에 표시된다', () => {
    renderForm({ submitLabel: '저장' })
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
  })

  it('onCancel 미제공 시 취소 버튼이 없다', () => {
    renderForm()
    expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument()
  })

  it('onCancel 제공 시 취소 버튼이 표시된다', () => {
    renderForm({ onCancel: vi.fn() })
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentForm — 유효성', () => {
  it('내용이 비면 등록 버튼이 비활성화된다', () => {
    renderForm()
    expect(screen.getByRole('button', { name: '등록' })).toBeDisabled()
  })

  it('내용 입력 시 등록 버튼이 활성화된다', async () => {
    renderForm()
    await userEvent.type(screen.getByRole('textbox'), '댓글 내용')
    expect(screen.getByRole('button', { name: '등록' })).toBeEnabled()
  })

  it('공백만 입력하면 등록 버튼이 비활성화된다', async () => {
    renderForm()
    await userEvent.type(screen.getByRole('textbox'), '   ')
    expect(screen.getByRole('button', { name: '등록' })).toBeDisabled()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentForm — 제출', () => {
  it('등록 버튼 클릭 시 trimmed 내용으로 onSubmit이 호출된다', async () => {
    const { onSubmit } = renderForm()
    await userEvent.type(screen.getByRole('textbox'), '  댓글 내용  ')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('댓글 내용'))
  })

  it('Ctrl+Enter로 제출된다', async () => {
    const { onSubmit } = renderForm()
    await userEvent.type(screen.getByRole('textbox'), '단축키 제출')
    await userEvent.keyboard('{Control>}{Enter}{/Control}')
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('단축키 제출'))
  })

  it('제출 후 textarea가 초기화된다', async () => {
    renderForm()
    const textarea = screen.getByRole('textbox')
    await userEvent.type(textarea, '내용')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))
    await waitFor(() => expect(textarea).toHaveValue(''))
  })

  it('제출 중 버튼 텍스트가 "등록 중..."으로 바뀌고 비활성화된다', async () => {
    let resolve!: () => void
    const onSubmit = vi.fn(() => new Promise<void>((r) => { resolve = r }))
    render(<CommentForm onSubmit={onSubmit} />)
    await userEvent.type(screen.getByRole('textbox'), '내용')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))
    expect(screen.getByRole('button', { name: '등록 중...' })).toBeDisabled()
    resolve()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentForm — 취소', () => {
  it('취소 버튼 클릭 시 onCancel이 호출된다', async () => {
    const onCancel = vi.fn()
    renderForm({ onCancel })
    await userEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
