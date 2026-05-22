/**
 * 댓글 기능 E2E 테스트
 *
 * 댓글 조회, 작성, 삭제, 대댓글, 좋아요 플로우를 검증한다.
 * 실제 DB 데이터에 의존하므로 게시글이 1개 이상 있어야 한다.
 */

import { test, expect } from '@playwright/test'
import { loginAs, gotoAndWaitForAuth } from './helpers'

async function getFirstPublishedArticleUrl(page: import('@playwright/test').Page) {
  const res = await page.request.get('/api/blog/posts?size=1')
  const data = await res.json()
  return `/articles/${(data.content as { id: number }[])[0].id}`
}

// ── 비로그인 댓글 조회 ────────────────────────────────────────

test.describe('댓글 조회 — 비로그인', () => {
  test('댓글 섹션 헤더 "댓글"이 표시된다', async ({ page }) => {
    const articleUrl = await getFirstPublishedArticleUrl(page)
    await page.goto(articleUrl)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })

    await expect(page.getByRole('heading', { name: /댓글/ })).toBeVisible({ timeout: 5_000 })
  })

  test('[비로그인] 댓글 작성 유도 메시지가 표시된다', async ({ page }) => {
    const articleUrl = await getFirstPublishedArticleUrl(page)
    await page.goto(articleUrl)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })

    await expect(
      page.locator('text=댓글을 작성하려면 로그인이 필요합니다.')
    ).toBeVisible({ timeout: 5_000 })
  })

  test('[비로그인] 댓글 입력 textarea가 없다', async ({ page }) => {
    const articleUrl = await getFirstPublishedArticleUrl(page)
    await page.goto(articleUrl)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })

    await expect(page.getByPlaceholder('댓글을 작성하세요')).not.toBeVisible()
  })
})

// ── 로그인 댓글 작성/삭제 ─────────────────────────────────────

test.describe('댓글 작성 — 멤버', () => {
  test('[멤버] 댓글 작성 textarea가 표시된다', async ({ page }) => {
    await loginAs(page, 'member')
    const articleUrl = await getFirstPublishedArticleUrl(page)
    await gotoAndWaitForAuth(page, articleUrl)

    await expect(page.getByPlaceholder('댓글을 작성하세요')).toBeVisible({ timeout: 8_000 })
  })

  test('[멤버] 빈 내용으로는 등록 버튼이 비활성화된다', async ({ page }) => {
    await loginAs(page, 'member')
    const articleUrl = await getFirstPublishedArticleUrl(page)
    await gotoAndWaitForAuth(page, articleUrl)
    await expect(page.getByPlaceholder('댓글을 작성하세요')).toBeVisible({ timeout: 8_000 })

    const submitBtn = page.getByRole('button', { name: '등록' })
    await expect(submitBtn).toBeDisabled()
  })

  test('[멤버] 댓글을 작성하면 목록에 표시된다', async ({ page }) => {
    await loginAs(page, 'member')
    const articleUrl = await getFirstPublishedArticleUrl(page)
    await gotoAndWaitForAuth(page, articleUrl)

    const textarea = page.getByPlaceholder('댓글을 작성하세요')
    await expect(textarea).toBeVisible({ timeout: 8_000 })

    const commentText = `E2E 댓글 테스트 ${Date.now()}`
    await textarea.fill(commentText)

    const submitBtn = page.getByRole('button', { name: '등록' })
    await expect(submitBtn).not.toBeDisabled()
    await submitBtn.click()

    await expect(page.locator(`text=${commentText}`)).toBeVisible({ timeout: 8_000 })
  })

  test('[멤버] 본인이 작성한 댓글에 수정·삭제 버튼이 보인다', async ({ page }) => {
    await loginAs(page, 'member')
    const articleUrl = await getFirstPublishedArticleUrl(page)
    await gotoAndWaitForAuth(page, articleUrl)

    const textarea = page.getByPlaceholder('댓글을 작성하세요')
    await expect(textarea).toBeVisible({ timeout: 8_000 })

    const commentText = `수정삭제 E2E ${Date.now()}`
    await textarea.fill(commentText)
    await page.getByRole('button', { name: '등록' }).click()
    await expect(page.locator(`text=${commentText}`)).toBeVisible({ timeout: 8_000 })

    // 본인 댓글 수정/삭제 버튼
    const commentEl = page.locator(`text=${commentText}`).locator('..')
    await expect(commentEl.getByText('수정')).toBeVisible({ timeout: 3_000 })
    await expect(commentEl.getByText('삭제')).toBeVisible()
  })
})

// ── 대댓글 ───────────────────────────────────────────────────

test.describe('대댓글 — 멤버', () => {
  test('[멤버] 루트 댓글에 "답글" 버튼이 보인다', async ({ page }) => {
    await loginAs(page, 'member')
    const articleUrl = await getFirstPublishedArticleUrl(page)
    await gotoAndWaitForAuth(page, articleUrl)

    // 먼저 루트 댓글 하나 작성
    const textarea = page.getByPlaceholder('댓글을 작성하세요')
    await expect(textarea).toBeVisible({ timeout: 8_000 })
    await textarea.fill(`답글 테스트용 루트 ${Date.now()}`)
    await page.getByRole('button', { name: '등록' }).click()

    // 답글 버튼이 보여야 함 (exact: true로 "답글 작성" 버튼과 구분)
    await expect(page.getByRole('button', { name: '답글', exact: true }).first()).toBeVisible({ timeout: 5_000 })
  })

  test('[멤버] 답글 버튼 클릭 시 대댓글 입력폼이 나타난다', async ({ page }) => {
    await loginAs(page, 'member')
    const articleUrl = await getFirstPublishedArticleUrl(page)
    await gotoAndWaitForAuth(page, articleUrl)

    const textarea = page.getByPlaceholder('댓글을 작성하세요')
    await expect(textarea).toBeVisible({ timeout: 8_000 })
    await textarea.fill(`대댓글 폼 테스트 ${Date.now()}`)
    await page.getByRole('button', { name: '등록' }).click()

    await page.getByRole('button', { name: '답글', exact: true }).first().click()
    await expect(page.getByPlaceholder('답글을 작성하세요')).toBeVisible({ timeout: 3_000 })
    await expect(page.getByRole('button', { name: '답글 등록' })).toBeVisible()
  })
})

// ── 좋아요 ───────────────────────────────────────────────────

test.describe('댓글 좋아요', () => {
  test('[비로그인] 좋아요 버튼이 비활성화된다', async ({ page }) => {
    const articleUrl = await getFirstPublishedArticleUrl(page)
    await page.goto(articleUrl)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })

    // 댓글이 있을 경우에만 테스트
    const section = page.locator('section').filter({ hasText: '댓글' })
    const hasComments = await section.locator('div.py-4').count() > 0
    if (!hasComments) {
      test.skip(true, '댓글이 없는 게시글')
      return
    }

    // 비로그인 상태의 좋아요 버튼은 disabled
    const likeBtn = section.locator('button').filter({
      has: page.locator('svg path[d*="4.318"]'),
    }).first()
    await expect(likeBtn).toBeDisabled()
  })
})
