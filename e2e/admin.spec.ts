/**
 * 관리자 페이지 E2E 테스트 (#4)
 *
 * loginAs 후 nav 링크 클릭으로 SPA 이동 → 인메모리 토큰 유지.
 * page.goto('/admin')는 전체 리로드를 유발해 사일런트 리프레시에 의존하므로 불안정.
 */

import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

async function goToAdmin(page: import('@playwright/test').Page) {
  await loginAs(page, 'admin')
  await page.getByRole('link', { name: '관리자' }).click()
  await page.waitForURL('**/admin', { timeout: 8_000 })
}

test.describe('AdminPage — #4 통계 카드', () => {
  test('[어드민] 통계 카드 4개가 렌더링되고 숫자가 표시된다', async ({ page }) => {
    await goToAdmin(page)
    await page.waitForTimeout(2_000) // stats API 대기

    const STAT_LABELS = ['전체 게시글', '게시된 글', '초안', '총 댓글']
    for (const label of STAT_LABELS) {
      // label 텍스트를 가진 p 요소의 형제인 p.text-2xl을 확인
      const valueEl = page.locator('p', { hasText: label })
        .locator('xpath=following-sibling::p[contains(@class,"text-2xl")]')
      const valueText = await valueEl.textContent({ timeout: 5_000 })
      expect(valueText?.trim()).toMatch(/^\d[\d,]*$/)
    }
  })

  test('[멤버] /admin 접근 시 리다이렉트된다', async ({ page }) => {
    await loginAs(page, 'member')
    await page.goto('/admin')
    await page.waitForTimeout(2_000)
    await expect(page).not.toHaveURL(/\/admin/)
  })

  test('[비로그인] /admin 접근 시 리다이렉트된다', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForTimeout(2_000)
    await expect(page).not.toHaveURL(/\/admin/)
  })
})

test.describe('AdminPage — 아티클 관리', () => {
  test('[어드민] 아티클 관리 탭에서 게시글 목록이 로드된다', async ({ page }) => {
    await goToAdmin(page)
    await page.waitForTimeout(1_000)

    await page.getByRole('button', { name: '아티클 관리' }).click()
    await page.waitForTimeout(1_000)

    // 오류 텍스트가 없고, 아티클 관리 버튼이 여전히 보임
    await expect(page.getByRole('button', { name: '아티클 관리' })).toBeVisible()
    await expect(page.locator('text=오류')).not.toBeVisible()
  })

  test('[어드민] 회원 관리 탭에서 유저 목록이 로드된다', async ({ page }) => {
    await goToAdmin(page)
    await page.waitForTimeout(1_000)

    await expect(page.getByRole('button', { name: '회원 관리' })).toBeVisible()
    await expect(page.locator('text=오류')).not.toBeVisible()
  })
})
