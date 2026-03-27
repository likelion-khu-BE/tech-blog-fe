import { useCallback } from 'react'
import { usePageTransition } from '../hooks/usePageTransition'
import { useArticleReadStatus } from '../hooks/useArticleReadStatus'
import { useFilterState } from '../hooks/useFilterState'
import { ArticleListItem } from '../components/article/ArticleListItem'
import { CategoryTabs } from '../components/article/CategoryTabs'
import { articles, categories } from '../data/mock'
import type { Article } from '../types'

export default function ArticlesPage() {
  const visible = usePageTransition()
  const { isNew, markAsRead } = useArticleReadStatus()

  const filterFn = useCallback((item: Article, category: string) => item.category === category, [])
  const { active, setActive, filtered } = useFilterState(articles, categories, filterFn)

  return (
    <main className="max-w-[700px] mx-auto px-4 md:px-5 pt-14">
      <header className={`pt-14 md:pt-20 pb-8 transition-opacity duration-700 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-end justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight break-keep">
            엔지니어링 아티클
          </h1>
          <p className="text-xs text-text-tertiary tabular-nums">{articles.length}개의 아티클</p>
        </div>
        <p className="mt-2 text-sm text-text-secondary">"왜?"를 파고든 엔지니어링 기록</p>
      </header>

      <CategoryTabs
        categories={categories}
        active={active}
        onSelect={setActive}
        className={`transition-opacity duration-700 delay-200 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      <section className={`pb-16 transition-opacity duration-700 delay-300 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div>
          {filtered.map((article) => (
            <ArticleListItem
              key={article.slug}
              article={article}
              showNewBadge={isNew(article)}
              onClick={() => markAsRead(article.slug)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-text-tertiary">
            해당 카테고리의 아티클이 아직 없습니다.
          </div>
        )}
      </section>
    </main>
  )
}
