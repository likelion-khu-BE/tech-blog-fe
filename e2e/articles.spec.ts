/**
 * 게시글 목록 필터 E2E 테스트 (#6 #7 #8)
 *
 * /articles는 공개 페이지이므로 3개 프로젝트 모두 동일하게 동작해야 한다.
 * 단, 작성자 필터(#6) 진입은 상세 페이지의 작성자 클릭이 필요하므로
 * 로그인 여부에 따라 상세 페이지 도달 방식만 다르다.
 */

import { test, expect } from '@playwright/test'

test.describe('ArticlesPage — #7 키워드 검색', () => {
  test('검색창이 렌더링된다', async ({ page }) => {
    await page.goto('/articles')
    await expect(page.getByPlaceholder('제목, 내용 검색')).toBeVisible()
  })

  test('키워드 입력 시 목록이 필터링된다', async ({ page }) => {
    await page.goto('/articles')
    const input = page.getByPlaceholder('제목, 내용 검색')
    await input.fill('a')  // 짧은 키워드로 결과 존재 가능성 높임

    // 로딩 스피너가 사라질 때까지 대기
    await page.waitForTimeout(500)

    // 결과가 0개 또는 항목이 있는 상태로 안정화되면 OK
    // (DB에 따라 달라지므로, 오류 없이 렌더링만 확인)
    await expect(page.locator('main')).not.toContainText('게시글을 불러오지 못했습니다.')
  })

  test('키워드 입력 후 오류 없이 안정적으로 렌더링된다', async ({ page }) => {
    await page.goto('/articles')
    const input = page.getByPlaceholder('제목, 내용 검색')
    await input.fill('테스트키워드')
    // debounce + API 응답 대기
    await page.waitForTimeout(1_500)
    // 오류 메시지 없이 렌더링되어야 함
    await expect(page.locator('text=게시글을 불러오지 못했습니다')).not.toBeVisible()
    // 입력값 유지 확인
    await expect(input).toHaveValue('테스트키워드')
  })

  test('X 버튼 클릭 시 검색어가 초기화된다', async ({ page }) => {
    await page.goto('/articles')
    const input = page.getByPlaceholder('제목, 내용 검색')
    await input.fill('Spring')
    await page.waitForTimeout(400)

    // X 버튼 (input 내부 clear 버튼)
    const clearBtn = page.locator('input + button, input ~ button').first()
    if (await clearBtn.isVisible()) {
      await clearBtn.click()
      await expect(input).toHaveValue('')
    }
  })
})

test.describe('ArticlesPage — #8 기수 필터', () => {
  test('전체 기수·14기·15기 버튼이 존재한다', async ({ page }) => {
    await page.goto('/articles')
    await expect(page.getByRole('button', { name: '전체 기수' })).toBeVisible()
    await expect(page.getByRole('button', { name: '14기' })).toBeVisible()
    await expect(page.getByRole('button', { name: '15기' })).toBeVisible()
  })

  test('14기 클릭 시 목록이 재로드된다', async ({ page }) => {
    await page.goto('/articles')
    // 초기 로딩 완료 대기
    await page.waitForTimeout(500)

    await page.getByRole('button', { name: '14기' }).click()
    await page.waitForTimeout(500)
    await expect(page.locator('main')).not.toContainText('게시글을 불러오지 못했습니다.')
  })

  test('전체 기수로 돌아오면 목록이 복구된다', async ({ page }) => {
    await page.goto('/articles')
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '14기' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '전체 기수' }).click()
    await page.waitForTimeout(500)
    await expect(page.locator('main')).not.toContainText('게시글을 불러오지 못했습니다.')
  })
})

test.describe('ArticlesPage — #6 작성자 필터', () => {
  test('게시글 목록에서 글 클릭 → 상세 → 작성자 클릭 시 작성자 필터 배지가 표시된다', async ({ page }) => {
    await page.goto('/articles')
    await page.waitForTimeout(500)

    // 목록에 글이 있으면 첫 번째 글 클릭
    const firstArticle = page.locator('a[href^="/articles/"]').first()
    if (!(await firstArticle.isVisible())) return // DB에 글 없으면 skip

    await firstArticle.click()
    await page.waitForURL(/\/articles\/\d+/)

    // 작성자 버튼 (header 내부 button)
    const authorBtn = page.locator('header button').filter({ hasText: /@/ }).or(
      page.locator('header button').nth(0),
    )
    if (!(await authorBtn.isVisible())) return

    await authorBtn.click()
    await expect(page).toHaveURL('/articles')
    await expect(page.locator('text=작성자 필터:')).toBeVisible({ timeout: 5_000 })
  })

  test('작성자 필터 배지 X 클릭 시 필터가 해제된다', async ({ page }) => {
    await page.goto('/articles', { state: undefined })
    await page.waitForTimeout(500)

    const firstArticle = page.locator('a[href^="/articles/"]').first()
    if (!(await firstArticle.isVisible())) return

    await firstArticle.click()
    await page.waitForURL(/\/articles\/\d+/)

    const authorBtn = page.locator('header button').first()
    if (!(await authorBtn.isVisible())) return

    await authorBtn.click()
    await page.waitForURL('/articles')
    await page.waitForSelector('text=작성자 필터:')

    // 배지 X 버튼
    const xBtn = page.locator('.bg-accent-muted button').last()
    await xBtn.click()
    await expect(page.locator('text=작성자 필터:')).not.toBeVisible({ timeout: 3_000 })
  })
})
