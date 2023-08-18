import express from "express";
import puppeteer from 'puppeteer';
//import path from "path";

const app = express();

// Enable JSON parsing middleware
app.use(express.json());
// Serve static files from the "public" directory
app.use(express.static('/home/meleeman/Webwork/BNHA-smashpass/vite-project/dist'));

// Define a route to handle POST requests
app.get('/', (req, res) => {
    res.sendFile('index.html');
});

// Define a route for handling Puppeteer operations
app.get('/scrape', async (req, res) => {
    
    
    // Launch a headless browser
    const browser = await puppeteer.launch({
    headless : "new",
    args:[
    '--window-size=1920,1080',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'
    ]
  });
    console.log(browser);
    const page = await browser.newPage();
    let result;
    // Navigate to a URL and perform scraping or testing tasks
    await page.goto('https://myheroacademia.fandom.com/wiki/List_of_Characters',{waitUntil : 'domcontentloaded',});
    console.log('went to page');
    // await page.waitForFunction(() => 
    //     document.querySelectorAll('.wikia-gallery-item').length
    // );
    await page.waitForSelector(".wikia-gallery-item",{timeout:60000})
    // Wait for the desired number of items to load
    await page.waitForFunction(`document.querySelectorAll('.wikia-gallery-item').length`);
    try { 
        result = await page.$$eval(`.wikia-gallery-item`,(wikiaItem) => {
            return wikiaItem.map((el) => {
                return {innerText:el.innerText, textContent:el.textContent };
            });
        });
        console.log(result);
    }
    catch(err) {
        console.log(err);
        res.json({err:err});
    }
    //const pageTitle = await page.title();

    // Close the browser
    

    // Send the scraped data as a response
    res.json({response:result});
    await browser.close();
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
