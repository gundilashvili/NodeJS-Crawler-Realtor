const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const { executablePath } = require('puppeteer');

const getData = require('./crawler/getData');
const readJson = require('./crawler/helpers/readJson');

const app = async () => {
  try {
    const data = await readJson('config.json');

    // Configure browser
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      ignoreDefaultArgs: ['--hide-scrollbars'],
      args: ['--no-sandbox', '--start-maximized'],
      ignoreHTTPSErrors: true,
      executablePath: executablePath(),
    });

    // Create page
    const page = await browser.newPage();

    // Configure the navigation timeout
    await page.setDefaultNavigationTimeout(0);

    // Get item URLs and download images
    getData(page, data);
  } catch (e) {
    console.log(e);
  }
};
app();
