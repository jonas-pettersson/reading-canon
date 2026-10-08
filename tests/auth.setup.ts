import { test as setup } from '@playwright/test'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const authFile = 'playwright/.auth/user.json'

const CURATOR_EMAIL = process.env.CURATOR_EMAIL
const CURATOR_PASSWORD = process.env.CURATOR_PASSWORD

if (!CURATOR_EMAIL || !CURATOR_PASSWORD) {
  throw new Error('CURATOR_EMAIL and CURATOR_PASSWORD must be set in .env.local')
}

setup('authenticate', async ({ page }) => {
  // Perform authentication steps
  await page.goto('http://localhost:5173/login')
  await page.fill('input#email', CURATOR_EMAIL)
  await page.fill('input#password', CURATOR_PASSWORD)
  await page.click('button[type="submit"]')

  // Wait until the page receives the cookies
  await page.waitForURL('http://localhost:5173/')

  // End of authentication steps
  await page.context().storageState({ path: authFile })
})
