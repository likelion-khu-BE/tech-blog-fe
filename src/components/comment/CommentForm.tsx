import { useState, useRef, useEffect } from 'react'

interface Props {
  initialValue?: string
  placeholder?: string
  submitLabel?: string
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
  autoFocus?: boolean
}

export function CommentForm({
  initialValue = '',
  placeholder = '댓글을 작성하세요',
  submitLabel = '등록',
  onSubmit,
  onCancel,
  autoFocus = false,
}: Props) {
  const [content, setContent] = useState(initialValue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus])

  async function handleSubmit() {
    const trimmed = content.trim()
    if (!trimmed || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onSubmit(trimmed)
      setContent('')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-lg text-sm text-text-primary placeholder-text-tertiary/50 focus:outline-none focus:border-accent-primary transition-colors resize-none"
      />
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs px-3 py-1.5 text-text-tertiary hover:text-text-primary transition-colors"
          >
            취소
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="text-xs px-4 py-1.5 bg-accent-primary hover:bg-accent-secondary disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {isSubmitting ? '등록 중...' : submitLabel}
        </button>
      </div>
    </div>
  )
}
