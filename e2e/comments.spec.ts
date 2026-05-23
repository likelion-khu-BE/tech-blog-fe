/**
 * 댓글 기능 E2E 테스트
 *
 * 비로그인/좋아요: 공유 PUBLISHED 게시글, 순차 실행
 * 멤버 댓글·대댓글: 테스트별 전용 DRAFT 게시글, 병렬 실행
 */

import { test, expect } from '@playwright/test'
import { loginAs, gotoAndWaitForAuth } from './helpers'

async function getFirstPublishedArticleUrl(page: import('@playwright/test').Page) {
  const res = await page.request.get('/api/blog/posts?size=1')
  const data = await res.json()
  const content = data.content as { id: number }[]
  if (!content || content.length === 0) {
    throw new Error('No published articles found in database')
  }
  return `/articles/${content[0].id}`
}

/** 로그인된 페이지에서 DRAFT 게시글을 UI로 생성하고 그 URL을 반환한다. */
async function createDraftArticle(page: import('@playwright/test').Page) {
  await page.getByRole('link', { name: '글쓰기' }).click()
  await expect(page.getByPlaceholder('제목을 입력하세요')).toBeVisible({ timeout: 8_000 })
  await page.getByPlaceholder('제목을 입력하세요').fill(`E2E 댓글 ${Date.now()}`)
  await page.getByRole('button', { name: 'Spring Boot' }).click()
  await page.getByPlaceholder(/마크다운으로 작성하세요/).fill('테스트 본문')
  await page.getByRole('button', { name: '임시저장' }).click()
  await expect(page).toHaveURL(/\/articles\/\d+/, { timeout: 10_000 })
  const match = page.url().match(/\/articles\/(\d+)/)
  if (!match) {
    throw new Error(`Failed to extract article ID from URL: ${page.url()}`)
  }
  const articleId = Number(match[1])
  return { articleId, articleUrl: `/articles/${articleId}` }
}

/** 해당 게시글 상세 페이지로 이동 후 삭제 버튼을 클릭해 정리한다. */
async function deleteDraftArticle(page: import('@playwright/test').Page, articleUrl: string) {
  await gotoAndWaitForAuth(page, articleUrl)
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: '삭제' }).click()
  await page.waitForURL('**/articles', { timeout: 8_000 }).catch(() => {})
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

// ── 로그인 댓글 작성 ──────────────────────────────────────────
// 각 테스트가 전용 DRAFT 게시글에서 실행되므로 병렬 실행이 안전하다.

test.describe('댓글 작성 — 멤버', () => {
  test.describe.configure({ mode: 'parallel' })

  let articleUrl = ''
  let articleId = 0

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member')
    const result = await createDraftArticle(page)
    articleId = result.articleId
    articleUrl = result.articleUrl
    // beforeEach 종료 시 페이지는 /articles/{id} 에 위치
  })

  test.afterEach(async ({ page }) => {
    if (!articleId) return
    await deleteDraftArticle(page, articleUrl).catch(() => {})
  })

  test('[멤버] 댓글 작성 textarea가 표시된다', async ({ page }) => {
    await expect(page.getByPlaceholder('댓글을 작성하세요')).toBeVisible({ timeout: 8_000 })
  })

  test('[멤버] 빈 내용으로는 등록 버튼이 비활성화된다', async ({ page }) => {
    await expect(page.getByPlaceholder('댓글을 작성하세요')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByRole('button', { name: '등록' })).toBeDisabled()
  })

  test('[멤버] 댓글을 작성하면 목록에 표시된다', async ({ page }) => {
    const textarea = page.getByPlaceholder('댓글을 작성하세요')
    await expect(textarea).toBeVisible({ timeout: 8_000 })

    const commentText = `E2E 댓글 테스트 ${Date.now()}`
    await textarea.fill(commentText)
    await expect(page.getByRole('button', { name: '등록' })).not.toBeDisabled()
    await page.getByRole('button', { name: '등록' }).click()

    await expect(page.locator(`text=${commentText}`)).toBeVisible({ timeout: 8_000 })
  })

  test('[멤버] 본인이 작성한 댓글에 수정·삭제 버튼이 보인다', async ({ page }) => {
    const textarea = page.getByPlaceholder('댓글을 작성하세요')
    await expect(textarea).toBeVisible({ timeout: 8_000 })

    const commentText = `수정삭제 E2E ${Date.now()}`
    await textarea.fill(commentText)
    await page.getByRole('button', { name: '등록' }).click()
    await expect(page.locator(`text=${commentText}`)).toBeVisible({ timeout: 8_000 })

    const commentEl = page.locator(`text=${commentText}`).locator('..')
    await expect(commentEl.getByText('수정')).toBeVisible({ timeout: 3_000 })
    await expect(commentEl.getByText('삭제')).toBeVisible()
  })
})

// ── 대댓글 ────────────────────────────────────────────────────
// 각 테스트가 전용 DRAFT 게시글에서 실행되므로 병렬 실행이 안전하다.

test.describe('대댓글 — 멤버', () => {
  test.describe.configure({ mode: 'parallel' })

  let articleUrl = ''
  let articleId = 0

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member')
    const result = await createDraftArticle(page)
    articleId = result.articleId
    articleUrl = result.articleUrl
  })

  test.afterEach(async ({ page }) => {
    if (!articleId) return
    await deleteDraftArticle(page, articleUrl).catch(() => {})
  })

  test('[멤버] 루트 댓글에 "답글" 버튼이 보인다', async ({ page }) => {
    const textarea = page.getByPlaceholder('댓글을 작성하세요')
    await expect(textarea).toBeVisible({ timeout: 8_000 })
    const commentText = `답글 테스트용 루트 ${Date.now()}`
    await textarea.fill(commentText)
    await page.getByRole('button', { name: '등록' }).click()
    await expect(page.locator(`text=${commentText}`)).toBeVisible({ timeout: 8_000 })

    await expect(
      page.getByRole('button', { name: '답글', exact: true }).first()
    ).toBeVisible({ timeout: 5_000 })
  })

  test('[멤버] 답글 버튼 클릭 시 대댓글 입력폼이 나타난다', async ({ page }) => {
    const textarea = page.getByPlaceholder('댓글을 작성하세요')
    await expect(textarea).toBeVisible({ timeout: 8_000 })
    const commentText = `대댓글 폼 테스트 ${Date.now()}`
    await textarea.fill(commentText)
    await page.getByRole('button', { name: '등록' }).click()
    // 댓글이 목록에 렌더링될 때까지 대기 후 답글 버튼 클릭
    await expect(page.locator(`text=${commentText}`)).toBeVisible({ timeout: 8_000 })

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

    const section = page.locator('section').filter({ hasText: '댓글' })
    const hasComments = (await section.locator('div.py-4').count()) > 0
    if (!hasComments) {
      test.skip(true, '댓글이 없는 게시글')
      return
    }

    const likeBtn = section
      .locator('button')
      .filter({ has: page.locator('svg path[d*="4.318"]') })
      .first()
    await expect(likeBtn).toBeDisabled()
  })
})
