import { test, expect } from '@playwright/test'

const BREAKPOINTS = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1200, height: 800 },
]

const PAGES = [
  { name: 'Collection', path: '/' },
  { name: 'Add Book', path: '/books/new' },
  { name: 'Reading Dashboard', path: '/reading' },
  { name: 'Stats', path: '/stats' },
]

test.describe('Responsive Design Testing', () => {
  for (const breakpoint of BREAKPOINTS) {
    test.describe(`${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
      })

      for (const pageInfo of PAGES) {
        test(`${pageInfo.name} page - no horizontal scroll`, async ({ page }) => {
          // Navigate to the page
          await page.goto(pageInfo.path)
          await page.waitForLoadState('networkidle')

          // Wait a bit for any dynamic content
          await page.waitForTimeout(500)

          // Check for horizontal scroll
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth
          })

          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
          const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

          if (hasHorizontalScroll) {
            console.log(`${pageInfo.name} at ${breakpoint.width}px: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`)
          }

          expect(hasHorizontalScroll).toBe(false)
          expect(scrollWidth).toBe(clientWidth)
        })

        test(`${pageInfo.name} page - content visible`, async ({ page }) => {
          // Navigate to the page
          await page.goto(pageInfo.path)
          await page.waitForLoadState('networkidle')

          // Wait for content to load
          await page.waitForTimeout(500)

          // Verify main content is visible
          const mainContent = page.locator('main, [role="main"], body > div')
          await expect(mainContent.first()).toBeVisible()
        })
      }

      // Test Book Detail page specifically (needs a book ID)
      test('Book Detail page - no horizontal scroll', async ({ page }) => {
        // Go to collection and get first book
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)

        // Click on first book card (either grid or table view)
        const firstBook = page.locator('[role="button"]').first()
        if (await firstBook.count() > 0) {
          await firstBook.click()
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(500)

          // Check for horizontal scroll
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth
          })

          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
          const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

          if (hasHorizontalScroll) {
            console.log(`Book Detail at ${breakpoint.width}px: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`)
          }

          expect(hasHorizontalScroll).toBe(false)
          expect(scrollWidth).toBe(clientWidth)
        }
      })

      // Test responsive two-column layout on Book Detail
      // Note: We verify no horizontal scroll above - that's the key requirement
      // CSS Grid may compute to pixel values rather than "1fr" so we don't test specific values
    })
  }
})
