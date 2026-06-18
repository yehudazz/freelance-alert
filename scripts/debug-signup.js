const { chromium } = require("playwright")
const path = require("path")
async function main() {
  const ctx = await chromium.launchPersistentContext(
    path.join(process.env.LOCALAPPDATA, "BraveSoftware", "Brave-Browser", "User Data"),
    { headless: false, executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe", args: ["--no-first-run"] }
  )
  const page = await ctx.newPage()

  // Intercept all fetch requests and log headers
  page.on("request", req => {
    if (req.url().includes("supabase")) {
      console.log("REQUEST:", req.url().substring(0, 80))
      const headers = req.headers()
      Object.entries(headers).forEach(([k, v]) => {
        // Check for non-ASCII
        for (let i = 0; i < v.length; i++) {
          if (v.charCodeAt(i) > 127) {
            console.log("  NON-ASCII HEADER:", k, "=", JSON.stringify(v.substring(0, 50)), "char at", i, "=", v.charCodeAt(i))
          }
        }
      })
    }
  })

  page.on("console", msg => console.log("BROWSER:", msg.text().substring(0, 200)))
  page.on("pageerror", err => console.log("PAGE ERROR:", err.message.substring(0, 300)))

  await page.goto("https://freelance-alert.vercel.app/signup", { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(3000)

  // Fill and submit signup form
  await page.fill("input[type=email]", "test123@example.com")
  await page.fill("input[type=password]", "password123")
  const pwInputs = await page.locator("input[type=password]").all()
  if (pwInputs.length > 1) await pwInputs[1].fill("password123")
  
  await page.waitForTimeout(1000)
  await page.click("button[type=submit]")
  await page.waitForTimeout(4000)

  await ctx.close()
}
main().catch(console.error)
