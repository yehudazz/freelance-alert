const { chromium } = require("playwright")
const path = require("path")
async function main() {
  const ctx = await chromium.launchPersistentContext(
    path.join(process.env.LOCALAPPDATA, "BraveSoftware", "Brave-Browser", "User Data"),
    { headless: false, executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe", args: ["--no-first-run"] }
  )
  const page = await ctx.newPage()
  page.on("console", msg => { if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text().substring(0,300)) })
  page.on("pageerror", err => console.log("PAGE ERROR:", err.message.substring(0,300)))
  page.on("response", async resp => {
    if (resp.url().includes("supabase") && resp.status() >= 400) {
      try { console.log("SUPABASE ERROR", resp.status(), resp.url().substring(0,100), await resp.text().catch(()=>"")) } catch(e) {}
    }
  })

  await page.goto("https://freelance-alert.vercel.app/signup", { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(2000)

  await page.fill("input[type=email]", "test@example.com")
  await page.fill("input[type=password]", "password123")
  const pwInputs = await page.locator("input[type=password]").all()
  if (pwInputs.length > 1) await pwInputs[1].fill("password123")
  await page.waitForTimeout(500)
  await page.click("button[type=submit]")
  await page.waitForTimeout(5000)
  await page.screenshot({ path: "C:/Users/yehud/AppData/Local/Temp/signup-result.png", fullPage: true })
  await ctx.close()
}
main().catch(console.error)
