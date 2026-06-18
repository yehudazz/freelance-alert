const { chromium } = require("playwright")
const path = require("path")
async function main() {
  const ctx = await chromium.launchPersistentContext(
    path.join(process.env.LOCALAPPDATA, "BraveSoftware", "Brave-Browser", "User Data"),
    { headless: true, executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe", args: ["--no-first-run"] }
  )
  const page = await ctx.newPage()
  page.on("response", async resp => {
    if (resp.url().includes("_next/static") && resp.url().endsWith(".js")) {
      try {
        const body = await resp.text()
        const idx = body.indexOf("sb_publishable_")
        if (idx > -1) {
          const snippet = body.substring(idx - 5, idx + 60)
          console.log("KEY IN BUNDLE:", JSON.stringify(snippet))
        }
      } catch(e) {}
    }
  })
  await page.goto("https://freelance-alert.vercel.app/signup", { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(4000)
  await ctx.close()
}
main().catch(console.error)
