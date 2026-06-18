const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 700 });

  // ── Calculator ──────────────────────────────────────────────
  await page.goto('https://www.promisetracker.app/calculator', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(1500);
  await page.click('button:has-text("Calculate")');
  await page.waitForTimeout(600);
  // Grab the two-column calculator widget
  const calcEl = page.locator('main > div:nth-child(2)');
  await calcEl.screenshot({
    path: 'public/preview-calculator.jpg',
    type: 'jpeg',
    quality: 90,
  });
  console.log('Calculator screenshot saved');

  // ── Text Templates ──────────────────────────────────────────
  await page.goto('https://www.promisetracker.app/follow-up-text-templates', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(1500);
  const templEl = page.locator('main > div').first();
  await templEl.screenshot({
    path: 'public/preview-text-templates.jpg',
    type: 'jpeg',
    quality: 90,
  });
  console.log('Text templates screenshot saved');

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
