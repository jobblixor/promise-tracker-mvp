const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

(async () => {
  const htmlPath = path.join(__dirname, 'og-image.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const outPath = path.join(__dirname, '..', 'public', 'og-image.png');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outPath, type: 'png' });
  await browser.close();

  console.log('og-image.png saved to', outPath);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
