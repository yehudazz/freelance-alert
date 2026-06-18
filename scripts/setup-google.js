const { chromium } = require("playwright")
async function main() {
  const browser = await chromium.launch({ headless: false })
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  await page.goto("https://supabase.com/dashboard/project/tghrxopjjcdleqeaxyju/auth/providers", { waitUntil: "domcontentloaded", timeout: 20000 })
  await page.waitForTimeout(180000)
  await browser.close()
}
main().catch(console.error)
