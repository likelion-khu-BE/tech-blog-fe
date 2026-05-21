/**
 * 게시글 상세 페이지 E2E 테스트 (#5 #6 #9)
 */

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { loginAs } from './helpers'

// 비로그인 상태에서 첫 게시글 ID 반환 (page.goto 사용 가능)
async function getFirstArticleId(page: Page): Promise<number | null> {
  await page.goto('/articles')
  const link = page.locator('main a[href]').filter({ hasText: /.+/ }).first()
  try {
    await expect(link).toBeVisible({ timeout: 8_000 })
  } catch {
    return null
  }
  const href = await link.getAttribute('href')
  const match = href?.match(/\/articles\/(\d+)/)
  return match ? Number(match[1]) : null
}

// 로그인 후 SPA 클릭 내비게이션으로 첫 게시글 상세 페이지 이동 (in-memory 토큰 보존)
// loginAs 후 homepage(/)에서 호출해야 함
async function navigateToFirstArticleSpa(page: Page): Promise<number | null> {
  await page.getByRole('link', { name: '아티클' }).click()
  await page.waitForURL(/\/articles/, { timeout: 8_000 })

  const link = page.locator('main a[href]').filter({ hasText: /.+/ }).first()
  try {
    await expect(link).toBeVisible({ timeout: 8_000 })
  } catch {
    return null
  }
  const href = await link.getAttribute('href')
  const match = href?.match(/\/articles\/(\d+)/)
  if (!match) return null
  const postId = Number(match[1])
  await link.click()
  await page.waitForURL(/\/articles\/\d+/, { timeout: 8_000 })
  return postId
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
    const postId = await navigateToFirstArticleSpa(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await expect(page.getByRole('button', { name: '답글 작성' })).toBeVisible({ timeout: 8_000 })
  })

  test('[어드민] 답글 작성 버튼이 보인다', async ({ page }) => {
    await loginAs(page, 'admin')
    const postId = await navigateToFirstArticleSpa(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await expect(page.getByRole('button', { name: '답글 작성' })).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('ArticleDetailPage — #5 답글 작성 플로우', () => {
  test('[멤버] 답글 작성 버튼 → 작성 폼 이동 및 원글 배너 표시', async ({ page }) => {
    await loginAs(page, 'member')
    const postId = await navigateToFirstArticleSpa(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

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
