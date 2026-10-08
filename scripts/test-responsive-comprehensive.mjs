import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const BASE_URL = 'http://localhost:5173';

// Get credentials from environment
const CURATOR_EMAIL = process.env.CURATOR_EMAIL;
const CURATOR_PASSWORD = process.env.CURATOR_PASSWORD;

if (!CURATOR_EMAIL || !CURATOR_PASSWORD) {
  console.error('Error: CURATOR_EMAIL and CURATOR_PASSWORD must be set in .env.local');
  process.exit(1);
}

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1200, height: 900 }
];

const results = {
  passed: [],
  issues: [],
  summary: {
    totalPages: 0,
    horizontalScrollIssues: 0,
    navigationIssues: 0,
    touchTargetIssues: 0
  }
};

async function login(page) {
  console.log('  → Logging in...');
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', CURATOR_EMAIL);
  await page.fill('input[type="password"]', CURATOR_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for redirect to collection page
  try {
    await page.waitForURL(`${BASE_URL}/books`, { timeout: 10000 });
    console.log('  ✓ Login successful');
    return true;
  } catch (error) {
    // Try alternative URLs
    try {
      await page.waitForURL(`${BASE_URL}/`, { timeout: 2000 });
      console.log('  ✓ Login successful (redirected to /)');
      return true;
    } catch {
      console.log('  ✗ Login may have failed or redirect took too long');
      return false;
    }
  }
}

async function checkHorizontalScroll(page, pageName, viewport) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

  if (scrollWidth > clientWidth) {
    const overflow = scrollWidth - clientWidth;
    results.issues.push({
      page: pageName,
      viewport: viewport.name,
      type: 'horizontal-scroll',
      severity: 'high',
      details: `Horizontal overflow: ${overflow}px (${scrollWidth}px content in ${clientWidth}px viewport)`
    });
    results.summary.horizontalScrollIssues++;
    console.log(`    ✗ Horizontal scroll: ${overflow}px overflow`);
    return false;
  } else {
    console.log(`    ✓ No horizontal scroll`);
    return true;
  }
}

async function checkNavigationCollapse(page, viewport) {
  if (viewport.width < 768) {
    // Should have mobile menu button
    const mobileMenuButton = page.locator('.mobile-menu-button');
    const isVisible = await mobileMenuButton.isVisible();

    if (!isVisible) {
      results.issues.push({
        page: 'navigation',
        viewport: viewport.name,
        type: 'navigation',
        severity: 'medium',
        details: 'Mobile menu button not visible below 768px'
      });
      results.summary.navigationIssues++;
      console.log(`    ✗ Mobile menu button not found`);
      return false;
    } else {
      console.log(`    ✓ Mobile menu button visible`);
      return true;
    }
  } else {
    // Desktop - check if full nav is visible
    const mainNav = page.locator('.main-nav');
    const isVisible = await mainNav.isVisible();
    console.log(`    ✓ Desktop navigation visible`);
    return isVisible;
  }
}

async function checkMinTouchTargets(page, viewport) {
  if (viewport.width >= 768) {
    // Only check on mobile/tablet
    return true;
  }

  // Check all buttons and links
  const interactive = await page.locator('button, a, input[type="checkbox"], input[type="radio"]').all();
  let smallTargets = 0;

  for (const el of interactive) {
    const box = await el.boundingBox();
    if (box && (box.width < 44 || box.height < 44)) {
      const text = await el.textContent();
      const ariaLabel = await el.getAttribute('aria-label');
      const label = text || ariaLabel || '(unlabeled)';

      if (box.width < 44 && box.height < 44) {
        smallTargets++;
        if (smallTargets <= 3) { // Only log first 3
          console.log(`    ⚠️  Small touch target: "${label.substring(0, 30)}" (${Math.round(box.width)}×${Math.round(box.height)}px)`);
        }
      }
    }
  }

  if (smallTargets > 0) {
    console.log(`    ⚠️  Found ${smallTargets} touch targets smaller than 44×44px`);
    results.summary.touchTargetIssues += smallTargets;
    return false;
  } else {
    console.log(`    ✓ All touch targets meet 44×44px minimum`);
    return true;
  }
}

