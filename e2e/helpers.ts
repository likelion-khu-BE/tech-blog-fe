import type { Page } from '@playwright/test'

const CREDENTIALS = {
  admin:  { email: 'admin_test@khu.ac.kr',  password: 'password123' },
  member: { email: 'member_test@khu.ac.kr', password: 'password123' },
}

export async function loginAs(page: Page, role: 'admin' | 'member') {
  const { email, password } = CREDENTIALS[role]
  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('http://localhost:3000/', { timeout: 15_000 })
  // Wait for the initial auth refresh to complete before any further navigation
  await page.getByRole('button', { name: '로그아웃' }).waitFor({ state: 'visible', timeout: 10_000 })
}

/**
 * SPA 네비게이션으로 이동 — page.goto() 를 쓰면 React가 remount 되고
 * React StrictMode의 effect 이중 실행으로 refreshToken 이 동시에 두 번 호출된다.
 * 백엔드가 단일 사용 토큰이라 두 번째 호출이 재사용 감지로 family 전체 revoke 된다.
 * history.pushState + popstate 이벤트로 SPA 이동하면 AuthProvider가 살아있어 문제 없다.
 */
export async function gotoAndWaitForAuth(page: Page, url: string) {
  const currentOrigin = new URL(page.url()).origin
  const targetUrl = url.startsWith('http') ? url : `${currentOrigin}${url}`
  const targetPath = url.startsWith('http') ? new URL(url).pathname : url

  if (!page.url().startsWith(currentOrigin)) {
    // Not on the same origin yet — fall back to hard navigation
    await page.goto(url)
    await page.getByRole('button', { name: '로그아웃' }).waitFor({ state: 'visible', timeout: 15_000 })
    return
  }

  // SPA navigation: keep React mounted (no remount = no double refreshToken)
  await page.evaluate((path) => {
    window.history.pushState(null, '', path)
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }))
  }, targetPath)
  await page.waitForURL(targetUrl, { timeout: 8_000 })
}
