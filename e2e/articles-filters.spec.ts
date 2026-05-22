/**
 * 아티클 필터 기능 E2E 테스트.
 *
 * - beforeAll : API 로그인 → 테스트용 게시글 삽입 (PUBLISHED + DRAFT 포함)
 * - afterAll  : 삽입한 게시글 전부 삭제
 * - 모든 테스트를 하나의 describe 로 묶어 beforeAll/afterAll 이 한 번만 실행되게 보장
 */

import { test, expect, request as pwRequest } from '@playwright/test'

const API   = 'http://localhost:8080'
const ADMIN  = { email: 'admin_test@khu.ac.kr',  password: 'password123' }
const MEMBER = { email: 'member_test@khu.ac.kr', password: 'password123' }

// ─── 헬퍼 ──────────────────────────────────────────────────────

type ReqCtx = Awaited<ReturnType<typeof pwRequest.newContext>>

async function apiLogin(ctx: ReqCtx, creds: typeof ADMIN) {
  const res  = await ctx.post(`${API}/api/auth/login`, { data: creds })
  if (!res.ok()) throw new Error(`Login failed (${res.status()}): ${await res.text()}`)
  const body = await res.json()
  return body.accessToken as string
}

async function apiCreate(
  ctx: ReqCtx, authorToken: string, adminToken: string,
  payload: { title: string; content: string; board: string; category: string; status: 'PUBLISHED' | 'DRAFT'; tags: string[] },
): Promise<number> {
  // Backend always creates as DRAFT; publishing requires a separate admin endpoint.
  const res  = await ctx.post(`${API}/api/blog/posts`, {
    data: { ...payload, status: 'DRAFT' },
    headers: { Authorization: `Bearer ${authorToken}` },
  })
  if (!res.ok()) throw new Error(`Create post failed (${res.status()}): ${await res.text()}`)
  const body = await res.json()
  const id   = body.id as number

  if (payload.status === 'PUBLISHED') {
    const publishRes = await ctx.patch(`${API}/api/blog/admin/posts/${id}/status`, {
      data: { status: 'PUBLISHED' },
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    if (!publishRes.ok()) throw new Error(`Publish post failed (${publishRes.status()}): ${await publishRes.text()}`)
  }

  return id
}

async function apiDelete(ctx: ReqCtx, token: string, id: number) {
  await ctx.delete(`${API}/api/blog/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

async function waitForArticles(page: import('@playwright/test').Page) {
  await expect(page.locator('main a[href]').first()).toBeVisible({ timeout: 10_000 })
}

// ─── 전체를 하나의 describe 로 묶어 beforeAll/afterAll 공유 ──────

test.describe('아티클 필터 E2E', () => {
  // serial 모드: beforeAll/afterAll 이 한 번만 실행되고 상태가 공유됨
  test.describe.configure({ mode: 'serial' })

  // 공유 상태
  const createdIds: number[] = []
  let adminToken  = ''
  let memberToken = ''
  let beKey  = ''   // 백엔드  PUBLISHED — 검색용 고유 키
  let feKey  = ''   // 프론트엔드 PUBLISHED
  let aiKey  = ''   // AI/ML  PUBLISHED
  let draftKey = '' // DRAFT — 목록에 안 보여야 함
  let beTitle  = ''
  let feTitle  = ''
  let aiTitle  = ''
  let draftTitle = ''

  // ── 시드 ──────────────────────────────────────────────────────
  test.beforeAll(async () => {
    const ctx = await pwRequest.newContext()
    adminToken  = await apiLogin(ctx, ADMIN)
    memberToken = await apiLogin(ctx, MEMBER)

    // 고유 키 (브라켓 없이 — DB LIKE 검색 오작동 방지)
    const ts = Date.now()
    beKey    = `E2E-BE-${ts}`
    feKey    = `E2E-FE-${ts}`
    aiKey    = `E2E-AI-${ts}`
    draftKey = `E2E-DRAFT-${ts}`

    beTitle    = `${beKey} Spring Boot 자동설정`
    feTitle    = `${feKey} Next.js AppRouter`
    aiTitle    = `${aiKey} LLM 파인튜닝`
    draftTitle = `${draftKey} 초안게시글`

    const content = (t: string) =>
      `## ${t}\n\nE2E 테스트 게시글입니다. 테스트 완료 후 자동 삭제됩니다.`

    const beId = await apiCreate(ctx, adminToken,  adminToken, { title: beTitle,    content: content(beTitle),    board: '백엔드',     category: 'Spring Boot', status: 'PUBLISHED', tags: ['e2e'] })
    const feId = await apiCreate(ctx, memberToken, adminToken, { title: feTitle,    content: content(feTitle),    board: '프론트엔드', category: 'Next.js',     status: 'PUBLISHED', tags: ['e2e'] })
    const aiId = await apiCreate(ctx, adminToken,  adminToken, { title: aiTitle,    content: content(aiTitle),    board: 'AI/ML',      category: 'LLM',         status: 'PUBLISHED', tags: ['e2e'] })
    const drId = await apiCreate(ctx, memberToken, adminToken, { title: draftTitle, content: content(draftTitle), board: '백엔드',     category: 'Redis',       status: 'DRAFT',     tags: ['e2e'] })

    createdIds.push(beId, feId, aiId, drId)
    await ctx.dispose()
  })

  // ── 정리 ──────────────────────────────────────────────────────
  test.afterAll(async () => {
    if (createdIds.length === 0) return
    const ctx = await pwRequest.newContext()
    const at  = await apiLogin(ctx, ADMIN)
    const mt  = await apiLogin(ctx, MEMBER)
    for (const id of createdIds) {
      try       { await apiDelete(ctx, at, id) }
      catch     { try { await apiDelete(ctx, mt, id) } catch { /* already gone */ } }
    }
    await ctx.dispose()
  })

  // ── PUBLISHED / DRAFT 노출 여부 ────────────────────────────────

  test('PUBLISHED 게시글은 키워드 검색으로 찾을 수 있다', async ({ page }) => {
    await page.goto('/articles')
    await page.getByPlaceholder('제목, 내용 검색').fill(beKey)
    await expect(
      page.locator('main a[href]').filter({ hasText: beKey }),
    ).toBeVisible({ timeout: 8_000 })
  })

  test('DRAFT 게시글은 아티클 목록에 나타나지 않는다', async ({ page }) => {
    await page.goto('/articles')
    await page.getByPlaceholder('제목, 내용 검색').fill(draftKey)
    await expect(
      page.locator('main').getByText('에 대한 검색 결과가 없습니다.'),
    ).toBeVisible({ timeout: 8_000 })
  })

  // ── 게시판 탭 필터 ─────────────────────────────────────────────

  test('백엔드 탭 — 백엔드 시드글이 보이고 프론트엔드 시드글은 안 보인다', async ({ page }) => {
    await page.goto('/articles')
    await page.getByRole('button', { name: '백엔드' }).click()

    // 백엔드 시드글 확인
    await page.getByPlaceholder('제목, 내용 검색').fill(beKey)
    await expect(page.locator('main a[href]').filter({ hasText: beKey })).toBeVisible({ timeout: 8_000 })

    // 프론트엔드 시드글은 백엔드 탭에서 검색 결과 없어야 함
    await page.getByPlaceholder('제목, 내용 검색').fill(feKey)
    await expect(page.locator('main').getByText('에 대한 검색 결과가 없습니다.')).toBeVisible({ timeout: 8_000 })
  })

  test('프론트엔드 탭 — 프론트엔드 시드글이 보이고 백엔드 시드글은 안 보인다', async ({ page }) => {
    await page.goto('/articles')
    await page.getByRole('button', { name: '프론트엔드' }).click()

    await page.getByPlaceholder('제목, 내용 검색').fill(feKey)
    await expect(page.locator('main a[href]').filter({ hasText: feKey })).toBeVisible({ timeout: 8_000 })

    await page.getByPlaceholder('제목, 내용 검색').fill(beKey)
    await expect(page.locator('main').getByText('에 대한 검색 결과가 없습니다.')).toBeVisible({ timeout: 8_000 })
  })

  test('AI/ML 탭 — AI/ML 시드글이 보이고 백엔드 시드글은 안 보인다', async ({ page }) => {
    await page.goto('/articles')
    await page.getByRole('button', { name: 'AI/ML' }).click()

    await page.getByPlaceholder('제목, 내용 검색').fill(aiKey)
    await expect(page.locator('main a[href]').filter({ hasText: aiKey })).toBeVisible({ timeout: 8_000 })

    await page.getByPlaceholder('제목, 내용 검색').fill(beKey)
    await expect(page.locator('main').getByText('에 대한 검색 결과가 없습니다.')).toBeVisible({ timeout: 8_000 })
  })

  test('전체 탭 — 모든 게시판 시드글이 키워드 검색으로 찾아진다', async ({ page }) => {
    await page.goto('/articles')
    await page.getByRole('button', { name: '백엔드' }).click()
    await page.getByRole('button', { name: '전체', exact: true }).click()

    for (const key of [beKey, feKey, aiKey]) {
      await page.getByPlaceholder('제목, 내용 검색').fill(key)
      await expect(page.locator('main a[href]').filter({ hasText: key })).toBeVisible({ timeout: 8_000 })
      await page.getByRole('button', { name: '검색어 지우기' }).click()
    }
  })

  // ── 키워드 검색 ────────────────────────────────────────────────

  test('시드 제목 키워드로 검색 시 해당 글이 나타난다', async ({ page }) => {
    await page.goto('/articles')
    await page.getByPlaceholder('제목, 내용 검색').fill(aiKey)
    await expect(page.locator('main a[href]').filter({ hasText: aiKey })).toBeVisible({ timeout: 8_000 })
  })

  test('존재하지 않는 키워드 검색 시 빈 결과 메시지가 표시된다', async ({ page }) => {
    await page.goto('/articles')
    const nonsense = `XNOEXIST${Date.now()}`
    await page.getByPlaceholder('제목, 내용 검색').fill(nonsense)
    await expect(page.locator('main').getByText('에 대한 검색 결과가 없습니다.')).toBeVisible({ timeout: 8_000 })
  })

  test('X 버튼으로 검색어 제거 시 전체 목록이 복구된다', async ({ page }) => {
    await page.goto('/articles')
    await waitForArticles(page)
    const before = await page.locator('main a[href]').count()

    await page.getByPlaceholder('제목, 내용 검색').fill(aiKey)
    await expect(page.locator('main a[href]').filter({ hasText: aiKey })).toBeVisible({ timeout: 8_000 })

    await page.getByRole('button', { name: '검색어 지우기' }).click()
    await waitForArticles(page)
    const after = await page.locator('main a[href]').count()
    expect(after).toBeGreaterThanOrEqual(before)
  })

  // ── 기수 필터 ──────────────────────────────────────────────────

  test('기수 선택 시 총 게시글 수가 전체 이하이고 에러가 없다', async ({ page }) => {
    await page.goto('/articles')
    await waitForArticles(page)
    // 로딩 완료 후 숫자 파싱
    await expect(page.locator('p.tabular-nums')).not.toContainText('—', { timeout: 5_000 })
    const totalText = await page.locator('p.tabular-nums').textContent()
    const total     = parseInt(totalText ?? '0')

    await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/blog/posts') && r.status() === 200),
      page.getByRole('button', { name: '14기' }).click(),
    ])
    await expect(page.locator('p.tabular-nums')).not.toContainText('—', { timeout: 5_000 })
    await expect(page.locator('text=게시글을 불러오지 못했습니다.')).not.toBeVisible()

    await expect(page.locator('p.tabular-nums')).not.toContainText('—', { timeout: 5_000 })
    const filteredText = await page.locator('p.tabular-nums').textContent()
    const filtered     = parseInt(filteredText ?? '0')
    expect(filtered).toBeLessThanOrEqual(total)
  })

  test('기수 필터 후 전체 기수로 돌아오면 게시글 수가 복구된다', async ({ page }) => {
    await page.goto('/articles')
    await waitForArticles(page)
    await expect(page.locator('p.tabular-nums')).not.toContainText('—', { timeout: 5_000 })
    const totalText = await page.locator('p.tabular-nums').textContent()

    await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/blog/posts') && r.status() === 200),
      page.getByRole('button', { name: '15기' }).click(),
    ])
    await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/blog/posts') && r.status() === 200),
      page.getByRole('button', { name: '전체 기수' }).click(),
    ])
    await waitForArticles(page)
    await expect(page.locator('p.tabular-nums')).not.toContainText('—', { timeout: 5_000 })

    const restoredText = await page.locator('p.tabular-nums').textContent()
    expect(restoredText).toBe(totalText)
  })

  // ── 작성자 필터 ────────────────────────────────────────────────

  test('게시글 상세 → 작성자 클릭 → 목록의 모든 글이 같은 작성자다', async ({ page }) => {
    await page.goto('/articles')
    await page.getByPlaceholder('제목, 내용 검색').fill(beKey)
    await expect(page.locator('main a[href]').filter({ hasText: beKey })).toBeVisible({ timeout: 8_000 })
    await page.locator('main a[href]').filter({ hasText: beKey }).click()

    await page.waitForURL(/\/articles\/\d+/)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })

    const authorBtn  = page.locator('header button').first()
    await expect(authorBtn).toBeVisible({ timeout: 8_000 })
    const authorName = (await authorBtn.textContent())?.trim() ?? ''

    await authorBtn.click()
    await page.waitForURL('/articles')
    await expect(page.locator('text=작성자 필터:')).toBeVisible({ timeout: 5_000 })
    await waitForArticles(page)

    const links = page.locator('main a[href]')
    const count = await links.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(links.nth(i)).toContainText(authorName)
    }
  })

  test('작성자 필터 배지 X 클릭 시 전체 목록이 복구된다', async ({ page }) => {
    await page.goto('/articles')
    await page.getByPlaceholder('제목, 내용 검색').fill(beKey)
    await page.locator('main a[href]').filter({ hasText: beKey }).click()
    await page.waitForURL(/\/articles\/\d+/)
    await page.locator('header button').first().click()
    await page.waitForURL('/articles')
    await expect(page.locator('text=작성자 필터:')).toBeVisible({ timeout: 5_000 })

    await page.getByRole('button', { name: '작성자 필터 해제' }).click()
    await expect(page.locator('text=작성자 필터:')).not.toBeVisible({ timeout: 3_000 })

    // 필터 해제 후 프론트엔드 시드글도 검색 가능해야 함
    await page.getByPlaceholder('제목, 내용 검색').fill(feKey)
    await expect(page.locator('main a[href]').filter({ hasText: feKey })).toBeVisible({ timeout: 8_000 })
  })

  // ── 복합 필터 ──────────────────────────────────────────────────

  test('AI/ML 탭 + AI 키워드 → AI 시드글만 보이고 백엔드 시드글은 안 보인다', async ({ page }) => {
    await page.goto('/articles')
    await page.getByRole('button', { name: 'AI/ML' }).click()
    await page.getByPlaceholder('제목, 내용 검색').fill(aiKey)
    await expect(page.locator('main a[href]').filter({ hasText: aiKey })).toBeVisible({ timeout: 8_000 })
    await expect(page.locator('main a[href]').filter({ hasText: beKey })).not.toBeVisible()
  })

  test('키워드 초기화 후 게시판 탭 필터가 유지된다', async ({ page }) => {
    await page.goto('/articles')
    await page.getByRole('button', { name: '프론트엔드' }).click()
    await page.getByPlaceholder('제목, 내용 검색').fill(feKey)
    await expect(page.locator('main a[href]').filter({ hasText: feKey })).toBeVisible({ timeout: 8_000 })

    await page.getByRole('button', { name: '검색어 지우기' }).click()

    // 프론트엔드 탭 유지 → 백엔드 시드글은 없어야 함
    await page.getByPlaceholder('제목, 내용 검색').fill(beKey)
    await expect(page.locator('main').getByText('에 대한 검색 결과가 없습니다.')).toBeVisible({ timeout: 8_000 })
  })

  // ── 로딩 플리커 회귀 ───────────────────────────────────────────

  test('/articles 진입 시 스피너 중 빈 상태 메시지가 동시에 노출되지 않는다', async ({ page }) => {
    await page.goto('/articles')
    // 로딩이 너무 빠르면 스피너가 안 보일 수 있으므로 spinner 대기만 허용
    const spinnerAppeared = await expect(page.locator('.animate-spin'))
      .toBeVisible({ timeout: 500 })
      .then(() => true)
      .catch(() => false)
    if (spinnerAppeared) {
      await expect(page.locator('text=아티클이 아직 없습니다')).not.toBeVisible()
    }
    await waitForArticles(page)
  })
})
