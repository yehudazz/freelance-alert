const { chromium } = require("playwright")
const path = require("path")
async function main() {
  const ctx = await chromium.launchPersistentContext(
    path.join(process.env.LOCALAPPDATA, "BraveSoftware", "Brave-Browser", "User Data"),
    {
      headless: false,
      executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
      args: ["--no-first-run", "--new-window"],
    }
  )
  const page = await ctx.newPage()
  await page.goto("https://supabase.com/dashboard/project/tghrxopjjcdleqeaxyju/auth/url-configuration", { waitUntil: "domcontentloaded", timeout: 20000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: "C:/Users/yehud/AppData/Local/Temp/supa-url.png", fullPage: true })

  // Find the Site URL input and update it
  const inputs = await page.locator("input").all()
  for (const input of inputs) {
    const val = await input.inputValue().catch(() => "")
    console.log("Input:", val)
    if (val.includes("localhost") || val === "http://localhost:3000") {
      await input.click({ clickCount: 3 })
      await input.fill("https://freelance-alert.vercel.app")
      console.log("Updated site URL")
    }
  }

  await page.waitForTimeout(1000)
  await page.screenshot({ path: "C:/Users/yehud/AppData/Local/Temp/supa-url2.png", fullPage: true })

  // Click save button
  const saveBtn = await page.locator("button:has-text('Save'), button:has-text('Update')").first()
  if (await saveBtn.isVisible()) {
    await saveBtn.click()
    console.log("Saved")
    await page.waitForTimeout(2000)
  }

  await page.screenshot({ path: "C:/Users/yehud/AppData/Local/Temp/supa-url3.png", fullPage: true })
  await page.waitForTimeout(5000)
  // Don't close - leave browser open
  console.log("Done")
}
main().catch(console.error)
