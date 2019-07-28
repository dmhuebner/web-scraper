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

        return {
            url,
            title: $('title').first().text(),
            favicon: $('link[rel="shortcut icon"]').attr('href'),
            description: getMetatag('description'),
            author: getMetatag('author')
        };
    });

    return requests;
};

const scrapeImages = async (loginUrl, username, password) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    await page.goto(loginUrl);

    await page.waitFor(1000);

    await page.screenshot({path: 'screenshots/1.png'});

    await page.type('input[name=username]', username);
    await page.type('input[name=password]', password);

    await page.screenshot({path: 'screenshots/2.png'});

    await page.click('[type=submit]');

    await page.waitFor(5000);

    await page.goto(`https://www.instagram.com/${username}`);

    await page.waitForSelector('img', {visible: true});

    await page.screenshot({path: 'screenshots/3.png'});

    // Execute code in the DOM - scrape

    const data = await page.evaluate(() => {
        const images = document.querySelectorAll('img');

        const urls = Array.from(images).map(image => image.src);

        return urls;
    });

    await browser.close();

    return data
};

// Test
const tryIt = async () => {
    const result = await scrapeMetatags('https://twitter.com/');
    const scrapedImages = await scrapeImages('https://www.instagram.com/accounts/login', 'username', 'password');
    console.log(result);
    console.log(scrapedImages);
};

tryIt();
