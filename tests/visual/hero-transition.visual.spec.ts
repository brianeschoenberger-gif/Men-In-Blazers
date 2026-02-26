import { expect, test } from '@playwright/test'

const VISUAL_MODE = process.env.PLAYWRIGHT_VISUAL === '1'

test.describe('hero-transition visual regression checkpoints', () => {
  test.skip(!VISUAL_MODE, 'Set PLAYWRIGHT_VISUAL=1 to run visual snapshots.')

  test('hero keyframes remain stable', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(350)

    const maxScroll = await page.evaluate(
      () => document.body.scrollHeight - window.innerHeight,
    )
    const checkpoints = [0, 0.2, 0.45, 0.75, 1]

    for (const checkpoint of checkpoints) {
      const y = maxScroll * checkpoint * 0.32
      await page.evaluate((nextY) => window.scrollTo(0, nextY), y)
      await page.waitForTimeout(240)

      await expect(page).toHaveScreenshot(
        `hero-checkpoint-${checkpoint.toFixed(2).replace('.', '-')}.png`,
        {
          fullPage: false,
          maxDiffPixelRatio: 0.035,
        },
      )
    }
  })

  test('transition keyframes remain stable', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(350)

    const maxScroll = await page.evaluate(
      () => document.body.scrollHeight - window.innerHeight,
    )
    const checkpoints = [0, 0.3, 0.6, 0.82, 1]

    for (const checkpoint of checkpoints) {
      const y = maxScroll * (0.32 + checkpoint * 0.22)
      await page.evaluate((nextY) => window.scrollTo(0, nextY), y)
      await page.waitForTimeout(260)

      await expect(page).toHaveScreenshot(
        `transition-checkpoint-${checkpoint.toFixed(2).replace('.', '-')}.png`,
        {
          fullPage: false,
          maxDiffPixelRatio: 0.04,
        },
      )
    }
  })
})

