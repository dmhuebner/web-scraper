const cors = require('cors')({origin: true}),
    cheerio = require('cheerio'),
    getUrls = require('get-urls'),
    fetch = require('node-fetch');

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

// Test
const execute = async () => {
    const result = await scrapeMetatags('https://nytimes.com/');
    console.log(result);
};

execute();
