/**
 * 역할별 페이지 접근 제어 E2E 테스트
 *
 * 각 테스트는 필요한 역할로 직접 로그인하거나 로그아웃 상태로 진행한다.
 */

import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

// ── /articles/write ──────────────────────────────────────────
test.describe('/articles/write 접근 제어', () => {
  test('비로그인: /login으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/articles/write')
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
  })

  test('멤버: 작성 폼 페이지에 접근된다', async ({ page }) => {
    await loginAs(page, 'member')
    // SPA 이동 → 인메모리 토큰 유지 (page.goto는 리로드 후 사일런트 리프레시 필요)
    await page.getByRole('link', { name: '글쓰기' }).click()
    await expect(page.getByPlaceholder('제목을 입력하세요')).toBeVisible({ timeout: 8_000 })
  })

  test('어드민: 작성 폼 페이지에 접근된다', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.getByRole('link', { name: '글쓰기' }).click()
    await expect(page.getByPlaceholder('제목을 입력하세요')).toBeVisible({ timeout: 8_000 })
  })
})

// ── /admin ────────────────────────────────────────────────────
test.describe('/admin 접근 제어', () => {
  test('비로그인: /admin 접근 시 리다이렉트된다', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForTimeout(2_000)
    await expect(page).not.toHaveURL(/\/admin/)
  })

  test('멤버: /admin 접근 시 리다이렉트된다', async ({ page }) => {
    await loginAs(page, 'member')
    await page.goto('/admin')
    await page.waitForTimeout(2_000)
    await expect(page).not.toHaveURL(/\/admin/)
  })

  test('어드민: 관리자 페이지에 접근된다', async ({ page }) => {
    await loginAs(page, 'admin')
    // SPA 내부 링크 클릭 → 인메모리 토큰 유지 (page.goto는 리로드 후 사일런트 리프레시 필요)
    await page.getByRole('link', { name: '관리자' }).click()
    await expect(page.getByRole('heading', { name: '관리자' })).toBeVisible({ timeout: 8_000 })
  })
})
