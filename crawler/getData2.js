const { v4: uuidv4 } = require('uuid');
const ImageDownloader = require('./helpers/imageDownloader');
const cheerio = require('cheerio');
const axios = require('axios');

module.exports = getProducts = async (data) => {
  try {
    const selectors = {
      press_and_hold: `//div[contains(., 'Press & Hold')]`,
      items:
        'ul[data-testid="property-list-container"] > li[data-testid="result-card"]  a[data-testid="property-anchor"]',
      button_feedback_close:
        'img[src="https://siteintercept.qualtrics.com/static/q-siteintercept/~/img/svg-close-btn-black-5.svg"]',
      item_url: ' div > div > div > a[data-testid="property-anchor"]',
      item_gallery: 'img[data-testid="gallery-item-photo"]',
      image_list: 'div[data-testid="vertical-gallery"] > div',
      image_url: 'picture > img',
    };

    const headers = {
      'access-control-allow-origin': '*',
      Connection: 'keep-alive',
      'Accept-Encoding': 'gzip, deflate, br',
      Accept: '*/*',
      'User-Agent':
        'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
    };


    const pages_from = parseInt(data.pages_from);
    const pages_to = parseInt(data.pages_to);
    let itemUrls = [];

    for (let i = pages_from; i < pages_to; i++) {
      try {
        const url = `${data.website}/pg-${i}`;
        const res = await axios.get(url, { headers });
        let $, DOM;
        if (res.status == 200 && res.data) {
          DOM = res.data;
          $ = cheerio.load(DOM);
          // Get item URLs
          $(selectors.items, DOM).each(function (index, element) {
            const value = $(element).attr('href');
            if (value) {
              itemUrls.push(`https://www.realtor.com${value}`);
            }
          });

          if(itemUrls.length){
            for(let j=0; j,itemUrls.length; j++){
              
            }
          }
        }
      } catch (e) {
        console.log(e.message);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
