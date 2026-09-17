import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.VISUAL_QA_BASE_URL || 'http://127.0.0.1:4173';
const outputDir = path.resolve('visual-qa-output');

const targets = [
  { name: 'home', path: '/' },
  { name: 'rs-8x8', path: '/projects/rs-8x8.html' },
];

const viewports = [
  { name: 'mobile-390', width: 390, height: 844, expectedDpr: 3 },
  { name: 'mobile-430', width: 430, height: 932, expectedDpr: 3 },
  { name: 'tablet-768', width: 768, height: 1024, expectedDpr: 2 },
  { name: 'desktop-1440', width: 1440, height: 900, expectedDpr: 1 },
  { name: 'desktop-1920', width: 1920, height: 1080, expectedDpr: 1 },
];

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

for (const target of targets) {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      isMobile: viewport.width < 768,
      hasTouch: viewport.width < 768,
    });

    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(String(error)));

    const url = new URL(target.path, baseURL).href;
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(250);

    const status = response?.status() ?? 0;
    const metrics = await page.evaluate((expectedDpr) => {
      const root = document.documentElement;
      const body = document.body;
      const viewportWidth = window.innerWidth;
      const documentWidth = Math.max(root.scrollWidth, body?.scrollWidth || 0);
      const horizontalOverflow = documentWidth > viewportWidth + 1;

      const images = [...document.images].map((img) => {
        const rect = img.getBoundingClientRect();
        const visible = rect.width > 2 && rect.height > 2;
        const requiredWidth = rect.width * expectedDpr;
        const requiredHeight = rect.height * expectedDpr;
        const lowResolution = visible && (
          img.naturalWidth + 1 < requiredWidth * 0.85 ||
          img.naturalHeight + 1 < requiredHeight * 0.85
        );
        return {
          src: img.currentSrc || img.src,
          alt: img.alt || '',
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          renderedWidth: Math.round(rect.width),
          renderedHeight: Math.round(rect.height),
          broken: !img.complete || img.naturalWidth === 0,
          lowResolution,
        };
      });

      return {
        title: document.title,
        viewportWidth,
        documentWidth,
        horizontalOverflow,
        images,
      };
    }, viewport.expectedDpr);

    const baseName = `${target.name}__${viewport.name}`;
    await page.screenshot({
      path: path.join(outputDir, `${baseName}__viewport.png`),
      fullPage: false,
      animations: 'disabled',
    });
    await page.screenshot({
      path: path.join(outputDir, `${baseName}__full.png`),
      fullPage: true,
      animations: 'disabled',
    });

    const brokenImages = metrics.images.filter((img) => img.broken);
    const lowResolutionImages = metrics.images.filter((img) => img.lowResolution && !img.broken);

    results.push({
      target: target.name,
      path: target.path,
      viewport: viewport.name,
      width: viewport.width,
      height: viewport.height,
      expectedDpr: viewport.expectedDpr,
      status,
      horizontalOverflow: metrics.horizontalOverflow,
      documentWidth: metrics.documentWidth,
      brokenImages,
      lowResolutionImages,
      consoleErrors,
      pageErrors,
    });

    await context.close();
  }
}

await browser.close();

const fatal = results.filter((r) =>
  r.status >= 400 ||
  r.status === 0 ||
  r.horizontalOverflow ||
  r.brokenImages.length > 0 ||
  r.pageErrors.length > 0
);
const warnings = results.filter((r) => r.lowResolutionImages.length > 0 || r.consoleErrors.length > 0);

await fs.writeFile(
  path.join(outputDir, 'report.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), baseURL, results }, null, 2),
  'utf8',
);

const lines = [
  '# Visual QA report',
  '',
  `Base URL: ${baseURL}`,
  `Checks: ${results.length}`,
  `Fatal checks: ${fatal.length}`,
  `Warning checks: ${warnings.length}`,
  '',
  '## Summary',
  '',
  '| Page | Viewport | HTTP | Overflow | Broken images | Low-res images | Console errors |',
  '|---|---:|---:|---:|---:|---:|---:|',
  ...results.map((r) => `| ${r.target} | ${r.viewport} | ${r.status} | ${r.horizontalOverflow ? 'YES' : 'no'} | ${r.brokenImages.length} | ${r.lowResolutionImages.length} | ${r.consoleErrors.length} |`),
  '',
];

for (const r of results) {
  if (!r.horizontalOverflow && !r.brokenImages.length && !r.lowResolutionImages.length && !r.consoleErrors.length && !r.pageErrors.length) continue;
  lines.push(`## ${r.target} / ${r.viewport}`, '');
  if (r.horizontalOverflow) lines.push(`- Horizontal overflow: document ${r.documentWidth}px vs viewport ${r.width}px`);
  for (const img of r.brokenImages) lines.push(`- BROKEN IMAGE: ${img.src || '(empty src)'}`);
  for (const img of r.lowResolutionImages) lines.push(`- LOW-RES IMAGE: ${img.src} — source ${img.naturalWidth}×${img.naturalHeight}, rendered ${img.renderedWidth}×${img.renderedHeight}, target DPR ${r.expectedDpr}`);
  for (const error of r.consoleErrors) lines.push(`- Console error: ${error}`);
  for (const error of r.pageErrors) lines.push(`- Page error: ${error}`);
  lines.push('');
}

await fs.writeFile(path.join(outputDir, 'report.md'), lines.join('\n'), 'utf8');

console.log(lines.join('\n'));

if (fatal.length) {
  console.error(`Visual QA found ${fatal.length} fatal check(s). Screenshots and report were still generated.`);
  process.exitCode = 1;
}
