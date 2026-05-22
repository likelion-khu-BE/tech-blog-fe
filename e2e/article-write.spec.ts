/**
 * 아티클 작성/제출 워크플로우 E2E 테스트
 *
 * 검토 워크플로우: DRAFT → (제출) → PENDING_REVIEW → (어드민 발행) → PUBLISHED
 *                                                  → (어드민 거부) → REJECTED
 */

import { test, expect } from '@playwright/test'
import { loginAs, gotoAndWaitForAuth } from './helpers'

// ── 공통 헬퍼 ────────────────────────────────────────────────

async function fillWriteForm(
  page: import('@playwright/test').Page,
  opts: { title?: string; category?: string; content?: string } = {}
) {
  const title = opts.title ?? `E2E 테스트 글 ${Date.now()}`
  const category = opts.category ?? 'Spring Boot'
  const content = opts.content ?? '테스트 본문 내용입니다.'

  await page.getByPlaceholder('제목을 입력하세요').fill(title)
  await page.getByRole('button', { name: category }).click()
  await page.getByPlaceholder(/마크다운으로 작성하세요/).fill(content)

  return { title, category, content }
}

async function goToWritePage(page: import('@playwright/test').Page) {
  await page.getByRole('link', { name: '글쓰기' }).click()
  await expect(page.getByPlaceholder('제목을 입력하세요')).toBeVisible({ timeout: 8_000 })
}

// ── 접근 제어 ─────────────────────────────────────────────────

test.describe('아티클 작성 — 접근 제어', () => {
  test('[비로그인] /articles/write 접근 시 /login으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/articles/write')
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
  })

  test('[멤버] /articles/write에 접근된다', async ({ page }) => {
    await loginAs(page, 'member')
    await goToWritePage(page)
    await expect(page.getByText('임시저장')).toBeVisible()
    await expect(page.getByText('제출')).toBeVisible()
  })

  test('[어드민] /articles/write에 접근된다', async ({ page }) => {
    await loginAs(page, 'admin')
    await goToWritePage(page)
    await expect(page.getByText('임시저장')).toBeVisible()
  })
})

// ── 버튼 활성화 조건 ──────────────────────────────────────────

test.describe('아티클 작성 — 버튼 활성화 조건', () => {
  test('제목·카테고리·내용 미입력 시 버튼이 비활성화된다', async ({ page }) => {
    await loginAs(page, 'member')
    await goToWritePage(page)

    await expect(page.getByRole('button', { name: '제출' })).toBeDisabled()
    await expect(page.getByRole('button', { name: '임시저장' })).toBeDisabled()
  })

  test('제목·카테고리·내용 모두 입력 시 버튼이 활성화된다', async ({ page }) => {
    await loginAs(page, 'member')
    await goToWritePage(page)

    await fillWriteForm(page)

    await expect(page.getByRole('button', { name: '제출' })).not.toBeDisabled({ timeout: 3_000 })
    await expect(page.getByRole('button', { name: '임시저장' })).not.toBeDisabled()
  })
})

// ── 임시저장 (DRAFT) ──────────────────────────────────────────

test.describe('아티클 작성 — 임시저장', () => {
  test('임시저장 클릭 시 DRAFT 상태로 저장되고 상세 페이지로 이동한다', async ({ page }) => {
    await loginAs(page, 'member')
    await goToWritePage(page)

    const { title } = await fillWriteForm(page)

    // POST /api/blog/posts 응답을 가로채 status 검증
    const [createResponse] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/api/blog/posts') &&
          res.request().method() === 'POST' &&
          !res.url().includes('/submit') &&
          !res.url().includes('/admin'),
        { timeout: 10_000 }
      ),
      page.getByRole('button', { name: '임시저장' }).click(),
    ])
    const body = await createResponse.json()
    expect(body.status).toBe('DRAFT')

    await expect(page).toHaveURL(/\/articles\/\d+/, { timeout: 10_000 })
    await expect(page.locator('h1').first()).toContainText(title, { timeout: 8_000 })
  })
})

// ── 검토 제출 (PENDING_REVIEW) ────────────────────────────────

test.describe('아티클 작성 — 검토 제출', () => {
  test('제출 클릭 시 게시글 상세 페이지로 이동한다', async ({ page }) => {
    await loginAs(page, 'member')
    await goToWritePage(page)

    const { title } = await fillWriteForm(page)
    await page.getByRole('button', { name: '제출' }).click()

    await expect(page).toHaveURL(/\/articles\/\d+/, { timeout: 10_000 })
    await expect(page.locator('h1').first()).toContainText(title, { timeout: 8_000 })
  })
})

// ── 답글 작성 ────────────────────────────────────────────────

test.describe('아티클 작성 — 답글 작성 (#5)', () => {
  test('[멤버] 상세 페이지에서 답글 작성 버튼 클릭 시 원글 배너가 표시된다', async ({ page }) => {
    await loginAs(page, 'member')

    const res = await page.request.get('/api/blog/posts?size=1')
    const data = await res.json()
    const postId = (data.content as { id: number }[])[0]?.id

    await gotoAndWaitForAuth(page, `/articles/${postId}`)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })

    await page.getByRole('button', { name: '답글 작성' }).click()
    await expect(page).toHaveURL(new RegExp(`/articles/write\\?replyTo=${postId}`))
    await expect(page.locator('text=원글:')).toBeVisible({ timeout: 8_000 })
  })
})

// ── 어드민 워크플로우 ─────────────────────────────────────────

test.describe('어드민 — 검토 대기 → 발행/거부', () => {
  test('[어드민] 아티클 관리 탭에서 PENDING_REVIEW 목록이 로드된다', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.getByRole('link', { name: '관리자' }).click()
    await page.waitForURL('**/admin', { timeout: 8_000 })

    await page.getByRole('button', { name: '아티클 관리' }).click()

    // 검토 대기 탭이 기본 선택
    await expect(page.getByRole('button', { name: '검토 대기' }).first()).toBeVisible()
    // 오류 없이 로드
    await expect(page.locator('text=오류')).not.toBeVisible()
  })
})
