/**
 * 댓글 기능 E2E 테스트
 *
 * 실제 DB에 댓글이 생성될 수 있음.
 * 작성된 댓글은 게시글 상세 페이지에서 확인 가능.
 */

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { loginAs, gotoAndWaitForAuth } from './helpers'

async function getFirstArticleId(page: Page): Promise<number | null> {
  await page.goto('/articles')
  const links = page.locator('main a[href^="/articles/"]')
  try {
    await expect(links.first()).toBeVisible({ timeout: 8_000 })
  } catch {
    return null
  }
  const count = await links.count()
  for (let i = 0; i < count; i++) {
    const href  = await links.nth(i).getAttribute('href')
    const match = href?.match(/^\/articles\/(\d+)$/)
    if (match) return Number(match[1])
  }
  return null
}

// SPA 클릭 내비게이션으로 첫 번째 게시글 상세 페이지로 이동 (in-memory 토큰 보존)
// loginAs 후 homepage(/)에서 호출해야 함 — goto 대신 링크 클릭으로 토큰 유지
async function navigateToFirstArticle(page: Page): Promise<boolean> {
  await page.getByRole('link', { name: '아티클' }).click()
  await page.waitForURL(/\/articles/, { timeout: 8_000 })

  const links = page.locator('main a[href^="/articles/"]')
  try {
    await expect(links.first()).toBeVisible({ timeout: 8_000 })
  } catch {
    return false
  }
  const count = await links.count()
  for (let i = 0; i < count; i++) {
    const href  = await links.nth(i).getAttribute('href')
    if (href?.match(/^\/articles\/(\d+)$/)) {
      await links.nth(i).click()
      await page.waitForURL(/\/articles\/\d+/, { timeout: 8_000 })
      return true
    }
  }
  return false
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

    // 댓글이 있는 게시글 API로 탐색
    const postsRes = await page.request.get('/api/blog/posts?size=20')
    expect(postsRes.ok()).toBeTruthy()
    const postsData = await postsRes.json()
    const posts = postsData.content as { id: number }[]

    let targetId: number | null = null
    for (const post of posts) {
      const cr = await page.request.get(`/api/blog/posts/${post.id}/comments`)
      if (cr.ok()) {
        const comments = await cr.json()
        if (Array.isArray(comments) && comments.length > 0) {
          targetId = post.id
          break
        }
      }
    }
    if (!targetId) {
      test.skip(true, '댓글이 있는 게시글 없음')
      return
    }

    await gotoAndWaitForAuth(page, `/articles/${targetId}`)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })
    await expect(page.getByPlaceholder('댓글을 작성하세요')).toBeVisible({ timeout: 8_000 })

    const replyBtn = page.getByRole('button', { name: '답글', exact: true }).first()
    await expect(replyBtn).toBeVisible({ timeout: 5_000 })
    await replyBtn.click()
    await expect(page.getByPlaceholder('답글을 작성하세요')).toBeVisible({ timeout: 3_000 })
  })
})
