const { chromium } = require('playwright')
const path = require('path')

async function main() {
  const braveUserData = path.join(process.env.LOCALAPPDATA, 'BraveSoftware', 'Brave-Browser', 'User Data')
  const context = await chromium.launchPersistentContext(braveUserData, {
    headless: false,
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    args: ['--no-first-run', '--no-default-browser-check'],
  })
  const page = await context.newPage()
  await page.goto('https://supabase.com/dashboard/project/tghrxopjjcdleqeaxyju/settings/api', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'C:\\Users\\yehud\\AppData\\Local\\Temp\\supa-api.png', fullPage: true })

  // Try to get the keys from the page
  const text = await page.textContent('body')
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5)
  
  // Look for keys
  for (const line of lines) {
    if (line.startsWith('sb_publishable_') || line.startsWith('eyJ') || line.includes('anon') || line.includes('service_role')) {
      console.log('FOUND:', line.substring(0, 80))
    }
  }

  await page.waitForTimeout(5000)
  await context.close()
}
main().catch(console.error)
