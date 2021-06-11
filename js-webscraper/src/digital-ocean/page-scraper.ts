import { Browser } from 'puppeteer';

const scraperObject = {
  url: 'http://books.toscrape.com',
  async scraper(browser: Browser, category: string) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}`);
    await page.goto(this.url);

    // find link for the category selected
    const selectedCategory = await page.$$eval(
      '.side_categories > ul > li > ul > li > a',
      (links, _category) => {
        // search for element with the matching text
        const newLinks = links.map((a) =>
          a.textContent?.replace(
            /(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm,
            ''
          ) === _category
            ? (a as HTMLAnchorElement)
            : null
        );

        // now find only te links that are not null, and select first one
        // here we should have only links to the category, anyway
        const link = newLinks.filter((tx) => tx !== null)[0];

        return link?.href;
      },
      category
    );

    // navigate to the category page with list of books belonging to the category
    console.log('selected category', selectedCategory);
    await page.goto(selectedCategory || this.url);

    // this is where we will store all individual pages data
    const scrapedData: any[] = [];

    // function to call whenever we reach a 'next' page
    async function scrapeCurrentPage() {
      // wait for the dom to be rendered
      await page.waitForSelector('.page_inner');
      // get the link to all required books
      // this will run query selector in the brwoser, return stuff to the Node environment
      const urls = await page.$$eval('section ol > li', (liElements) => {
        console.log('hellog', liElements);
        // filter to include only stocked books
        liElements = liElements.filter(
          (link) =>
            link.querySelector('.instock.availability > i ')?.textContent !==
            'In stock'
        );

        console.log('li elements again', liElements);

        // xtract links form the data

        const links = liElements.map(
          (el) => (el.querySelector('h3 > a') as HTMLAnchorElement)?.href
        );

        return links;
      });

      console.log('urls', urls);

      const pagePromise = (link: string) =>
        new Promise(async (resolve, reject) => {
          let dataObj: any = {};
          let newPage = await browser.newPage();

          try {
            await newPage.goto(link, {
              waitUntil: 'networkidle2',
            });

            await page.waitForSelector('.container-fluid');

            dataObj['bookTitle'] = await newPage.$eval(
              '.product_main > h1',
              (text) => text?.textContent ?? null
            );

            dataObj['bookPrice'] = await newPage.$eval(
              '.price_color',
              (text) => text.textContent ?? null
            );

            dataObj['nowAvailable'] = await newPage.$eval(
              '.instock.availability',
              (text) => {
                if (!text) return 0;
                // strip new line and tab spaces
                const newText = text.textContent!.replace(
                  /(\r\n\t|\n|\r|\t)/gm,
                  ''
                );
                // Get the number of stock available
                const regexp = /^.*\((.*)\).*$/i;

                const stockAvailable = regexp.exec(newText);
                let available = stockAvailable
                  ? stockAvailable[1].toString().split(' ')[0]
                  : 0;

                return available;
              }
            );

            dataObj['imageUrl'] = await newPage.$eval(
              '#product_gallery img',
              (img) => (img as HTMLImageElement).src
            );

            //
            try {
              dataObj['bookDescription'] = await page.$eval(
                '#product_description',
                (div) => {
                  if (!div) return null;
                  div?.nextSibling?.nextSibling?.textContent ?? null;
                }
              );
            } catch (e) {
              console.log('error here', e);
              dataObj['bookDescription'] = null;
            }
            dataObj['upc'] = await newPage.$eval(
              '.table.table-striped > tbody > tr > td',
              (table) => table.textContent
            );

            resolve(dataObj);
          } catch (e) {
            console.log('this is error', e);
            reject(e);
          }

          await newPage.close();
        });

      for await (const link of urls) {
        console.log('link here', link);
        const currentPageData = await pagePromise(link);
        scrapedData.push(currentPageData);
        // console.log('current page data', currentPageData);
      }

      //   assume
      let nextButtonExists = false;
      let nextButton;

      try {
        nextButton = await page.$eval('.next > a', (a) => a);
        nextButtonExists = true;
      } catch (e) {
        nextButtonExists = false;
      }

      if (nextButtonExists) {
        await page.click('.next > a');
        await scrapeCurrentPage();
      }

      await page.close();
      //   this should not be returned because we are filling the variable with scrapeCurrentPage function
      //   return scrapedData;
    }

    await scrapeCurrentPage();
    console.log('data', scrapedData);
    return scrapedData;
  },
};

export const pageScraper = scraperObject;
