import puppeteer, { ElementHandle } from 'puppeteer';
import fs from 'fs';
import { resolve } from 'path';

const iphone = puppeteer.devices['iPhone 6'];

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.emulate(iphone);
  await page.goto('http://example.com/');

  await page.exposeFunction('test', () => {
    const loadData = (path: string) => {
      try {
        const filePath = resolve(__dirname, path);
        // this will be logged in node
        console.log('path', filePath);
        //   this should read the file and return it to node
        return fs.readFileSync(filePath, 'utf-8');
        // return fs.readdirSync(resolve(__dirname));
      } catch (err) {
        console.error('err', err);
        return false;
      }
    };

    // we have to return the function if we pass a callback, i guess
    return loadData('app.ts');
  });

  const expo = await page.evaluate(() => {
    //   @ts-ignore
    return test();
  });

  console.log('this is expo', expo);

  const result = await page.$$eval('div', (title) => {
    console.log('what');
    console.log(title);
  });

  await page.click('a[href]', {
    button: 'middle',
  });

  const html = await page.content();

  //   console.log('html', html);

  const data = await page.evaluate(() => {
    return document.querySelectorAll('a').length;
  });

  const domObject = await page.evaluateHandle(() => {
    return document.querySelectorAll('h1');
  });

  //   console.log('dom object', domObject);

  const what = await domObject.evaluate((el) => {
    console.log('el here', el[0]);
    return el[0].textContent; // Example Domain
  });

  console.log('what', what);

  //   await page.goBack();

  await page.goto('https://www.wikipedia.org/');

  const lagnuageSelect = await page.select('select', 'sk');
  console.log('div', lagnuageSelect);

  //   const html2 = '<h1>what is this</h1>';

  //   await page.setContent(html2);

  //   await page.screenshot({ path: 'set-content.jpg' });

  const title = await page.title();
  console.log('title', title);

  //   here we select value from an input
  const waitForPragueToBeFilled = async () => {
    // const inputSearch = await page.$('input#searchInput');
    const inputSearchValue = await page.$eval(
      'input#searchInput',
      (input) => (input as HTMLInputElement).value
    );

    inputSearchValue === 'prague' ? console.log('true') : console.log('false');

    return inputSearchValue === 'prague';
  };

  await page.type('input#searchInput', 'prague', { delay: 500 });

  //   await browser.close();
})();
