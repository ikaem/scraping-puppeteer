import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://en.wikipedia.org/wiki/Web_scraping ');
  await page.setViewport({
    width: 1920,
    height: 1080,
  });
  await page.screenshot({ path: 'oxylabs.png' });
  await page.pdf({ path: 'oxylabs.pdf', format: 'a5' });

  const title = await page.evaluate(() => {
    return document.querySelector('#firstHeading')?.textContent?.trim();
  });

  console.log('title', title);

  const headings = await page.evaluate(() => {
    const headingElements = document.querySelectorAll('.mw-headline');

    // const headingsArray = Array.from(headingElements);

    return Array.from(headingElements, (h) => h.textContent);

    // return headingsArray.map((h) => h.textContent);
  });

  console.log('headings here', headings);

  await browser.close();
}
main();
