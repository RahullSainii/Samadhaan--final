const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const http = require('http');
const https = require('https');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const REGISTER_URL = `${FRONTEND_URL}/register`;
const LOGIN_URL = `${FRONTEND_URL}/login`;
const DASHBOARD_URL = `${FRONTEND_URL}/dashboard`;
const BACKEND_HEALTH_URL = process.env.BACKEND_HEALTH_URL || 'http://localhost:5000/api/health';
const KEEP_OPEN_MS = Number(process.env.KEEP_OPEN_MS || 0);

const REGISTER_REDIRECTS = ['/dashboard', '/admin'];

function uniqueTestEmail() {
  return `selenium_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
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

async function testRegistration() {
  console.log('Starting Selenium E2E test: register -> login -> complaint...');
  const testEmail = process.env.TEST_REGISTER_EMAIL || uniqueTestEmail();
  const testPassword = process.env.TEST_REGISTER_PASSWORD || 'password123';
  const testName = process.env.TEST_REGISTER_NAME || 'Selenium User';
  const complaintLocation = process.env.TEST_COMPLAINT_LOCATION || 'Hostel Block A - Room 203';
  const complaintDescription = process.env.TEST_COMPLAINT_DESCRIPTION || `Selenium complaint ${Date.now()} - water leakage in room requires maintenance.`;
  const complaintCategoryLabel = process.env.TEST_COMPLAINT_CATEGORY_LABEL || 'LMS Issue';
  const complaintPriorityLabel = process.env.TEST_COMPLAINT_PRIORITY_LABEL || 'High';
  console.log(`Using frontend URL: ${FRONTEND_URL}`);
  console.log(`Using backend health URL: ${BACKEND_HEALTH_URL}`);

  const options = new chrome.Options();
  if (process.env.HEADLESS === 'true') {
    options.addArguments('--headless=new');
    options.addArguments('--window-size=1920,1080');
    console.log('Running in headless mode');
  } else {
    console.log('Running in headed mode');
    options.addArguments('--start-maximized');
  }

  let driver;

  try {
    console.log('Checking frontend availability...');
    await checkUrl(FRONTEND_URL);
    console.log('Frontend is reachable');

    console.log('Checking backend availability...');
    await checkUrl(BACKEND_HEALTH_URL);
    console.log('Backend is reachable');

    console.log(`Using chromedriver binary: ${chromedriver.path}`);
    console.log('Launching Chrome WebDriver...');

    const service = new chrome.ServiceBuilder(chromedriver.path);
    const buildDriverPromise = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();

    driver = await Promise.race([
      buildDriverPromise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Timed out while starting Chrome WebDriver (20s)')),
          20000
        )
      ),
    ]);

    console.log('Chrome WebDriver launched');

    // STEP 1: REGISTER
    console.log('STEP 1/3: Registering a new user...');
    console.log(`Opening register page: ${REGISTER_URL}`);
    await driver.get(REGISTER_URL);
    await driver.wait(until.elementLocated(By.css('[data-testid="register-form"]')), 10000);
    console.log('Register form loaded');

    const nameInput = await driver.findElement(By.css('[data-testid="register-name"]'));
    const emailInput = await driver.findElement(By.css('[data-testid="register-email"]'));
    const passwordInput = await driver.findElement(By.css('[data-testid="register-password"]'));
    const submitButton = await driver.findElement(By.css('[data-testid="register-submit"]'));

    await nameInput.clear();
    await nameInput.sendKeys(testName);
    await emailInput.clear();
    await emailInput.sendKeys(testEmail);
    await passwordInput.clear();
    await passwordInput.sendKeys(testPassword);
    await submitButton.click();
    console.log(`Submitted registration for: ${testEmail}`);

    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      const onExpectedPage = REGISTER_REDIRECTS.some((path) => currentUrl.includes(path));
      if (onExpectedPage) return true;

      const errorElements = await driver.findElements(By.css('[data-testid="register-error"]'));
      return errorElements.length > 0;
    }, 15000);

    const finalUrl = await driver.getCurrentUrl();
    const isSuccess = REGISTER_REDIRECTS.some((path) => finalUrl.includes(path));

    if (!isSuccess) {
      const errorElement = await driver.findElement(By.css('[data-testid="register-error"]'));
      const errorText = await errorElement.getText();
      throw new Error(`Registration failed for ${testEmail}. UI error: ${errorText}`);
    }

    console.log(`PASS STEP 1: Registration successful for ${testEmail}`);
    console.log(`Redirected to: ${finalUrl}`);

    // STEP 2: LOGIN
    console.log('STEP 2/3: Logging out session and testing login...');
    await driver.executeScript('window.localStorage.clear(); window.sessionStorage.clear();');
    await driver.manage().deleteAllCookies();
    await driver.get(LOGIN_URL);
    await driver.wait(until.elementLocated(By.css('[data-testid="login-form"]')), 10000);

    const loginEmailInput = await driver.findElement(By.css('[data-testid="login-email"]'));
    const loginPasswordInput = await driver.findElement(By.css('[data-testid="login-password"]'));
    const loginSubmitButton = await driver.findElement(By.css('[data-testid="login-submit"]'));

    await loginEmailInput.clear();
    await loginEmailInput.sendKeys(testEmail);
    await loginPasswordInput.clear();
    await loginPasswordInput.sendKeys(testPassword);
    await loginSubmitButton.click();
    console.log(`Submitted login for: ${testEmail}`);

    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes('/dashboard')) return true;
      const errorElements = await driver.findElements(By.css('[data-testid="login-error"]'));
      return errorElements.length > 0;
    }, 15000);

    const loginFinalUrl = await driver.getCurrentUrl();
    if (!loginFinalUrl.includes('/dashboard')) {
      const loginError = await driver.findElement(By.css('[data-testid="login-error"]'));
      const loginErrorText = await loginError.getText();
      throw new Error(`Login failed for ${testEmail}. UI error: ${loginErrorText}`);
    }
    console.log(`PASS STEP 2: Login successful, redirected to ${loginFinalUrl}`);

    // STEP 3: ADD COMPLAINT
    console.log('STEP 3/3: Submitting a complaint...');
    await driver.get(DASHBOARD_URL);
    await driver.wait(until.elementLocated(By.css('[data-testid="complaint-form"]')), 10000);

    const categorySelect = await driver.findElement(By.id('complaint-category'));
    await categorySelect.click();
    const categoryOption = await driver.wait(
      until.elementLocated(By.xpath(`//li[@role='option' and normalize-space()='${complaintCategoryLabel}']`)),
      10000
    );
    await categoryOption.click();

    const prioritySelect = await driver.findElement(By.id('complaint-priority'));
    await prioritySelect.click();
    const priorityOption = await driver.wait(
      until.elementLocated(By.xpath(`//li[@role='option' and normalize-space()='${complaintPriorityLabel}']`)),
      10000
    );
    await priorityOption.click();

    const locationInput = await driver.findElement(By.css('[data-testid="complaint-location"]'));
    const descriptionInput = await driver.findElement(By.css('[data-testid="complaint-description"]'));
    const complaintSubmit = await driver.findElement(By.css('[data-testid="complaint-submit"]'));

    await locationInput.clear();
    await locationInput.sendKeys(complaintLocation);
    await descriptionInput.clear();
    await descriptionInput.sendKeys(complaintDescription);
    await complaintSubmit.click();
    console.log('Complaint form submitted');

    await driver.wait(async () => {
      const successEls = await driver.findElements(By.css('[data-testid="complaint-success"]'));
      if (successEls.length > 0) return true;
      const errorEls = await driver.findElements(By.css('[data-testid="complaint-error"]'));
      return errorEls.length > 0;
    }, 15000);

    const complaintSuccessEls = await driver.findElements(By.css('[data-testid="complaint-success"]'));
    if (complaintSuccessEls.length === 0) {
      const complaintErrorEl = await driver.findElement(By.css('[data-testid="complaint-error"]'));
      const complaintErrorText = await complaintErrorEl.getText();
      throw new Error(`Complaint submission failed. UI error: ${complaintErrorText}`);
    }

    const complaintSuccessText = await complaintSuccessEls[0].getText();
    console.log(`PASS STEP 3: Complaint submitted successfully. UI message: ${complaintSuccessText}`);
    console.log('PASS: All Selenium flows completed successfully.');
  } catch (error) {
    console.error('FAIL: Selenium test crashed');
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (KEEP_OPEN_MS > 0 && driver) {
      console.log(`Keeping browser open for ${KEEP_OPEN_MS}ms...`);
      await driver.sleep(KEEP_OPEN_MS);
    }
    if (driver) {
      await driver.quit();
    }
    console.log('Selenium E2E test completed.');
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exitCode = 1;
});

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  process.exitCode = 1;
});

(async () => {
  try {
    await testRegistration();
  } catch (error) {
    console.error('FAIL: Unhandled test error');
    console.error(error);
    process.exitCode = 1;
  }
})();
