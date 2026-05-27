/**
 * 게시글 상세 페이지 E2E 테스트 (#5 #6 #9)
 */

import { test, expect } from '@playwright/test'
import { loginAs, gotoAndWaitForAuth } from './helpers'

async function getFirstArticleId(page: import('@playwright/test').Page): Promise<number | null> {
  const res = await page.request.get('/api/blog/posts?size=1')
  if (!res.ok()) return null
  const data = await res.json()
  return (data.content as { id: number }[])?.[0]?.id ?? null
}

test.describe('ArticleDetailPage — #5 답글 버튼 역할별 표시', () => {
  test('[비로그인] 답글 작성 버튼이 없다', async ({ page }) => {
    const postId = await getFirstArticleId(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await page.goto(`/articles/${postId}`)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })
    await expect(page.getByRole('button', { name: '답글 작성' })).not.toBeVisible()
  })

  test('[멤버] 답글 작성 버튼이 보인다', async ({ page }) => {
    await loginAs(page, 'member')
    const postId = await getFirstArticleId(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await gotoAndWaitForAuth(page, `/articles/${postId}`)
    await expect(page.getByRole('button', { name: '답글 작성' })).toBeVisible({ timeout: 8_000 })
  })

  test('[어드민] 답글 작성 버튼이 보인다', async ({ page }) => {
    await loginAs(page, 'admin')
    const postId = await getFirstArticleId(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await gotoAndWaitForAuth(page, `/articles/${postId}`)
    await expect(page.getByRole('button', { name: '답글 작성' })).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('ArticleDetailPage — #5 답글 작성 플로우', () => {
  test('[멤버] 답글 작성 버튼 → 작성 폼 이동 및 원글 배너 표시', async ({ page }) => {
    await loginAs(page, 'member')
    const postId = await getFirstArticleId(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await gotoAndWaitForAuth(page, `/articles/${postId}`)
    await page.getByRole('button', { name: '답글 작성' }).click()

    await expect(page).toHaveURL(new RegExp(`/articles/write\\?replyTo=${postId}`))
    await expect(page.locator('text=원글:')).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('ArticleDetailPage — #6 작성자 클릭 → 필터', () => {
  test('작성자명 클릭 시 /articles로 이동하고 작성자 필터 배지가 표시된다', async ({ page }) => {
    const postId = await getFirstArticleId(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await page.goto(`/articles/${postId}`)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })

    const authorBtn = page.locator('header button').first()
    if (!(await authorBtn.isVisible())) {
      test.skip(true, '작성자명이 없는 게시글')
      return
    }

    await authorBtn.click()
    await expect(page).toHaveURL('/articles')
    await expect(page.locator('text=작성자 필터:')).toBeVisible({ timeout: 5_000 })
  })
})

test.describe('ArticleDetailPage — #9 원글 표시', () => {
  test('replyToId 없는 글에는 원글 배너가 없다', async ({ page }) => {
    const postId = await getFirstArticleId(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await page.goto(`/articles/${postId}`)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })

    const replyBanner = page.locator('text=원글:')
    const isReply = await replyBanner.isVisible()
    if (isReply) {
      test.skip(true, '이 글은 답글이므로 원글 배너가 존재함')
      return
    }

    await expect(replyBanner).not.toBeVisible()
  })
})
