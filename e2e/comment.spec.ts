/**
 * 댓글 기능 E2E 테스트
 *
 * 실제 DB에 댓글이 생성될 수 있음.
 * 작성된 댓글은 게시글 상세 페이지에서 확인 가능.
 */

import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

async function getFirstArticleId(page: import('@playwright/test').Page): Promise<number | null> {
  await page.goto('/articles')
  const link = page.locator('a[href^="/articles/"]').first()
  await expect(link).toBeVisible({ timeout: 8_000 })
  const href = await link.getAttribute('href')
  const match = href?.match(/\/articles\/(\d+)/)
  return match ? Number(match[1]) : null
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
    const postId = await getFirstArticleId(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await page.goto(`/articles/${postId}`)
    await expect(page.getByPlaceholder('댓글을 작성하세요')).toBeVisible({ timeout: 8_000 })
  })

  test('[멤버] 댓글을 작성하면 목록에 추가된다', async ({ page }) => {
    await loginAs(page, 'member')
    const postId = await getFirstArticleId(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await page.goto(`/articles/${postId}`)
    const textarea = page.getByPlaceholder('댓글을 작성하세요')
    await expect(textarea).toBeVisible({ timeout: 8_000 })

    const comment = `E2E 댓글 테스트 ${Date.now()}`
    await textarea.fill(comment)
    await page.getByRole('button', { name: '등록' }).click()

    await expect(page.getByText(comment)).toBeVisible({ timeout: 8_000 })
  })

  test('[멤버] Ctrl+Enter로 댓글을 등록할 수 있다', async ({ page }) => {
    await loginAs(page, 'member')
    const postId = await getFirstArticleId(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await page.goto(`/articles/${postId}`)
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
    const postId = await getFirstArticleId(page)
    expect(postId, 'DB에 게시글이 없습니다').not.toBeNull()

    await page.goto(`/articles/${postId}`)
    await expect(page.getByPlaceholder('댓글을 작성하세요')).toBeVisible({ timeout: 8_000 })

    // 댓글이 있어야 답글 버튼이 존재
    const replyBtn = page.getByRole('button', { name: '답글' }).first()
    if (!(await replyBtn.isVisible())) {
      test.skip(true, '댓글이 없어 답글 테스트 불가')
      return
    }

    await replyBtn.click()
    await expect(page.getByPlaceholder('답글을 작성하세요')).toBeVisible({ timeout: 3_000 })
  })
})
