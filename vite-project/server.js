import express from 'express';
import puppeteer from 'puppeteer';
import fs from 'fs';
import db from './database.js';
import ViteExpress from 'vite-express';
import cors from 'cors';

function removeSpecificEmojis(inputString) {
	const emojisToRemove = ['♂️', '♀️', '⚥'];

	// Create a regular expression pattern to match the specified emojis
	const pattern = new RegExp(emojisToRemove.map(emoji => escapeRegExp(emoji)).join('|'), 'gu');

	// Remove the matched emojis from the input string
	const cleanedString = inputString.replace(pattern, '');

	return cleanedString.trim();
}

// Function to escape special characters for use in a regular expression
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}



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

// function loadCachedData() {
// 	let result;
// 	try{
// 		result = JSON.parse(fs.readFileSync('data.json'));
// 	}
// 	catch(err) {
// 		return false;
// 	}
// 	return result;
// }
async function addCharactersToDb(data) {
	data.addCharacters = true;
	await db(data,'update');
}
async function loadCharactersFromDb() {
	return await db(true,'fetch');
}
async function smash(data){
	data.smash = true;
	db(data,'update');
}
async function pass(data){
	data.pass = true;
	db(data,'update');
}

async function removeIP(data) {
	return data.map((i)=>{
		if (i.smashed) {
			i.smashed = i.smashed.map((j) => {return {sexualPreference:j.sexualPreference};});
		}
		if (i.passed) {
			i.passed = i.passed.map((j) => {return{sexualPreference:j.sexualPreference};});
		}
		return i;
	});
}

const app = express();

// Enable JSON parsing middleware
app.use(express.json());
app.use(cors());
// Serve static files from the "public" directory
app.use(express.static('/home/meleeman/Webwork/BNHA-smashpass/vite-project/dist'));

// Define a route to handle POST requests
app.get('/', (req, res) => {
	return res.sendFile('index.html');
});

// Define a route for handling Puppeteer operations
app.get('/scrape', async (req, res) => {
	let cache = await loadCharactersFromDb();
	console.log(cache,':From Cache');
	if (typeof cache == 'object' && cache.length != 0) {
		console.log('loading from cache');
		cache = await removeIP(cache);
		console.log(cache);

		return res.json(cache);
		
	}

	// Launch a headless browser
	const browser = await puppeteer.launch({
		headless : 'new',
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
	await page.waitForSelector('.wikia-gallery-item',{timeout:60000});
	// Wait for the desired number of items to load
	// eslint-disable-next-line quotes
	await page.waitForFunction(`document.querySelectorAll('.wikia-gallery-item').length`);
	try { 
		// eslint-disable-next-line quotes
		result = await page.$$eval(`.wikia-gallery-item`,(wikiaItem) => {
			return wikiaItem.map((el) => {
				const anchorEl = el.querySelector('a');
				const name = el.querySelector('.chargallery-profile-caption').innerText;
				return {innerText:name, textContent:el.textContent, 
					characterLink: anchorEl ? `https://myheroacademia.fandom.com${anchorEl.getAttribute('href')}` : false
				};
			});
		});
		console.log(result);
	}
	catch(err) {
		console.log(err);
		res.json({err:err});
	}
	
	//save data to disk
	await writeDataToDisk(JSON.stringify({response:result}));
	await addCharactersToDb({response:result});
	// Send the scraped data as a response
	
	await browser.close();
	return res.json({response:result});
});

app.post('/smash', async (req,res) => {
	req.body.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log(req.body);
	req.body.prefGender = removeSpecificEmojis(req.body.prefGender);
	await smash(req.body);
	return res.json({status:'ok'});
});
app.post('/pass', async(req,res) => {
	req.body.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log(req.body);
	req.body.prefGender = removeSpecificEmojis(req.body.prefGender);
	console.log(req.body);
	await pass(req.body);

	return res.json({status:'ok'});
});

app.post('/analytics', async (req, res) => {
	let result = await loadCharactersFromDb();
	//remove ips before sending to client
	result = await removeIP(result);
	return res.json(result);
});

// Start the server
const port = 3000;
app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});
// ViteExpress.listen(app, port, () => {
// 	console.log(`Server is listening on port ${port}`);
// });
