import { startBrowser } from './browser';
import { scraperController } from './page-controller';

const start = async () => {
  // start the brwoser and create a browser instnace
  const browserInstance = await startBrowser();

  // pass the brwoser instance to the scraper controller
  scraperController(browserInstance);
};

start();
