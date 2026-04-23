const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const http = require('http');
const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_HEALTH_URL = process.env.BACKEND_HEALTH_URL || 'http://localhost:5000/api/health';
const REGISTER_REDIRECTS = ['/dashboard', '/admin'];

const testUser = {
  name: process.env.TEST_REGISTER_NAME || 'Selenium User',
  email:
    process.env.TEST_REGISTER_EMAIL ||
    `selenium_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`,
  password: process.env.TEST_REGISTER_PASSWORD || 'password123',
};

const complaintData = {
  location: process.env.TEST_COMPLAINT_LOCATION || 'Hostel Block A - Room 203',
  description:
    process.env.TEST_COMPLAINT_DESCRIPTION ||
    `Selenium complaint ${Date.now()} - water leakage in room requires maintenance.`,
  categoryLabel: process.env.TEST_COMPLAINT_CATEGORY_LABEL || 'LMS Issue',
  priorityLabel: process.env.TEST_COMPLAINT_PRIORITY_LABEL || 'High',
};

function logStep(message) {
  console.log(`[E2E] ${message}`);
}

function checkUrl(url, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      res.resume();
      if (res.statusCode >= 200 && res.statusCode < 500) {
        resolve(res.statusCode);
      } else {
        reject(new Error(`Unexpected status code ${res.statusCode} for ${url}`));
      }
    });

    req.on('error', (err) => reject(new Error(`Cannot reach ${url}: ${err.message}`)));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Timeout while reaching ${url}`));
    });
  });
}

describe('Samadhaan Complaint Management System E2E Tests', function() {
  let driver;
  let chromeProfileDir;

  before(function() {
    this.timeout(60000);
  });

  before(async function() {
    const options = new chrome.Options();
    chromeProfileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'samadhaan-e2e-'));
    const isHeadless = process.env.HEADLESS === 'true';

    options.addArguments(`--user-data-dir=${chromeProfileDir}`);
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--remote-debugging-port=0');
    options.addArguments('--no-first-run');
    options.addArguments('--no-default-browser-check');

    if (isHeadless) {
      options.addArguments('--headless=new');
      options.addArguments('--window-size=1920,1080');
    } else {
      options.addArguments('--start-maximized');
    }

    logStep(`Checking frontend: ${FRONTEND_URL}`);
    await checkUrl(FRONTEND_URL);
    logStep(`Checking backend: ${BACKEND_HEALTH_URL}`);
    await checkUrl(BACKEND_HEALTH_URL);

    const service = new chrome.ServiceBuilder(chromedriver.path);
    const buildDriverPromise = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();

    try {
      driver = await Promise.race([
        buildDriverPromise,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Timed out while starting Chrome WebDriver (20s)')),
            20000
          )
        ),
      ]);
    } catch (error) {
      if (isHeadless) {
        throw new Error(
          `Chrome could not start in headless mode. Try running headed mode with: npm.cmd run test:show\nOriginal error: ${error.message}`
        );
      }
      throw error;
    }

    logStep(`Chrome WebDriver started with ${chromedriver.path}`);
  });

  after(async function() {
    if (driver) {
      await driver.quit();
    }
    if (chromeProfileDir && fs.existsSync(chromeProfileDir)) {
      fs.rmSync(chromeProfileDir, { recursive: true, force: true });
    }
  });

  it('should load the home page', async function() {
    logStep('Opening home page');
    await driver.get(FRONTEND_URL);

    await driver.wait(until.elementLocated(By.css('body')), 10000);
    const title = await driver.getTitle();
    expect(title).to.be.a('string');
    logStep(`Home page loaded. Title: ${title || '(empty title)'}`);
  });

  it('should open the login page', async function() {
    logStep('Opening login page');
    await driver.get(`${FRONTEND_URL}/login`);

    const loginForm = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-form"]')),
      10000
    );
    expect(loginForm).to.exist;
    logStep('Login form is visible');
  });

  it('should register a new user', async function() {
    logStep(`Opening register page for ${testUser.email}`);
    await driver.get(`${FRONTEND_URL}/register`);

    await driver.wait(until.elementLocated(By.css('[data-testid="register-form"]')), 10000);

    const nameInput = await driver.findElement(By.css('[data-testid="register-name"]'));
    const emailInput = await driver.findElement(By.css('[data-testid="register-email"]'));
    const passwordInput = await driver.findElement(By.css('[data-testid="register-password"]'));
    const submitButton = await driver.findElement(By.css('[data-testid="register-submit"]'));

    await nameInput.clear();
    await nameInput.sendKeys(testUser.name);
    await emailInput.clear();
    await emailInput.sendKeys(testUser.email);
    await passwordInput.clear();
    await passwordInput.sendKeys(testUser.password);

    logStep('Submitting registration form');
    await submitButton.click();

    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      if (REGISTER_REDIRECTS.some((path) => currentUrl.includes(path))) {
        return true;
      }

      const errorEls = await driver.findElements(By.css('[data-testid="register-error"]'));
      return errorEls.length > 0;
    }, 15000);

    const finalUrl = await driver.getCurrentUrl();
    const success = REGISTER_REDIRECTS.some((path) => finalUrl.includes(path));
    if (!success) {
      const errorElement = await driver.findElement(By.css('[data-testid="register-error"]'));
      const errorText = await errorElement.getText();
      throw new Error(`Registration failed for ${testUser.email}. UI error: ${errorText}`);
    }

    expect(success).to.equal(true);
    logStep(`Registration successful. Redirected to ${finalUrl}`);
  });

  it('should log in with the registered user', async function() {
    logStep('Clearing session and opening login page');
    await driver.executeScript('window.localStorage.clear(); window.sessionStorage.clear();');
    await driver.manage().deleteAllCookies();
    await driver.get(`${FRONTEND_URL}/login`);
    await driver.wait(until.elementLocated(By.css('[data-testid="login-form"]')), 10000);

    const emailInput = await driver.findElement(By.css('[data-testid="login-email"]'));
    const passwordInput = await driver.findElement(By.css('[data-testid="login-password"]'));
    const submitButton = await driver.findElement(By.css('[data-testid="login-submit"]'));

    await emailInput.clear();
    await emailInput.sendKeys(testUser.email);
    await passwordInput.clear();
    await passwordInput.sendKeys(testUser.password);

    logStep(`Submitting login form for ${testUser.email}`);
    await submitButton.click();

    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes('/dashboard')) {
        return true;
      }

      const errorEls = await driver.findElements(By.css('[data-testid="login-error"]'));
      return errorEls.length > 0;
    }, 15000);

    const finalUrl = await driver.getCurrentUrl();
    if (!finalUrl.includes('/dashboard')) {
      const errorElement = await driver.findElement(By.css('[data-testid="login-error"]'));
      const errorText = await errorElement.getText();
      throw new Error(`Login failed for ${testUser.email}. UI error: ${errorText}`);
    }

    expect(finalUrl).to.include('/dashboard');
    logStep(`Login successful. Redirected to ${finalUrl}`);
  });

  it('should submit a complaint successfully', async function() {
    logStep('Opening dashboard for complaint submission');
    await driver.get(`${FRONTEND_URL}/dashboard`);
    await driver.wait(until.elementLocated(By.css('[data-testid="complaint-form"]')), 10000);

    const categorySelect = await driver.findElement(By.id('complaint-category'));
    await categorySelect.click();
    const categoryOption = await driver.wait(
      until.elementLocated(
        By.xpath(`//li[@role='option' and normalize-space()='${complaintData.categoryLabel}']`)
      ),
      10000
    );
    await categoryOption.click();
    logStep(`Selected category: ${complaintData.categoryLabel}`);

    const prioritySelect = await driver.findElement(By.id('complaint-priority'));
    await prioritySelect.click();
    const priorityOption = await driver.wait(
      until.elementLocated(
        By.xpath(`//li[@role='option' and normalize-space()='${complaintData.priorityLabel}']`)
      ),
      10000
    );
    await priorityOption.click();
    logStep(`Selected priority: ${complaintData.priorityLabel}`);

    const locationInput = await driver.findElement(By.css('[data-testid="complaint-location"]'));
    const descriptionInput = await driver.findElement(By.css('[data-testid="complaint-description"]'));
    const submitButton = await driver.findElement(By.css('[data-testid="complaint-submit"]'));

    await locationInput.clear();
    await locationInput.sendKeys(complaintData.location);
    await descriptionInput.clear();
    await descriptionInput.sendKeys(complaintData.description);

    logStep('Submitting complaint form');
    await submitButton.click();

    await driver.wait(async () => {
      const successEls = await driver.findElements(By.css('[data-testid="complaint-success"]'));
      if (successEls.length > 0) {
        return true;
      }

      const errorEls = await driver.findElements(By.css('[data-testid="complaint-error"]'));
      return errorEls.length > 0;
    }, 15000);

    const successEls = await driver.findElements(By.css('[data-testid="complaint-success"]'));
    if (successEls.length === 0) {
      const errorElement = await driver.findElement(By.css('[data-testid="complaint-error"]'));
      const errorText = await errorElement.getText();
      throw new Error(`Complaint submission failed. UI error: ${errorText}`);
    }

    const successText = await successEls[0].getText();
    expect(successText.toLowerCase()).to.include('success');
    logStep(`Complaint submitted successfully. Message: ${successText}`);
  });
});
