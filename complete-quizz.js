const puppeteer = require("puppeteer");
const { data } = require("./data.js");

(async () => {
    let browser;
    try {
        console.time("Quizz completion took");
        browser = await puppeteer.launch({
            // headless: false,
            defaultViewport: {
                width: 1280,
                height: 800
            }
        });
        const page = await browser.newPage();
        await page.goto("https://psytests.org/psystate/san1.html");

        await page.waitFor(500);
        console.log("###ID", browser.process().pid);
        await page.evaluate(arg1 => {
            answers = JSON.parse(arg1);
            console.log("###", answers);

            for ([question, answer] of Object.entries(answers)) {
                console.log(question, answer);
                try {
                    qtlAnswer(question, answer);
                } catch (err) {}
            }
        }, JSON.stringify(data[0].answers));
        await page.waitFor(500);
        await page.waitFor("input.stdResButton");
        await (await page.$("input.stdResButton")).click();

        const shareResult = 'a[title=" постоянная ссылка на ваш результат "]';
        await page.waitFor(shareResult);
        await page.waitFor(500);
        const href = await page.$eval(shareResult, e => e.getAttribute("href"));
        console.log("$$$", href);
        await (await page.$("body")).screenshot({
            path: `screenshots/${browser.process().pid}.png`
        });
        await browser.close();
        console.timeEnd("Quizz completion took");
    } catch (err) {
        browser.close().catch(err => {});
    }
})();
