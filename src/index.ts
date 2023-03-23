const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  // Setup
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    fs.writeFile('books.json', '', function (err) {
        if (err) throw err;
    });

    await page.goto("http://books.toscrape.com/?");
    // try to get this w/o getByRole
    const bookListLocator = await page.locator('.product_pod').all();
    const bookList = await bookListLocator.map(async (book) => {
        const title = await book.locator('h3 > a').innerText();
        const availability = await book.locator('.instock.availability').innerText();
        const rating  = await book.locator('.star-rating').getAttribute('class');

        //for each book, open up a new page and get the description
        const bookPage = await browser.newPage();
        const href = await book.locator('h3 > a').getAttribute('href');
        await bookPage.goto(`http://books.toscrape.com/${href}`);
        const description = await bookPage.locator('#product_description + p').innerText();
        const price = await bookPage.locator('.table.table-striped > tbody > tr:nth-child(4) > td').innerText();

        console.log(title, price, availability, rating)
        
        fs.appendFile('books.json',
            JSON.stringify({ title, price, availability, description }) + ',\n',
            function (err) {
                if (err) throw err;
            }
        );

        return { title, price, availability, description };
    });
    
    await page.waitForTimeout(1000);
// await browser.close();
})();
