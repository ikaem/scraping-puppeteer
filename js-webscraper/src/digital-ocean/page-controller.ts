import puppeteer from 'puppeteer';
import { pageScraper } from './page-scraper';
import fs from 'fs';

async function scrapeAll(browserInstance: puppeteer.Browser) {
  let browser: puppeteer.Browser;

  try {
    browser = browserInstance;
    // TODO this would catch error if we cannot navigate to a page
    const scrapedData: Record<string, any> = {};
    scrapedData['Travel'] = await pageScraper.scraper(browser, 'Travel');

    await browser.close();
    fs.writeFile('data.json', JSON.stringify(scrapedData), 'utf8', (err) => {
      if (err) return console.log(err);
      console.log('Data has been scraped and saved ');
    });
  } catch (e) {
    console.log(`Could not resolve the browser instance => :`, e);
  }
}

export const scraperController = async (browserInstance: puppeteer.Browser) =>
  scrapeAll(browserInstance);
