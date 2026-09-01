import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const vercelConfig = JSON.parse(await fs.readFile(path.join(rootDir, 'vercel.json'), 'utf8'));
const cspValue = vercelConfig.headers
  .flatMap((entry) => entry.headers || [])
  .find((header) => header.key === 'Content-Security-Policy')?.value;

if (!cspValue) {
  throw new Error('Content-Security-Policy header not found in vercel.json');
}

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, 'http://127.0.0.1');
    const decodedPath = decodeURIComponent(parsedUrl.pathname);
    const normalizedPath = path.normalize(decodedPath).replace(/^([/\\])+/, '');
    let filePath = path.join(distDir, normalizedPath || 'index.html');

    if (!filePath.startsWith(distDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    let stat = null;
    try {
      stat = await fs.stat(filePath);
    } catch {
      stat = null;
    }

    if (!stat || stat.isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Cache-Control': 'no-cache',
      'Content-Security-Policy': cspValue,
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    });
    res.end(await fs.readFile(filePath));
  } catch (error) {
    res.writeHead(500);
    res.end(String(error?.stack || error));
  }
});

await new Promise((resolve) => server.listen(4174, '127.0.0.1', resolve));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const logs = [];
const failedRequests = [];
const pageErrors = [];

page.on('console', (msg) => logs.push({ type: msg.type(), text: msg.text() }));
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('requestfailed', (request) => {
  failedRequests.push({
    failure: request.failure()?.errorText || '',
    url: request.url(),
  });
});

async function visit(route) {
  await page.goto(`http://127.0.0.1:4174${route}`, { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  return { route, title: await page.title(), url: page.url() };
}

const pages = [];
pages.push(await visit('/'));
const homeText = await page.locator('body').innerText().catch(() => '');
const homeImageCount = await page.locator('img').count();
const homeFrameCount = await page.locator('iframe').count();
pages.push(await visit('/shop'));
const shopText = await page.locator('body').innerText().catch(() => '');
const shopImageCount = await page.locator('img').count();
pages.push(await visit('/login'));
const loginText = await page.locator('body').innerText().catch(() => '');
const loginHasGoogleButton = await page.getByRole('button', { name: 'Google' }).count();
pages.push(await visit('/admin'));
const adminText = await page.locator('body').innerText().catch(() => '');
const adminRedirectUrl = page.url();

const cspLogs = logs.filter((log) => /content security policy|violat/i.test(log.text));
const cspFailures = failedRequests.filter((request) =>
  /content security policy/i.test(request.failure),
);

await browser.close();
server.close();

console.log(JSON.stringify({
  adminRedirectUrl,
  cspFailureCount: cspFailures.length,
  cspFailures,
  cspLogCount: cspLogs.length,
  cspLogs,
  pageErrors,
  renderedText: {
    admin: adminText.slice(0, 300),
    home: homeText.slice(0, 300),
    login: loginText.slice(0, 300),
    shop: shopText.slice(0, 300),
  },
  homeFrameCount,
  homeImageCount,
  loginHasGoogleButton,
  pages,
  shopImageCount,
}, null, 2));
