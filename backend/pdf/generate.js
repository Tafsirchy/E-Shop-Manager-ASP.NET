/**
 * Renders a self-contained HTML invoice to a PDF using headless Chrome
 * (puppeteer-core + the locally installed Chrome/Edge executable).
 *
 * Usage:
 *   node generate.js --html <path-to.html> --out <path-to.pdf>
 *
 * Prints "PDF_GENERATED:<absolute-pdf-path>" on success, or
 * "PDF_FAILED:<error>" on failure. Exits 0 on success, non-zero on failure.
 *
 * Chrome/Edge path resolution:
 *   1. EShop_PDF_CHROME env var
 *   2. Common install locations (Windows/macOS/Linux)
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const launch = puppeteer.launch;

function arg(name) {
  const i = process.argv.indexOf('--' + name);
  return i !== -1 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : null;
}

const { execSync } = require('child_process');

function findChrome() {
  if (process.env.EShop_PDF_CHROME && fs.existsSync(process.env.EShop_PDF_CHROME)) return process.env.EShop_PDF_CHROME;
  const candidates = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  try {
    const which = execSync('which chromium || which chromium-browser || which google-chrome', { encoding: 'utf8' }).trim();
    if (which && fs.existsSync(which)) return which;
  } catch {}
  return null;
}

(async () => {
  const htmlFile = arg('html');
  const outFile = arg('out');
  if (!htmlFile || !outFile) {
    console.error('Must provide --html and --out');
    process.exit(2);
  }
  if (!fs.existsSync(htmlFile)) {
    console.error('HTML file not found: ' + htmlFile);
    process.exit(2);
  }

  const chromePath = findChrome();
  if (!chromePath) {
    console.error('No Chrome/Edge executable found. Set EShop_PDF_CHROME.');
    process.exit(2);
  }

  const html = fs.readFileSync(htmlFile, 'utf8');
  let browser = null;
  try {
    browser = await launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--no-first-run', '--no-zygote', '--single-process']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    await page.emulateMediaType('print');
    await page.pdf({
      path: outFile,
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      preferCSSPageSize: false
    });
    await browser.close();
    browser = null;
    console.log('PDF_GENERATED:' + path.resolve(outFile));
    process.exit(0);
  } catch (err) {
    if (browser) { try { await browser.close(); } catch (e) {} }
    console.error('PDF_FAILED:' + (err && err.message ? err.message : String(err)));
    process.exit(1);
  }
})();
