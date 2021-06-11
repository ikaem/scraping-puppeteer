import puppeteer from 'puppeteer';

let retry = 0;
const maxRetries = 5;

let proxyList = [
  '202.131.234.142:39330',
  '45.235.216.112:8080',
  '129.146.249.135:80',
  '148.251.20.79',
];

(async function scrape() {
  retry++;
  const proxy = proxyList[Math.floor(Math.random() * proxyList.length)];
  console.log('this is proxy', proxy);
  const browser = await puppeteer.launch({
    headless: false,
    args: [`--proxy-server=${proxy}`],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36'
    );

    await page.goto('https://quotes.toscrape.com/search.aspx');

    await page.waitForSelector('#author');
    await page.select('select#author', 'Albert Einstein');
    await page.waitForSelector('#tag');

    await page.select('select#tag', 'learning');

    await page.click('.btn');
    await page.waitForSelector('.quote');

    // this will run the function (callback) inside the brwoser environment, and return result to Node
    let quotes = await page.evaluate(() => {
      let quotesElement = document.body.querySelectorAll('.quote');
      let result = Object.values(quotesElement).map((x) => {
        return {
          author: x.querySelector('.author')?.textContent ?? null,
          quote: x.querySelector('.content')?.textContent ?? null,
          tag: x.querySelector('.tag')?.textContent ?? null,
        };
      });
      return result;
    });
    console.log('quotes', quotes);

    await browser.close();
  } catch (e) {
    console.log('Error:', e);
    await browser.close();
    if (retry < maxRetries) {
      scrape();
    }
  }
})();
