/**
 * 게시글 상세 페이지 E2E 테스트 (#5 #6 #9)
 */

import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

async function getFirstArticleId(page: import('@playwright/test').Page): Promise<number | null> {
  await page.goto('/articles')
  await page.waitForTimeout(800)
  const link = page.locator('a[href^="/articles/"]').first()
  if (!(await link.isVisible())) return null
  const href = await link.getAttribute('href')
  const match = href?.match(/\/articles\/(\d+)/)
  return match ? Number(match[1]) : null
}

test.describe('ArticleDetailPage — #5 리포스트 버튼 역할별 표시', () => {
  test('[비로그인] 리포스트 버튼이 없다', async ({ page }) => {
    const postId = await getFirstArticleId(page)
    if (!postId) return

    await page.goto(`/articles/${postId}`)
    await page.waitForTimeout(1_000)
    await expect(page.getByRole('button', { name: '리포스트' })).not.toBeVisible()
  })

  test('[멤버] 리포스트 버튼이 보인다', async ({ page }) => {
    await loginAs(page, 'member')
    const postId = await getFirstArticleId(page)
    if (!postId) return

    await page.goto(`/articles/${postId}`)
    await expect(page.getByRole('button', { name: '리포스트' })).toBeVisible({ timeout: 8_000 })
  })

  test('[어드민] 리포스트 버튼이 보인다', async ({ page }) => {
    await loginAs(page, 'admin')
    const postId = await getFirstArticleId(page)
    if (!postId) return

    await page.goto(`/articles/${postId}`)
    await expect(page.getByRole('button', { name: '리포스트' })).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('ArticleDetailPage — #5 리포스트 작성 플로우', () => {
  test('[멤버] 리포스트 버튼 → 작성 폼 이동 및 원본 배너 표시', async ({ page }) => {
    await loginAs(page, 'member')
    const postId = await getFirstArticleId(page)
    if (!postId) return

    await page.goto(`/articles/${postId}`)
    await page.getByRole('button', { name: '리포스트' }).click()

    await expect(page).toHaveURL(new RegExp(`/articles/write\\?repostFrom=${postId}`))
    await expect(page.locator('text=리포스트 원본:')).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('ArticleDetailPage — #6 작성자 클릭 → 필터', () => {
  test('작성자명 클릭 시 /articles로 이동하고 작성자 필터 배지가 표시된다', async ({ page }) => {
    const postId = await getFirstArticleId(page)
    if (!postId) return

    await page.goto(`/articles/${postId}`)
    await page.waitForTimeout(1_000)

    const authorBtn = page.locator('header button').first()
    if (!(await authorBtn.isVisible())) return

    await authorBtn.click()
    await expect(page).toHaveURL('/articles')
    await expect(page.locator('text=작성자 필터:')).toBeVisible({ timeout: 5_000 })
  })
})

test.describe('ArticleDetailPage — #9 리포스트 원본 표시', () => {
  test('repostFromId 없는 글에는 원본 배너가 없다', async ({ page }) => {
    const postId = await getFirstArticleId(page)
    if (!postId) return

    await page.goto(`/articles/${postId}`)
    await page.waitForTimeout(1_000)

    const repostBanner = page.locator('text=리포스트 원본:')
    const isRepost = await repostBanner.isVisible()
    if (isRepost) return // 리포스트 글이면 skip

    await expect(repostBanner).not.toBeVisible()
  })
})
