import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  //   await page.goto('http://example.com/webscraping.com/places/default/search');
  //   await page.goto('http://example.webscraping.com/places/default/search');

  try {
    await page.goto('http://example.wsasdasdasd.com', { timeout: 1 });
  } catch (e) {
    console.log('Error: ', e);
  }

  //   await page.type('#search_term', 'Brazil');

  //   await page.click('#search');

  //   await page.waitForSelector('#results table tr td a');
  //   await page.click('#results table tr td a');

  //   await browser.close();
})();
