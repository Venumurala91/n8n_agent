const { chromium } = require('playwright-core');
(async () => {
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshots = [];

  // Find system Chromium
  const chromiumPaths = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable'
  ];
  let executablePath = null;
  for (const p of chromiumPaths) {
    if (fs.existsSync(p)) { executablePath = p; break; }
  }
  if (!executablePath) {
    throw new Error('CHROMIUM_NOT_FOUND: Not found at: ' + chromiumPaths.join(', '));
  }
  console.log('CHROMIUM: ' + executablePath);

  const takeScreenshot = async (page, name) => {
    const fileName = name + '_' + timestamp + '.png';
    const filePath = '/home/node/n8n-local-files/screenshots/' + fileName;
    await page.screenshot({ path: filePath, fullPage: true });
    console.log('SCREENSHOT_SAVED: ' + fileName);
    screenshots.push(fileName);
    return fileName;
  };

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions'
    ]
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // LOGIN SEQUENCE
    console.log('STEP: Navigating to app...');
    await page.goto('http://103.123.173.50:1009', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    console.log('STEP: Page loaded');

    await page.waitForSelector('input[formcontrolname="username"]', { state: 'visible', timeout: 15000 });
    await page.fill('input[formcontrolname="username"]', 'ranjit@assettl.com');
    console.log('STEP: Username filled');

    await page.waitForSelector('input#password-field', { state: 'visible', timeout: 10000 });
    await page.fill('input#password-field', 'Rjil@12345');
    console.log('STEP: Password filled');

    await page.waitForSelector('button.login_btn', { state: 'visible', timeout: 10000 });
    await page.click('button.login_btn');
    console.log('STEP: Login clicked');

    await page.waitForSelector('input#otp_Email', { state: 'visible', timeout: 30000 });
    await page.fill('input#otp_Email', '123456');
    console.log('STEP: OTP filled');

    await page.click('button.login_btn');
    console.log('STEP: OTP submitted');

    await page.waitForSelector('text=Vehicle Status', { timeout: 20000 });
    console.log('STEP: LOGIN SUCCESS - Dashboard loaded');

    // USER STEPS START
    const takeScreenshot = async (name) => {
      const fileName = name + '_' + timestamp + '.png';
      const filePath = '/home/node/n8n-local-files/screenshots/' + fileName;
      await page.screenshot({ path: filePath, fullPage: true });
      console.log('SCREENSHOT_SAVED: ' + fileName);
      screenshots.push(fileName);
      return fileName;
    };
    await takeScreenshot('Login_Dashboard');
    // USER STEPS END

    await page.screenshot({ path: '/home/node/n8n-local-files/screenshots/SUCCESS_FINAL_' + timestamp + '.png', fullPage: true });
    console.log('SCREENSHOT_SAVED: SUCCESS_FINAL_' + timestamp + '.png');
    screenshots.push('SUCCESS_FINAL_' + timestamp + '.png');
    console.log('TEST_PASSED');
    console.log('ALL_SCREENSHOTS: ' + JSON.stringify(screenshots));

  } catch (err) {
    console.error('TEST_FAILED: ' + err.message);
    try {
      await page.screenshot({ path: '/home/node/n8n-local-files/screenshots/FAILURE_ERROR_' + timestamp + '.png', fullPage: true });
      console.log('SCREENSHOT_SAVED: FAILURE_ERROR_' + timestamp + '.png');
      screenshots.push('FAILURE_ERROR_' + timestamp + '.png');
    } catch (ssErr) {
      console.error('SCREENSHOT_FAILED: ' + ssErr.message);
    }
    console.log('ALL_SCREENSHOTS: ' + JSON.stringify(screenshots));
    throw err;
  } finally {
    await browser.close();
    console.log('BROWSER_CLOSED');
  }
})().catch(err => {
  console.error('FATAL: ' + err.message);
  setTimeout(() => { throw err; }, 0);
});