const puppeteer = require("puppeteer");
const { data } = require("./data_real.js");

console.log('Working with results length', data.length);

(async () => {
    let browser;
    for (let setOfAnswers of data) {
        try {
            console.log(`Running for ${setOfAnswers["Email address"]}`)
            browser = await puppeteer.launch({
                headless: false,
                defaultViewport: {
                    width: 1280,
                    height: 800
                }
            });
            const page = await browser.newPage();
            await page.goto("https://psytests.org/psystate/san1.html");

            await page.waitFor(500);
            // console.log("###ID", browser.process().pid);
            await page.evaluate(arg1 => {
                for ([question, answer] of Object.entries(JSON.parse(arg1))) {
                    console.log(question)
                    console.log(answer)
                    if (question === "Email address" ||
                        question === "Name" ||
                        question === "Timestamp"
                    ) {
                        console.log('skipping', question)
                        continue;
                    }
                    try {
                        qtlAnswer(parseInt(question, 10), parseInt(answer, 10));
                    } catch (err) {
                        // no-op
                    }
                }
            }, JSON.stringify(setOfAnswers));
            await page.waitFor(500);
            await page.waitFor("input.stdResButton");
            await (await page.$("input.stdResButton")).click();

            const shareResult = 'a[title=" постоянная ссылка на ваш результат "]';
            await page.waitFor(shareResult);
            await page.waitFor(500);
            const href = await page.$eval(shareResult, e => e.getAttribute("href"));
            console.log(`${setOfAnswers["Email address"]}: `, href);
            await (await page.$("body")).screenshot({
                path: `screenshots/${setOfAnswers["Email address"]}.png`
            });
            await browser.close();
        } catch (err) {
            console.log(err)
            browser.close().catch(err => { });
        }
    }
})();
