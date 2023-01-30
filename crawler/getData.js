const fs = require('fs');
const path = require('path');
const imageDownloader = require('./helpers/imageDownloader');

const selectors = {
  press_and_hold: `//div[contains(., 'Press & Hold')]`,
  button_close: 'button[aria-label="Close Message"]',
  items:
    'ul[data-testid="property-list-container"] > li[data-testid="result-card"]',
  button_feedback_close:
    'img[src="https://siteintercept.qualtrics.com/static/q-siteintercept/~/img/svg-close-btn-black-5.svg"]',
  item_url: 'a[data-testid="property-anchor"]',
  item_gallery: 'img[data-testid="gallery-item-photo"]',
  image_list: 'div[data-testid="vertical-gallery"] > div',
  image_url: 'picture > img',
};

const delay = async (page, selector) => {
  let attempt = 0; 
  let isLoaded = false;
  do { 
    await page.waitForTimeout(2000);
    if ((await page.$(selector)) != null) { 
      isLoaded = true;
      return;
    }
    attempt++;
  } while (attempt < 10 && !isLoaded); 
};


const popups = async (page) => {
  // Conditional - close feedback alert
  if ((await page.$(selectors.button_feedback_close)) != null) {
    const btn = await page.$(selectors.button_feedback_close);
    btn.click();
    await page.waitForTimeout(2000);
  }
  // Conditional - close feedback alert
  if ((await page.$(selectors.button_close)) != null) {
    const btn = await page.$(selectors.button_close);
    btn.click();
    await page.waitForTimeout(2000);
  } 
}

module.exports = getProducts = async (page, data) => {
  try {
    const pages_from = parseInt(data.pages_from);
    const pages_to = parseInt(data.pages_to);
    let itemUrls = [];

    for (let i = pages_from; i <= pages_to; i++) {
      console.log(`Current page: ${i}, Remaining pages: ${pages_to - i}`);
      await page.goto(`${data.website}/pg-${i}`, {
        waitUntil: 'domcontentloaded',
      });

      // Extra delay
      await delay(page, selectors.items);
      await popups(page);
    

      // Get item URLs
      if ((await page.$(selectors.items)) != null) {
        const lis = await page.$$(selectors.items);
        for (let j = 0; j < lis.length; j++) {
          if ((await lis[j].$(selectors.item_url)) != null) {
            const address = await lis[j].$eval(selectors.item_url, (el) =>
              el.getAttribute('href')
            );
            const url = `https://www.realtor.com${address}`;
            itemUrls.push(url);
          }
        }
      }

      // Access each item and download images
      if (itemUrls.length) {
        for (let j = 0; j < itemUrls.length; j++) {
          console.log(
            `--Downloading images, Item: ${
              j + 1
            }, Page: ${i}, Remaining items: ${itemUrls.length - j}`
          );

          // Validate output file directory

          const itemName = itemUrls[j].split('/').pop();
          const filePath = (storeinfopath = path.join(
            __dirname,
            `../output/${itemName}`
          ));
          if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath);
          }
          await page.goto(itemUrls[j], {
            waitUntil: 'domcontentloaded',
          });

          // Extra delay 
          await delay(page, selectors.item_gallery);
          await popups(page); 
        

          // Access image gallery
          if ((await page.$(selectors.item_gallery)) != null) {
            const btn = await page.$(selectors.item_gallery);
            btn.click();
            await page.waitForTimeout(2000);
            await popups(page); 

            // Extra delay
            if ((await page.$(selectors.image_list)) == null) {
              await page.waitForTimeout(3000);
            }

            // Get image URLs
            if ((await page.$(selectors.image_list)) != null) {
              const divs = await page.$$(selectors.image_list);
              for (let b = 0; b < divs.length; b=b+2) {
                let toElement = `div[data-testid="vertical-gallery"] > div:nth-child(${b})`;
                if ((await page.$(toElement)) != null) {
                  // Scroll down and make delay
                  await page.$eval(toElement, (e) => {
                    e.scrollIntoView({
                      behavior: 'smooth',
                      block: 'end',
                      inline: 'end',
                    });
                  });
                  await page.waitForTimeout(1000);
                }
              }
              await page.$eval(`div[data-testid="vertical-gallery"]`, (e) => {
                e.scrollIntoView({
                  behavior: 'smooth',
                  block: 'end',
                  inline: 'end',
                });
              });
              await page.waitForTimeout(2000);
              await popups(page); 
              const imgDivs = await page.$$(selectors.image_list);
              for (let b = 0; b < imgDivs.length; b++) {
                // Get image url
                if ((await imgDivs[b].$(selectors.image_url)) != null) {
                  const imageUrl = await imgDivs[b].$eval(
                    selectors.image_url,
                    (el) => el.getAttribute('src')
                  );
                  if (imageUrl) {
                    await imageDownloader(
                      imageUrl,
                      `${itemName}/${b + 1}.${imageUrl.split('.').pop()}`
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};
