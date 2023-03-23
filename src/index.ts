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
        const price = await book.locator('.price_color').innerText();
        const availability = await book.locator('.instock.availability').innerText();
        // console.log(title, price, availability);

        fs.appendFile('books.json',
            JSON.stringify({ title, price, availability }) + ',\n',
            function (err) {
                if (err) throw err;
            }
        );

        return { title, price, availability };
    });
    
    await page.waitForTimeout(1000);
// await browser.close();
})();