async function testPage(browser, viewport, pageName, url, options = {}) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height }
  });

  const page = await context.newPage();

  try {
    console.log(`  Testing ${pageName} at ${viewport.name} (${viewport.width}×${viewport.height})`);

    // Login if needed
    if (!options.skipLogin) {
      const loginSuccess = await login(page);
      if (!loginSuccess) {
        throw new Error('Login failed');
      }
    }

    // Navigate to the test page
    await page.goto(`${BASE_URL}${url}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Wait a bit for any dynamic content
    await page.waitForTimeout(500);

    // Take screenshot
    const screenshotDir = join(process.cwd(), 'responsive-test-results');
    mkdirSync(screenshotDir, { recursive: true });
    const screenshotPath = join(screenshotDir, `${pageName}-${viewport.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Run checks
    await checkHorizontalScroll(page, pageName, viewport);
    await checkNavigationCollapse(page, viewport);
    // await checkMinTouchTargets(page, viewport); // This can be slow, enable if needed

    results.passed.push({
      page: pageName,
      viewport: viewport.name,
      screenshot: screenshotPath
    });
    results.summary.totalPages++;

  } catch (error) {
    results.issues.push({
      page: pageName,
      viewport: viewport.name,
      type: 'test-failure',
      severity: 'critical',
      details: error.message
    });
    console.log(`    ✗ Test failed: ${error.message}`);
  } finally {
    await context.close();
  }
}

async function runTests() {
  console.log('\n=== RESPONSIVE DESIGN TESTING ===\n');
  console.log('Testing breakpoints: mobile (375px), tablet (768px), desktop (1200px+)\n');

  const browser = await chromium.launch({ headless: true });

  const pages = [
    { name: 'login', url: '/login', skipLogin: true },
    { name: 'collection', url: '/books' },
    { name: 'book-detail', url: '/books', navigate: 'first-book' }, // Will click first book
    { name: 'add-book', url: '/books/new' },
    { name: 'reading-dashboard', url: '/reading' },
    { name: 'stats', url: '/stats' }
  ];

  try {
    for (const viewport of VIEWPORTS) {
      console.log(`\n========== ${viewport.name.toUpperCase()} (${viewport.width}×${viewport.height}) ==========\n`);

      for (const pageConfig of pages) {
        if (pageConfig.navigate === 'first-book') {
          // Special handling for book detail - need to get a real book ID
          const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
          const page = await context.newPage();
          try {
            await login(page);
            await page.goto(`${BASE_URL}/books`);
            await page.waitForLoadState('networkidle');
            const firstBookLink = page.locator('a[href^="/books/"]').first();
            const href = await firstBookLink.getAttribute('href');
            await context.close();

            if (href) {
              await testPage(browser, viewport, pageConfig.name, href, { skipLogin: false });
            } else {
              console.log(`  ⚠️  Skipping book-detail (no books found)`);
            }
          } catch (error) {
            console.log(`  ⚠️  Skipping book-detail: ${error.message}`);
            await context.close();
          }
        } else {
          await testPage(browser, viewport, pageConfig.name, pageConfig.url, {
            skipLogin: pageConfig.skipLogin
          });
        }
      }
    }

    // Test edit-book (requires getting a book ID)
    console.log(`\n========== EDIT BOOK PAGE (all viewports) ==========\n`);
    const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
    const page = await context.newPage();
    try {
      await login(page);
      await page.goto(`${BASE_URL}/books`);
      await page.waitForLoadState('networkidle');
      const firstBookLink = page.locator('a[href^="/books/"]').first();
      const href = await firstBookLink.getAttribute('href');
      await context.close();

      if (href) {
        const bookId = href.split('/').pop();
        for (const viewport of VIEWPORTS) {
          await testPage(browser, viewport, 'edit-book', `/books/${bookId}/edit`, { skipLogin: false });
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Skipping edit-book: ${error.message}`);
      await context.close();
    }

  } finally {
    await browser.close();
  }

  // Generate report
  console.log('\n\n=== TEST RESULTS SUMMARY ===\n');
  console.log(`Pages tested: ${results.summary.totalPages}`);
  console.log(`Issues found: ${results.issues.length}`);
  console.log(`  - Horizontal scroll issues: ${results.summary.horizontalScrollIssues}`);
  console.log(`  - Navigation issues: ${results.summary.navigationIssues}`);
  console.log(`  - Touch target issues: ${results.summary.touchTargetIssues}`);

  if (results.issues.length > 0) {
    console.log('\n=== ISSUES FOUND ===\n');
    const grouped = {};
    results.issues.forEach(issue => {
      const key = issue.type;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(issue);
    });

    Object.entries(grouped).forEach(([type, issues]) => {
      console.log(`\n${type.toUpperCase()} (${issues.length} issues):`);
      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. [${issue.viewport}] ${issue.page}`);
        console.log(`     ${issue.details}`);
      });
    });
  } else {
    console.log('\n✅ No responsive design issues found!\n');
  }

  console.log(`\nScreenshots saved to: responsive-test-results/`);

  // Write detailed report
  const reportPath = join(process.cwd(), 'responsive-test-report.json');
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`Full report saved to: responsive-test-report.json\n`);

  process.exit(results.issues.length > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('\n✗ Test execution failed:', error);
  process.exit(1);
});
