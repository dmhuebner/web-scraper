const cors = require('cors')({origin: true}),
    cheerio = require('cheerio'),
    getUrls = require('get-urls'),
    fetch = require('node-fetch'),
    puppeteer = require('puppeteer');

const scrapeMetatags = (text) => {
    const urls = Array.from(getUrls(text));

    const requests = urls.map(async url => {
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);

        const getMetatag = (name) => {
            $(`meta[name=${name}]`).attr('content') ||
            $(`meta[property="og:${name}"]`).attr('content') ||
            $(`meta[property="twitter:${name}"]`).attr('content');
        };

        const scrapedData = {
            url,
            title: $('title').first().text(),
            favicon: $('link[rel="shortcut icon"]').attr('href'),
            description: getMetatag('description'),
            author: getMetatag('author')
        };

        console.log(scrapedData);

        return scrapedData;
    });
};

const scrapeImages = async (loginUrl, username, password) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    await page.goto(loginUrl);

    await page.screenshot({path: '1.png'});

    await page.type('[name=username]', username);
    await page.type('[name=password]', password);

    await page.screenshot({path: '2.png'});

    await page.click('[type=submit]');

    await page.waitFor(5000);

    await page.goto(`https://www.instagram.com/${username}`);

    await page.waitForSelector('img', {visible: true});

    await page.screenshot({path: '3.png'});

    // Execute code in the DOM - scrape

    const data = await page.evaluate(() => {
        const images = document.querySelectorAll('img');

        const urls = Array.from(images).map(image => image.src);

        return urls;
    });

    await browser.close();
};

// Test
const execute = async () => {
    const result = await scrapeMetatags('https://twitter.com/');
    console.log(result);
};

execute();
