const { chromium } = require("playwright")
async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto("https://freelance-alert.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: "C:/Users/yehud/AppData/Local/Temp/site-home.png", fullPage: true })
  await page.goto("https://freelance-alert.vercel.app/signup", { waitUntil: "domcontentloaded", timeout: 20000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: "C:/Users/yehud/AppData/Local/Temp/site-signup.png", fullPage: true })
  await browser.close()
}
main().catch(console.error)
