import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:5173';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1200, height: 900 }
];

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: false }); // Set to false to see the browser

  const screenshotDir = join(process.cwd(), 'responsive-screenshots');
  mkdirSync(screenshotDir, { recursive: true });

  for (const viewport of VIEWPORTS) {
    console.log(`\nCapturing ${viewport.name} (${viewport.width}x${viewport.height})`);

    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });
    const page = await context.newPage();

    // Just capture login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    const screenshotPath = join(screenshotDir, `login-${viewport.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Check horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    console.log(`  ScrollWidth: ${scrollWidth}px, ClientWidth: ${clientWidth}px`);
    if (scrollWidth > clientWidth) {
      console.log(`  ⚠️ Horizontal scroll detected!`);
    } else {
      console.log(`  ✅ No horizontal scroll`);
    }

    await context.close();
  }

  await browser.close();
  console.log(`\nScreenshots saved to: ${screenshotDir}/`);
}

takeScreenshots().catch(console.error);
