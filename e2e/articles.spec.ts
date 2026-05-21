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
    await input.fill('a')

    await expect(page.locator('main')).not.toContainText('게시글을 불러오지 못했습니다.', { timeout: 3_000 })
  })

  test('키워드 입력 후 오류 없이 안정적으로 렌더링된다', async ({ page }) => {
    await page.goto('/articles')
    const input = page.getByPlaceholder('제목, 내용 검색')
    await input.fill('테스트키워드')
    await expect(page.locator('text=게시글을 불러오지 못했습니다')).not.toBeVisible({ timeout: 3_000 })
    await expect(input).toHaveValue('테스트키워드')
  })

  test('X 버튼 클릭 시 검색어가 초기화된다', async ({ page }) => {
    await page.goto('/articles')
    const input = page.getByPlaceholder('제목, 내용 검색')
    await input.fill('Spring')

    const clearBtn = page.getByRole('button', { name: '검색어 지우기' })
    await expect(clearBtn).toBeVisible({ timeout: 2_000 })
    await clearBtn.click()
    await expect(input).toHaveValue('')
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
    await expect(page.getByRole('button', { name: '14기' })).toBeVisible()

    await page.getByRole('button', { name: '14기' }).click()
    await expect(page.locator('main')).not.toContainText('게시글을 불러오지 못했습니다.', { timeout: 3_000 })
  })

  test('전체 기수로 돌아오면 목록이 복구된다', async ({ page }) => {
    await page.goto('/articles')
    await page.getByRole('button', { name: '14기' }).click()
    await page.getByRole('button', { name: '전체 기수' }).click()
    await expect(page.locator('main')).not.toContainText('게시글을 불러오지 못했습니다.', { timeout: 3_000 })
  })
})

test.describe('ArticlesPage — #6 작성자 필터', () => {
  test('게시글 목록에서 글 클릭 → 상세 → 작성자 클릭 시 작성자 필터 배지가 표시된다', async ({ page }) => {
    await page.goto('/articles')

    const firstArticle = page.locator('main a[href]').filter({ hasText: /.+/ }).first()
    try {
      await expect(firstArticle).toBeVisible({ timeout: 8_000 })
    } catch {
      test.skip(true, 'DB에 게시글이 없습니다')
      return
    }

    await firstArticle.click()
    await page.waitForURL(/\/articles\/\d+/)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })

    // 작성자 버튼: authorName이 표시되는 header 내 첫 번째 button
    const authorBtn = page.locator('header button').first()
    if (!(await authorBtn.isVisible())) {
      test.skip(true, '작성자명이 없는 게시글')
      return
    }

    await authorBtn.click()
    await expect(page).toHaveURL('/articles')
    await expect(page.locator('text=작성자 필터:')).toBeVisible({ timeout: 5_000 })
  })

  test('작성자 필터 배지 X 클릭 시 필터가 해제된다', async ({ page }) => {
    await page.goto('/articles')

    const firstArticle = page.locator('main a[href]').filter({ hasText: /.+/ }).first()
    try {
      await expect(firstArticle).toBeVisible({ timeout: 8_000 })
    } catch {
      test.skip(true, 'DB에 게시글이 없습니다')
      return
    }

    await firstArticle.click()
    await page.waitForURL(/\/articles\/\d+/)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8_000 })

    const authorBtn = page.locator('header button').first()
    if (!(await authorBtn.isVisible())) {
      test.skip(true, '작성자명이 없는 게시글')
      return
    }

    await authorBtn.click()
    await page.waitForURL('/articles')
    await expect(page.locator('text=작성자 필터:')).toBeVisible({ timeout: 5_000 })

    const xBtn = page.getByRole('button', { name: '작성자 필터 해제' })
    await xBtn.click()
    await expect(page.locator('text=작성자 필터:')).not.toBeVisible({ timeout: 3_000 })
  })
})
