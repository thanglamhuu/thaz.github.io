const fs = require('fs');
const _ = require('lodash');

// ./book-scraper/pageScraper.js
const scraperObject = {
    url: 'https://www.feibzw.com/html/35181/index.html',
    async scraper(browser){
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        // Navigate to the selected page
        await page.goto(this.url);
        // Wait for the required DOM to be rendered
        await page.waitForSelector('.bookinfo.clearfix');
        // Get the link to all the required books
        let urls = await page.$$eval('ul > li', links => {
            // Make sure the book to be scraped is in stock
            links = links.filter(link => link.textContent.indexOf('第') >= 0);
            links = links.filter(link => true);
            // Extract the links from the data
            links = links.map(el => el.querySelector('a').textContent + '|' +  el.querySelector('a').href )
            return links;
        });
        
        let dataObj = [];
        for(link in urls){
            let path = urls[link].split('|');
            dataObj.push({title:path[0],link: path[1]});
        }

        fs.writeFile( `feibzw/links.json`, JSON.stringify(dataObj), 'utf8', function(err) {
            if(err) {
                return console.log(err);
            }
        });
    }
}

module.exports = scraperObject;