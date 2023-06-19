const fs = require('fs');
const _ = require('lodash');
const sleep = require('system-sleep');
// const { dataFolder } = require('./constants');
let scrapedData = [];
const dataJson = './feibzw/dataJson/';
const dataHtml = './feibzw/dataHtml/';
let rawdata = fs.readFileSync(`feibzw/links.json`);
let links = JSON.parse(rawdata);

const replaceAll = (str, search, replacement) => {
    let newStr = '';
    if (_.isString(str)) { // maybe add a lodash test? Will not handle numbers now.
        newStr = str.split(search).join(replacement);
    }
    return newStr;
};

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

 //Chương 102: Trí tuệ vô song =>Chương 102
function getClearText(text){
    let result = text;
    result = replaceAll(result,' ','');
    result = replaceAll(result,'飞速中文.com 中文域名一键直达','');
    result = replaceAll(result,'Truyện mới hay dành cho bạn','');
    result = replaceAll(result,'Top Truyện hay nhất','');
    result = replaceAll(result,'Kéo xuống dưới để đọc chương tiếp bạn nhé !!','');

    return result;
}

function checkDongNenLay(text){
    text = text.trim();
    if(text.indexOf('.com')>0){
        return false;
    }
    if(text.indexOf('配色：')>0){
        return false;
    }
    if(text.indexOf('字号：增大减小')>0){
        return false;
    }
    if(text.indexOf('自动滚屏：')>0){
        return false;
    }
    if(text.indexOf('自动翻页：')>0){
        return false;
    }

    return true;
}

const scraperObject = {
    async scraper(browser){
        // Loop through each of those links, open a new page instance and get the relevant data from them
        let pagePromise = (chuong, link) => new Promise(async(resolve, reject) => {
            let dataObj = {};
            // let nameFile = replaceAll(replaceAll(title.split('：')[0],'第',''),'章','');
            let page = await browser.newPage();
            await page.goto(link);
            await page.waitForSelector('.chaptertitle'); //hdkt body
            let title = await page.$eval('.chaptertitle', text => text.textContent);
            dataObj['title'] = title;
            
            let content = '';

            let plist = await page.$$eval(".chaptercontent p", els => els.map(e => e.textContent))

            for(p in plist){
                let line = getClearText(plist[p]);
                if(checkDongNenLay(line))
                    content += `<p>${line}</p>`;
            }
            dataObj['content'] = content;
            fs.writeFile( `${dataHtml}${chuong}.json`, JSON.stringify(dataObj), 'utf8', function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log(`The data has been scraped and saved successfully! View it at ${dataHtml}${chuong}.json`);
            });

            resolve(dataObj);
            
            await page.close();
        });

        let i = 0;
        let step = 0
        let lengthStep = 1000;
        // for(i=step*lengthStep;i<=(1+step)*lengthStep;i++){
        for(i=684;i<=(1+step)*lengthStep;i++){
            let currentPageData = await pagePromise(i+1, links[i].link);
            scrapedData.push(currentPageData);
    
            console.log(currentPageData.title);
            await delay(3000);
        }
        // for(i=3377;i<=3500;i++){
        //     let link = 'https://tamlinh247.vn/truyen-hau-due-kiem-than/chuong-' + i+'/';

        //     let currentPageData = await pagePromise(i, link);
        //     scrapedData.push(currentPageData);
    
        //     console.log(currentPageData.title);
        //     await delay(2500);
        // }

        // for(link in urls){
        // }

        // fs.writeFile("e:/Works/Chinese/srcChi/tlh_caoBaiVietWeb/data.json", JSON.stringify(scrapedData), 'utf8', function(err) {
        // fs.writeFile(`${dataFolder}data.json`, JSON.stringify(scrapedData), 'utf8', function(err) {
        //     if(err) {
        //         return console.log(err);
        //     }
        //     console.log("The data has been scraped and saved successfully! View it at './data.json'");
        // });

    }
}

module.exports = scraperObject;