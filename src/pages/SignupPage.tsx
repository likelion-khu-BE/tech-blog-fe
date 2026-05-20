import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { signup } from '../api/auth'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sessionType, setSessionType] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('이름을 입력해주세요')
      return
    }

    if (!sessionType) {
      setError('파트를 선택해주세요')
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다')
      return
    }

    setIsSubmitting(true)

    try {
      await signup({ email, password, name: name.trim(), sessionType })
      setIsSuccess(true)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response: { data?: { message?: string } } }).response
        setError(response.data?.message || '회원가입에 실패했습니다')
      } else {
        setError('서버에 연결할 수 없습니다')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-xl font-bold text-text-primary mb-3">
            가입 신청 완료
          </h1>
          <p className="text-text-secondary mb-6">
            관리자 승인 후 로그인할 수 있습니다.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 bg-accent-primary text-white rounded-lg
                       hover:bg-accent-secondary transition-colors"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-text-primary mb-8 text-center">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-text-secondary mb-1.5">
              이름
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-lg
                         text-text-primary placeholder-text-tertiary
                         focus:outline-none focus:border-accent-primary transition-colors"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-text-secondary mb-1.5">
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-lg
                         text-text-primary placeholder-text-tertiary
                         focus:outline-none focus:border-accent-primary transition-colors"
              placeholder="example@khu.ac.kr"
            />
          </div>

          <div>
            <label htmlFor="sessionType" className="block text-sm text-text-secondary mb-1.5">
              파트
            </label>
            <select
              id="sessionType"
              required
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-lg
                         text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
            >
              <option value="">파트를 선택하세요</option>
              <option value="backend">백엔드</option>
              <option value="frontend">프론트엔드</option>
              <option value="design">디자인</option>
              <option value="ai">AI</option>
              <option value="pm">PM</option>
              <option value="etc">기타</option>
            </select>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-text-secondary mb-1.5">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-lg
                         text-text-primary placeholder-text-tertiary
                         focus:outline-none focus:border-accent-primary transition-colors"
              placeholder="8자 이상"
            />
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm text-text-secondary mb-1.5">
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-lg
                         text-text-primary placeholder-text-tertiary
                         focus:outline-none focus:border-accent-primary transition-colors"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-accent-primary text-white rounded-lg font-medium
                       hover:bg-accent-secondary transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '가입 신청 중...' : '가입 신청'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-tertiary">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-accent-primary hover:text-accent-secondary">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
