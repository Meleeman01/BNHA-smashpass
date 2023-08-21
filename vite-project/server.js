import express from "express";
import puppeteer from 'puppeteer';
import fs from 'fs';
import cors from 'cors';
import ViteExpress from "vite-express";


async function writeDataToDisk(data) {
    try {
        const parsedData = JSON.parse(data);
        console.log('JSON is valid:', parsedData);
    } catch (error) {
        console.error('Invalid JSON:', error.message);
        return error.message;
    }
    fs.writeFile('data.json', data, async (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
        } else {
            console.log('JSON data saved to', 'data.json');
        }
    });
}

function loadCachedData() {
    let result;
    try{
        result = JSON.parse(fs.readFileSync('data.json'));
    }
    catch(err) {
        return false;
    }
    return result;
}
//import path from "path";

const app = express();

// Enable JSON parsing middleware
app.use(express.json());
app.use(cors());
// Serve static files from the "public" directory
app.use(express.static('/home/meleeman/Webwork/BNHA-smashpass/vite-project/dist'));

// Define a route to handle POST requests
app.get('/', (req, res) => {
    res.sendFile('index.html');
});

// Define a route for handling Puppeteer operations
app.get('/scrape', async (req, res) => {
    const cache = await loadCachedData();
    console.log(cache,':From Cache');
    if (cache) {
        console.log('loading from cache');
        res.json(cache);
        return;
    }

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
    
    //save data to disk
    await writeDataToDisk(JSON.stringify({response:result}));
    // Send the scraped data as a response
    res.json({response:result});
    await browser.close();
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
ViteExpress.bind(app, server);