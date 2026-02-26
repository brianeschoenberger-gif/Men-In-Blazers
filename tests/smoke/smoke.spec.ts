import { expect, test, type Page } from '@playwright/test'

async function readTransitionEnergyLevel(page: Page) {
  return page.locator('.transition-overlay').evaluate((element) => {
    const value = (element as HTMLElement).style
      .getPropertyValue('--energy-level')
      .trim()
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  })
}

test('hero and transition content is present', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(300)

  await expect(
    page.getByRole('heading', { level: 1, name: 'Tunnel to Pitch' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Crowd Energy Surge' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Tour Stops' }),
  ).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Watch' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Listen' })).toBeVisible()
  await expect(page.locator('.transition-meter__bar')).toHaveCount(5)
  await expect(page.locator('.tour-map-pin')).toHaveCount(10)
  await expect(page.locator('.tour-chip')).toHaveCount(10)
  await expect(
    page.getByRole('link', { name: 'See Local Guide' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'See Local Guide' }),
  ).toHaveAttribute('href', /\/guides\/seattle$/)
  await expect(page.locator('.pin-spacer')).toHaveCount(3)
})

test('tour stop map pins and chips stay synchronized', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(320)

  const maxScroll = await page.evaluate(
    () => document.body.scrollHeight - window.innerHeight,
  )
  await page.evaluate((y) => window.scrollTo(0, y * 0.66), maxScroll)
  await page.waitForTimeout(360)

  const panelHeading = page.locator('.tour-panel h3')
  await expect(panelHeading).toContainText('Seattle, WA')

  await page.locator('.tour-map-pin').nth(8).click()
  await page.waitForTimeout(260)
  await expect(panelHeading).toContainText('New York, NY')
  await expect(page.locator('.tour-chip--active')).toContainText('New York, NY')
  await expect(
    page.getByRole('link', { name: 'See Local Guide' }),
  ).toHaveAttribute('href', /\/guides\/new-york$/)

  const scrollBefore = await page.evaluate(() => window.scrollY)
  await page.locator('.tour-chip').filter({ hasText: 'Boston, MA' }).click()
  await page.waitForTimeout(260)
  const scrollAfter = await page.evaluate(() => window.scrollY)

  expect(scrollAfter).toBeGreaterThan(scrollBefore + 10)
  await expect(panelHeading).toContainText('Boston, MA')
  await expect(page.locator('.tour-map-pin--active')).toHaveCount(1)
  await expect(
    page.getByRole('link', { name: 'See Local Guide' }),
  ).toHaveAttribute('href', /\/guides\/boston$/)
})

test('transition surges, settles, and hands off to next section', async ({
  page,
}) => {
  await page.goto('/')
  await page.waitForTimeout(300)

  const maxScroll = await page.evaluate(
    () => document.body.scrollHeight - window.innerHeight,
  )
  const samples: number[] = []

  for (let step = 0; step <= 16; step += 1) {
    const y = (maxScroll * step) / 16
    await page.evaluate((nextY) => window.scrollTo(0, nextY), y)
    await page.waitForTimeout(140)
    samples.push(await readTransitionEnergyLevel(page))
  }

  const startEnergy = samples[0]
  const endEnergy = samples[samples.length - 1]
  const peakEnergy = Math.max(...samples)

  expect(peakEnergy).toBeGreaterThan(startEnergy + 0.2)
  expect(endEnergy).toBeGreaterThan(0.25)
  expect(peakEnergy).toBeGreaterThan(endEnergy + 0.1)

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(260)
  await expect(
    page.getByRole('heading', { level: 2, name: 'Featured Stories Placeholder' }),
  ).toBeVisible()
})

test('reduced-motion path disables pinned scrub spacers and keeps transition calm', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()

  await page.goto('/')
  await page.waitForTimeout(300)

  const prefersReducedMotion = await page.evaluate(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  expect(prefersReducedMotion).toBeTruthy()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Tunnel to Pitch' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Crowd Energy Surge' }),
  ).toBeVisible()
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: 'See Local Guide' }),
  ).toHaveAttribute('href', /\/guides\/seattle$/)

  const startEnergy = await readTransitionEnergyLevel(page)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(220)
  const endEnergy = await readTransitionEnergyLevel(page)

  expect(startEnergy).toBeGreaterThan(0.19)
  expect(startEnergy).toBeLessThan(0.25)
  expect(Math.abs(endEnergy - startEnergy)).toBeLessThan(0.02)
  await expect(
    page.getByRole('link', { name: 'See Local Guide' }),
  ).toHaveAttribute('href', /\/guides\/seattle$/)

  await context.close()
})

test('mobile fallback enables low tier and preserves core section content', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  })
  const page = await context.newPage()

  await page.goto('/')
  await page.waitForTimeout(320)

  const shell = page.locator('.page-shell')
  await expect(shell).toHaveAttribute('data-mobile', 'true')
  await expect(shell).toHaveAttribute('data-device-tier', 'low')

  const particleMultiplier = await shell.evaluate((element) => {
    const value = element.getAttribute('data-particle-multiplier') ?? '1'
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 1
  })
  expect(particleMultiplier).toBeLessThanOrEqual(0.35)

  await expect(
    page.getByRole('heading', { level: 1, name: 'Tunnel to Pitch' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Crowd Energy Surge' }),
  ).toBeVisible()

  await context.close()
})
