const { chromium } = require('playwright');
const fs = require('fs');


async function main() {
    // Setup
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    page.setDefaultTimeout(1000000);

    await page.goto("https://books.toscrape.com/catalogue/page-1.html");
    while (true) {
        if (page.url().includes("page-2")) {  // break before page x...
            break;
        }
        const bookListLocator = await page.locator('.product_pod').all();

        for (const book of bookListLocator) {
            // const title = await book.getByRole('heading').innerText();
            //const title = await book.getByRole('heading').innerText();
            // const price = await book.getByText('£').innerText();
            const title = await book.locator('h3 > a').innerText();
            // const availability = await book.locator('.instock.availability').innerText();
            // more convenient to use a CSS locator here
            // const rating = await book.locator('.star-rating').getAttribute('class');
            const price = await book.locator('.price_color').innerText();
            page.pause();
            // const price = await book.getByText('£').innerText();

            //for each book, open up a new page and get the description
            // const bookPage = await browser.newPage();
            // const href = await book.locator('h3 > a').getAttribute('href');
            // // await book.locator('h3 > a').dispatchEvent('click');
            // await bookPage.goto(`https://books.toscrape.com/catalogue/${href}`);  // http://books.toscrape.com/in-her-wake_980/index.html
            // const description = await bookPage.locator('#product_description + p').innerText();
            // const price = await bookPage.locator('.table.table-striped > tbody > tr:nth-child(4) > td').innerText();

            console.log(title, price)

            // await bookPage.close();
            // return { title, price, availability, description };
        };

        // click next button and wait for navigation to complete
        const nextButton = page.getByRole('link', {
            name: 'next',
            exact: true,
        });
        await nextButton.click();
    }

    await page.waitForTimeout(1000);
    // await browser.close();
}

main()