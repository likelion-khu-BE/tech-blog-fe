import { useState, useEffect, useCallback } from 'react'
import { usePageTransition } from '../hooks/usePageTransition'
import { useArticleReadStatus } from '../hooks/useArticleReadStatus'
import { ArticleListItem } from '../components/article/ArticleListItem'
import { CategoryTabs } from '../components/article/CategoryTabs'
import { getPosts } from '../api/posts'
import { BOARDS } from '../types/post'
import type { PostSummary } from '../types/post'

const TABS = ['전체', ...BOARDS] as const
const PAGE_SIZE = 10

export default function ArticlesPage() {
  const visible = usePageTransition()
  const { isNew, markAsRead } = useArticleReadStatus()

  const [activeBoard, setActiveBoard] = useState<string>('전체')
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [isLast, setIsLast] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async (board: string, nextPage: number, append: boolean) => {
    try {
      const params = {
        board: board === '전체' ? undefined : board,
        page: nextPage,
        size: PAGE_SIZE,
      }
      const data = await getPosts(params)
      setPosts((prev) => append ? [...prev, ...data.content] : data.content)
      setTotalElements(data.totalElements)
      setIsLast(data.last)
      setPage(nextPage)
    } catch {
      setError('게시글을 불러오지 못했습니다.')
    }
  }, [])

  // 탭 변경 시 첫 페이지부터 다시 조회
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    fetchPosts(activeBoard, 0, false).finally(() => setIsLoading(false))
  }, [activeBoard, fetchPosts])

  async function handleLoadMore() {
    setIsLoadingMore(true)
    await fetchPosts(activeBoard, page + 1, true)
    setIsLoadingMore(false)
  }

  function handleTabChange(board: string) {
    if (board === activeBoard) return
    setActiveBoard(board)
    setPosts([])
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

      <CategoryTabs
        categories={TABS}
        active={activeBoard}
        onSelect={handleTabChange}
        className={`transition-opacity duration-700 delay-200 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      <section className={`pb-16 transition-opacity duration-700 delay-300 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-5 h-5 border-2 border-border-default border-t-text-tertiary rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-text-tertiary">{error}</div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-tertiary">
            해당 카테고리의 아티클이 아직 없습니다.
          </div>
        ) : (
          <>
            <div>
              {posts.map((post) => (
                <ArticleListItem
                  key={post.id}
                  post={post}
                  showNewBadge={isNew(post)}
                  onClick={() => markAsRead(post.id)}
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
