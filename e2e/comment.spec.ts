/**
 * 댓글 기능 E2E 테스트
 *
 * 실제 DB에 댓글이 생성될 수 있음.
 * 작성된 댓글은 게시글 상세 페이지에서 확인 가능.
 */

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { loginAs } from './helpers'

async function getFirstArticleId(page: Page): Promise<number | null> {
  await page.goto('/articles')
  const link = page.locator('main a[href]').filter({ hasText: /.+/ }).first()
  await expect(link).toBeVisible({ timeout: 8_000 })
  const href = await link.getAttribute('href')
  const match = href?.match(/\/articles\/(\d+)/)
  return match ? Number(match[1]) : null
}

// SPA 클릭 내비게이션으로 첫 번째 게시글 상세 페이지로 이동 (in-memory 토큰 보존)
// loginAs 후 homepage(/)에서 호출해야 함 — goto 대신 링크 클릭으로 토큰 유지
async function navigateToFirstArticle(page: Page): Promise<boolean> {
  await page.getByRole('link', { name: '아티클' }).click()
  await page.waitForURL(/\/articles/, { timeout: 8_000 })

  const link = page.locator('main a[href]').filter({ hasText: /.+/ }).first()
  try {
    await expect(link).toBeVisible({ timeout: 8_000 })
  } catch {
    return false
  }
  const href = await link.getAttribute('href')
  if (!href?.match(/\/articles\/\d+/)) return false
  await link.click()
  await page.waitForURL(/\/articles\/\d+/, { timeout: 8_000 })
  return true
}

// ─────────────────────────────────────────────────────────────
test.describe('CommentSection — 비로그인', () => {
  test('댓글 섹션에 로그인 유도 메시지가 표시된다', async ({ page }) => {
    const postId = await getFirstArticleId(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await page.goto(`/articles/${postId}`)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText('댓글을 작성하려면 로그인이 필요합니다.')).toBeVisible()
  })

  test('댓글 입력창이 없다', async ({ page }) => {
    const postId = await getFirstArticleId(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await page.goto(`/articles/${postId}`)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })
    await expect(page.getByPlaceholder('댓글을 작성하세요')).not.toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────
test.describe('CommentSection — 멤버', () => {
  test('[멤버] 댓글 입력창이 표시된다', async ({ page }) => {
    await loginAs(page, 'member')
    const found = await navigateToFirstArticle(page)
    expect(found, 'DB에 게시글이 없습니다').toBe(true)

    await expect(page.getByPlaceholder('댓글을 작성하세요')).toBeVisible({ timeout: 8_000 })
  })

  test('[멤버] 댓글을 작성하면 목록에 추가된다', async ({ page }) => {
    await loginAs(page, 'member')
    const found = await navigateToFirstArticle(page)
    expect(found, 'DB에 게시글이 없습니다').toBe(true)

    const textarea = page.getByPlaceholder('댓글을 작성하세요')
    await expect(textarea).toBeVisible({ timeout: 8_000 })

    const comment = `E2E 댓글 테스트 ${Date.now()}`
    await textarea.fill(comment)
    await page.getByRole('button', { name: '등록' }).click()

    await expect(page.getByText(comment)).toBeVisible({ timeout: 8_000 })
  })

  test('[멤버] Ctrl+Enter로 댓글을 등록할 수 있다', async ({ page }) => {
    await loginAs(page, 'member')
    const found = await navigateToFirstArticle(page)
    expect(found, 'DB에 게시글이 없습니다').toBe(true)

    const textarea = page.getByPlaceholder('댓글을 작성하세요')
    await expect(textarea).toBeVisible({ timeout: 8_000 })

    const comment = `단축키 댓글 ${Date.now()}`
    await textarea.fill(comment)
    await textarea.press('Control+Enter')

    await expect(page.getByText(comment)).toBeVisible({ timeout: 8_000 })
  })
})

// ─────────────────────────────────────────────────────────────
test.describe('CommentSection — 대댓글', () => {
  test('[멤버] 댓글에 답글 버튼이 표시되고 답글 폼이 열린다', async ({ page }) => {
    await loginAs(page, 'member')
    const found = await navigateToFirstArticle(page)
    expect(found, 'DB에 게시글이 없습니다').toBe(true)

    await expect(page.getByPlaceholder('댓글을 작성하세요')).toBeVisible({ timeout: 8_000 })

    // 댓글이 있어야 답글 버튼이 존재 (exact: true로 "답글 작성" 버튼과 구분)
    const replyBtn = page.getByRole('button', { name: '답글', exact: true }).first()
    if (!(await replyBtn.isVisible())) {
      test.skip(true, '댓글이 없어 답글 테스트 불가')
      return
    }

    await replyBtn.click()
    await expect(page.getByPlaceholder('답글을 작성하세요')).toBeVisible({ timeout: 3_000 })
  })
})
