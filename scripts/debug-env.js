const { chromium } = require("playwright")
const path = require("path")
async function main() {
  const ctx = await chromium.launchPersistentContext(
    path.join(process.env.LOCALAPPDATA, "BraveSoftware", "Brave-Browser", "User Data"),
    { headless: false, executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe", args: ["--no-first-run"] }
  )
  const page = await ctx.newPage()
  await page.goto("https://freelance-alert.vercel.app/signup", { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(3000)

  // Check what env vars are baked into the bundle
  const result = await page.evaluate(() => {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      keyChars: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? [...process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY].map((c, i) => ({ i, c, code: c.charCodeAt(0) })).filter(x => x.code > 127)
        : []
    }
  })
  console.log("URL:", result.url)
  console.log("KEY:", result.key)
  console.log("Non-ASCII chars in key:", JSON.stringify(result.keyChars))
  if (result.key) {
    for (let i = 0; i < result.key.length; i++) {
      const c = result.key.charCodeAt(i)
      if (c > 127) console.log("NON-ASCII at pos", i, ":", c, result.key[i])
    }
  }
  
  await page.waitForTimeout(3000)
  await ctx.close()
}
main().catch(console.error)
