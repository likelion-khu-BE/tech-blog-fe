/**
 * 게시글 작성/수정 페이지 E2E 테스트
 *
 * 실제 DB에 게시글이 생성될 수 있음 (status=DRAFT).
 * 어드민 관리자 페이지에서 정리 가능.
 */

import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

// ─────────────────────────────────────────────────────────────
test.describe('ArticleWritePage — 접근 제어', () => {
  test('[비로그인] /articles/write 접근 시 로그인 페이지로 리다이렉트된다', async ({ page }) => {
    await page.goto('/articles/write')
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
  })

  test('[멤버] /articles/write에 접근할 수 있다', async ({ page }) => {
    await loginAs(page, 'member')
    await page.getByRole('link', { name: '아티클' }).click()
    await page.waitForURL('**/articles', { timeout: 8_000 })
    await page.goto('/articles/write')
    await expect(page.getByPlaceholder('제목을 입력하세요')).toBeVisible({ timeout: 8_000 })
  })
})

// ─────────────────────────────────────────────────────────────
test.describe('ArticleWritePage — 유효성', () => {
  test('빈 폼에서 발행 버튼이 비활성화된다', async ({ page }) => {
    await loginAs(page, 'member')
    await page.goto('/articles/write')
    await expect(page.getByRole('button', { name: '발행' })).toBeDisabled({ timeout: 5_000 })
  })

  test('제목만 입력하면 발행 버튼이 여전히 비활성화된다', async ({ page }) => {
    await loginAs(page, 'member')
    await page.goto('/articles/write')
    await page.fill('[placeholder="제목을 입력하세요"]', '제목만 입력')
    await expect(page.getByRole('button', { name: '발행' })).toBeDisabled()
  })
})

// ─────────────────────────────────────────────────────────────
test.describe('ArticleWritePage — 게시글 작성', () => {
  test('[멤버] 제목·내용·카테고리 입력 후 발행하면 상세 페이지로 이동한다', async ({ page }) => {
    await loginAs(page, 'member')
    await page.goto('/articles/write')

    await page.fill('[placeholder="제목을 입력하세요"]', 'E2E 테스트 게시글')
    await page.fill('[placeholder^="마크다운으로 작성하세요"]', '## 본문\n\nE2E 테스트 내용입니다.')
    await page.getByRole('button', { name: 'Testing' }).click()

    await page.getByRole('button', { name: '발행' }).click()
    await expect(page).toHaveURL(/\/articles\/\d+/, { timeout: 10_000 })
  })

  test('[멤버] 태그를 입력하고 발행할 수 있다', async ({ page }) => {
    await loginAs(page, 'member')
    await page.goto('/articles/write')

    await page.fill('[placeholder="제목을 입력하세요"]', 'E2E 태그 테스트')
    await page.fill('[placeholder^="마크다운으로 작성하세요"]', '태그 테스트 내용')
    await page.getByRole('button', { name: 'Testing' }).click()

    const tagInput = page.getByPlaceholder('태그 입력 후 Enter (선택)')
    await tagInput.fill('E2E')
    await tagInput.press('Enter')
    await expect(page.getByText('E2E')).toBeVisible()

    await page.getByRole('button', { name: '발행' }).click()
    await expect(page).toHaveURL(/\/articles\/\d+/, { timeout: 10_000 })
  })
})

// ─────────────────────────────────────────────────────────────
test.describe('ArticleWritePage — 답글 모드', () => {
  test('[멤버] 상세 페이지에서 "답글 작성" 클릭 시 원글 배너가 표시된다', async ({ page }) => {
    await loginAs(page, 'member')
    await page.goto('/articles')

    const firstArticle = page.locator('a[href^="/articles/"]').first()
    expect(await firstArticle.isVisible({ timeout: 8_000 }), 'DB에 게시글이 없습니다').toBe(true)
    await firstArticle.click()
    await page.waitForURL(/\/articles\/\d+/)

    await page.getByRole('button', { name: '답글 작성' }).click()
    await expect(page).toHaveURL(/\/articles\/write\?replyTo=\d+/)
    await expect(page.locator('text=원글:')).toBeVisible({ timeout: 8_000 })
  })
})
