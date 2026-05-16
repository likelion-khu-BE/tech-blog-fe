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
}
