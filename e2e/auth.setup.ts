/**
 * 역할별 로그인 후 storageState(쿠키) 저장.
 * 이후 spec 파일들이 이 상태를 재사용해 매 테스트마다 로그인하지 않아도 된다.
 * 저장 위치: e2e/.auth/{role}.json
 */

import { test as setup, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ADMIN_PATH  = path.join(__dirname, '.auth/admin.json')
const MEMBER_PATH = path.join(__dirname, '.auth/member.json')

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  // 로그인 성공 시 / 로 이동
  await page.waitForURL('http://localhost:3000/', { timeout: 10_000 })
}

setup('어드민 로그인 저장', async ({ page }) => {
  await login(page, 'admin_test@khu.ac.kr', 'password123')
  await expect(page).toHaveURL('http://localhost:3000/')
  await page.context().storageState({ path: ADMIN_PATH })
})

setup('멤버 로그인 저장', async ({ page }) => {
  await login(page, 'member_test@khu.ac.kr', 'password123')
  await expect(page).toHaveURL('http://localhost:3000/')
  await page.context().storageState({ path: MEMBER_PATH })
})
