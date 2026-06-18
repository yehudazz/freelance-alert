const { chromium } = require('playwright')
const path = require('path')

async function main() {
  const braveUserData = path.join(process.env.LOCALAPPDATA, 'BraveSoftware', 'Brave-Browser', 'User Data')

  const context = await chromium.launchPersistentContext(braveUserData, {
    headless: false,
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    args: ['--no-first-run', '--no-default-browser-check', '--profile-directory=Default'],
    viewport: { width: 1280, height: 900 },
  })

  const page = await context.newPage()
  await page.goto('https://old.reddit.com/prefs/apps', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // Open the create form
  const createBtn = await page.$('button:text("create")')
  if (createBtn) await createBtn.click()
  await page.waitForTimeout(1000)

  // Fill name
  const nameInput = await page.$('input[name="name"]')
  if (nameInput) { await nameInput.click({ clickCount: 3 }); await nameInput.type('FreelanceAlert') }

  // Select script
  const scriptRadio = await page.$('input[value="script"]')
  if (scriptRadio) await scriptRadio.click()

  // Fill redirect uri
  const redirectInput = await page.$('#redirect_uri')
  if (redirectInput) { await redirectInput.click({ clickCount: 3 }); await redirectInput.type('http://localhost') }

  console.log('\n========================================')
  console.log('FORM IS FILLED. Do this in the browser:')
  console.log('1. Click the "I am not a robot" checkbox')
  console.log('2. Click "create app"')
  console.log('Waiting for you to submit...')
  console.log('========================================\n')

  // Bring window to front
  await page.bringToFront()

  // Wait until the app appears (up to 5 minutes)
  let clientId = null
  let clientSecret = null

  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(5000)

    // Check if app was created — look for the app in the developed apps list
    const appRows = await page.$$('.developed-app')
    for (const row of appRows) {
      const titleEl = await row.$('.title')
      const title = titleEl ? await titleEl.textContent() : ''
      if (title.includes('FreelanceAlert')) {
        // The client ID is the app's short ID shown under the app name
        const idEl = await row.$('.client-id') || await row.$('code') || await row.$('.app-id')
        if (idEl) clientId = (await idEl.textContent()).trim()

        const secretEl = await row.$('input[name="secret"]') || await row.$('.secret')
        if (secretEl) {
          clientSecret = await secretEl.getAttribute('value') || (await secretEl.textContent()).trim()
        }

        // Also try the table cells
        if (!clientId || !clientSecret) {
          const cells = await row.$$('td')
          for (const cell of cells) {
            const text = (await cell.textContent()).trim()
            if (text.length === 14 && /^[a-zA-Z0-9_-]+$/.test(text)) clientId = text
            if (text.length > 20 && /^[a-zA-Z0-9_-]+$/.test(text)) clientSecret = text
          }
        }

        break
      }
    }

    if (clientId || clientSecret) break

    // Also check current URL changed away from /prefs/apps (form submitted)
    const url = page.url()
    if (!url.includes('prefs/apps')) {
      console.log('Page navigated to:', url)
    }

    // Take a screenshot every 10 seconds to check progress
    if (i % 2 === 0) {
      await page.screenshot({ path: `C:\\Users\\yehud\\AppData\\Local\\Temp\\reddit-wait-${i}.png` })
    }
  }

  if (clientId || clientSecret) {
    console.log('\n=== APP CREATED ===')
    console.log('Client ID:', clientId)
    console.log('Client Secret:', clientSecret)
  } else {
    // Take final screenshot and dump page content
    await page.screenshot({ path: 'C:\\Users\\yehud\\AppData\\Local\\Temp\\reddit-final.png', fullPage: true })
    console.log('\nCould not detect app creation automatically.')
    console.log('Check screenshot: C:\\Users\\yehud\\AppData\\Local\\Temp\\reddit-final.png')
  }

  // Keep browser open for 30 more seconds so user can read keys
  await page.waitForTimeout(30000)
  await context.close()
}

main().catch(console.error)
