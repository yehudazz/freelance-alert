const { chromium } = require('playwright')
const path = require('path')
async function main() {
  const ctx = await chromium.launchPersistentContext(
    path.join(process.env.LOCALAPPDATA, 'BraveSoftware', 'Brave-Browser', 'User Data'),
    { headless: false, executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe', args: ['--no-first-run'] }
  )
  const page = await ctx.newPage()
  await page.goto('https://supabase.com/dashboard/project/tghrxopjjcdleqeaxyju/settings/api-keys', { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.waitForTimeout(4000)
  await page.screenshot({ path: 'C:/Users/yehud/AppData/Local/Temp/supa-k1.png', fullPage: true })

  const allText = await page.evaluate(() => {
    const results = []
    document.querySelectorAll('input, code, span, p, td, div').forEach(el => {
      const v = (el.value || el.textContent || '').trim()
      if ((v.includes('sb_publishable') || v.includes('sb_secret') || v.startsWith('eyJ')) && v.length > 20 && v.length < 200) {
        results.push(v.substring(0, 150))
      }
    })
    return [...new Set(results)]
  })
  console.log('Keys found:', allText.length)
  allText.forEach(v => console.log('KEY:', v))

  await page.waitForTimeout(10000)
  await ctx.close()
}
main().catch(console.error)
