import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { usePageTransition } from '../hooks/usePageTransition'
import { ArticleListItem } from '../components/article/ArticleListItem'
import { CategoryTabs } from '../components/article/CategoryTabs'
import { getPosts } from '../api/posts'
import { BOARDS, GENERATIONS } from '../types/post'
import type { PostSummary } from '../types/post'

const TABS = ['전체', ...BOARDS] as const
const PAGE_SIZE = 10

interface LocationState {
  authorId?: number
  authorLabel?: string
}

export default function ArticlesPage() {
  const visible = usePageTransition()
  const location = useLocation()
  const locState = (location.state ?? {}) as LocationState

  const [board, setBoard] = useState<string>('전체')
  const [generation, setGeneration] = useState<string>('')
  const [keyword, setKeyword] = useState<string>('')
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('')
  const [authorId, setAuthorId] = useState<number | null>(locState.authorId ?? null)
  const [authorLabel, setAuthorLabel] = useState<string>(locState.authorLabel ?? '')

  const [posts, setPosts] = useState<PostSummary[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [isLast, setIsLast] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestSeq = useRef(0)

  // keyword debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 300)
    return () => clearTimeout(t)
  }, [keyword])

  const fetchPosts = useCallback(async (
    params: { board: string; generation: string; authorId: number | null; keyword: string },
    nextPage: number,
    append: boolean,
  ) => {
    requestSeq.current += 1
    const seq = requestSeq.current
    try {
      const data = await getPosts({
        board: params.board === '전체' ? undefined : params.board,
        generation: params.generation || undefined,
        authorId: params.authorId ?? undefined,
        keyword: params.keyword || undefined,
        page: nextPage,
        size: PAGE_SIZE,
      })
      if (seq !== requestSeq.current) return
      setPosts(prev => append ? [...prev, ...data.content] : data.content)
      setTotalElements(data.totalElements)
      setIsLast(data.last)
      setPage(nextPage)
    } catch {
      if (seq !== requestSeq.current) return
      setError('게시글을 불러오지 못했습니다.')
    }
  }, [])

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    fetchPosts({ board, generation, authorId, keyword: debouncedKeyword }, 0, false)
      .finally(() => setIsLoading(false))
  }, [board, generation, authorId, debouncedKeyword, fetchPosts])

  async function handleLoadMore() {
    setIsLoadingMore(true)
    await fetchPosts({ board, generation, authorId, keyword: debouncedKeyword }, page + 1, true)
    setIsLoadingMore(false)
  }

  function handleBoardChange(b: string) {
    if (b === board) return
    setBoard(b)
    setPosts([])
  }

  function clearAuthorFilter() {
    setAuthorId(null)
    setAuthorLabel('')
  }

  return (
    <main className="max-w-[700px] mx-auto px-4 md:px-5 pt-14">
      <header className={`pt-14 md:pt-20 pb-8 transition-opacity duration-700 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-end justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight break-keep">
            엔지니어링 아티클
          </h1>
          <p className="text-xs text-text-tertiary tabular-nums">
            {isLoading ? '—' : `${totalElements}개의 아티클`}
          </p>
        </div>
        <p className="mt-2 text-sm text-text-secondary">"왜?"를 파고든 엔지니어링 기록</p>
      </header>

      {/* 검색창 */}
      <div className={`mb-4 transition-opacity duration-700 delay-100 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="제목, 내용 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder-text-tertiary/50 outline-none focus:border-border-hover transition-colors"
          />
          {keyword && (
            <button
              aria-label="검색어 지우기"
              onClick={() => setKeyword('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 게시판 탭 */}
      <CategoryTabs
        categories={TABS}
        active={board}
        onSelect={handleBoardChange}
        className={`transition-opacity duration-700 delay-150 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* 기수 필터 */}
      <div className={`flex items-center gap-1.5 mb-4 transition-opacity duration-700 delay-200 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {(['', ...GENERATIONS] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGeneration(g)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              generation === g
                ? 'border-accent-primary bg-accent-muted text-accent-secondary'
                : 'border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary'
            }`}
          >
            {g === '' ? '전체 기수' : g}
          </button>
        ))}
      </div>

      {/* 작성자 필터 배지 */}
      {authorId !== null && (
        <div className={`flex items-center gap-2 mb-4 transition-opacity duration-700 delay-200 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-xs text-text-tertiary">작성자 필터:</span>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent-muted text-accent-secondary border border-accent-primary/30">
            {authorLabel || `ID ${authorId}`}
            <button aria-label="작성자 필터 해제" onClick={clearAuthorFilter} className="hover:text-text-primary transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>
      )}

      <section className={`pb-16 transition-opacity duration-700 delay-300 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-5 h-5 border-2 border-border-default border-t-text-tertiary rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-text-tertiary">{error}</div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-tertiary">
            {keyword
              ? `"${keyword}"에 대한 검색 결과가 없습니다.`
              : '해당 카테고리의 아티클이 아직 없습니다.'}
          </div>
        ) : (
          <>
            <div>
              {posts.map((post) => (
                <ArticleListItem
                  key={post.id}
                  post={post}
                />
              ))}
            </div>

            {!isLast && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-2 text-sm text-text-tertiary border border-border-default rounded-lg hover:border-border-hover hover:text-text-secondary transition-colors disabled:opacity-40"
                >
                  {isLoadingMore ? '불러오는 중...' : '더 보기'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
