import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

mkdirSync('/workspace/screenshots', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto('http://127.0.0.1:8080/login', { waitUntil: 'networkidle' });
await page.screenshot({ path: '/workspace/screenshots/login.png', fullPage: true });

await page.fill('input[type="email"]', 'demo@forgeledger.app');
await page.fill('input[type="password"]', 'demo1234');
await page.click('button[type="submit"]');
await page.waitForURL('**/app**', { timeout: 15000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: '/workspace/screenshots/dashboard.png', fullPage: true });

const body = await page.locator('body').innerText();
console.log('dashboard snippet:', body.slice(0, 400).replace(/\n/g, ' | '));

// clients
await page.click('a[href="/app/clients"]');
await page.waitForTimeout(800);
await page.screenshot({ path: '/workspace/screenshots/clients.png', fullPage: true });
const clientsText = await page.locator('body').innerText();
console.log('clients has Northwind?', clientsText.includes('Northwind'));

// invoices
await page.click('a[href="/app/invoices"]');
await page.waitForTimeout(800);
await page.screenshot({ path: '/workspace/screenshots/invoices.png', fullPage: true });

// mobile
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://127.0.0.1:8080/app', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: '/workspace/screenshots/mobile-dashboard.png', fullPage: true });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
console.log('mobile overflow', overflow);
console.log('errors', errors);
await browser.close();
if (errors.length) process.exit(1);
console.log('E2E_OK');
