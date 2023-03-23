const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    // Setup
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    fs.writeFile('books.json', '', function (err) {
        if (err) throw err;
    });

    await page.goto("https://books.toscrape.com/catalogue/page-1.html");
    // try to get this w/o getByRole
    while (true) {
        if (page.url().includes("page-3")) {  // break before page x...
            break;
        }
        const bookListLocator = await page.locator('.product_pod').all();
        const bookList = await bookListLocator.map(async (book) => {
            // const title = await book.locator('h3 > a').innerText();
            const title = await book.locator('h3 > a').getAttribute('title');
            const availability = await book.locator('.instock.availability').innerText();
            const rating = await book.locator('.star-rating').getAttribute('class');

            //for each book, open up a new page and get the description
            const bookPage = await browser.newPage();
            const href = await book.locator('h3 > a').getAttribute('href');
            // await book.locator('h3 > a').dispatchEvent('click');
            await bookPage.goto(`https://books.toscrape.com/catalogue/${href}`);  // http://books.toscrape.com/in-her-wake_980/index.html
            const description = await bookPage.locator('#product_description + p').innerText();
            const price = await bookPage.locator('.table.table-striped > tbody > tr:nth-child(4) > td').innerText();

            console.log(title, price, availability, rating)

            fs.appendFile('books.json',
                JSON.stringify({ title, price, availability, description }) + ',\n',
                function (err) {
                    if (err) throw err;
                }
            );
            // await bookPage.close();
            return { title, price, availability, description };
        });
        // click next button and wait for navigation to complete
        const nextButton = page.getByRole('link', {
            name: 'next',
            exact: true,
        });
        await nextButton.click();
    }

    await page.waitForTimeout(1000);
    await browser.close();
})();
