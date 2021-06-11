import puppeteer from 'puppeteer';
import fs from 'fs';

const scrape = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(
    'https://en.wikipedia.org/wiki/2019%E2%80%9320_coronavirus_pandemic_by_country_and_territory',
    { waitUntil: 'domcontentloaded' }
  );

  const recordList = await page.$$eval(
    'div#covid19-container table#thetable tbody tr',
    (trows) => {
      console.log('trows', trows);
      const rowList: any[] = [];

      trows.forEach((row) => {
        const record: Record<string, string | null> = {
          country: '',
          cases: '',
          death: '',
          recovered: '',
        };

        record.country = row.querySelector('a')?.innerText ?? null;

        const tdList = Array.from(
          row.querySelectorAll('td'),
          (column) => column.innerText
        );

        record.cases = tdList[0];
        record.death = tdList[1];
        record.recovered = tdList[2];

        if (tdList.length >= 3) {
          rowList.push(record);
        }
      });

      console.log('what', rowList);

      return rowList;
    }
  );

  console.log('recordList', recordList);

  fs.writeFile('covid-19.json', JSON.stringify(recordList, null, 2), (err) => {
    if (err) return console.log(err);
    console.log('Save successfully');
  });

  await browser.close();
};

scrape();
