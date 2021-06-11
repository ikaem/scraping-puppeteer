import puppeteer from 'puppeteer';

export async function startBrowser() {
  let browser: puppeteer.Browser;

  try {
    console.log('Opening the browser');
    browser = await puppeteer.launch({
      headless: false,
      args: ['--disable-setuid-sandbox'],
      ignoreHTTPSErrors: true,
    });
  } catch (e) {
    console.log('Could not create a browser instance => : ', e);
    throw e;
  }

  return browser;
}
