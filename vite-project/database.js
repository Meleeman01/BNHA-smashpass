import 'dotenv/config';
import mongoose from 'mongoose';
import {Character} from './schema/schema.js';

async function lol(data = undefined,queryType = undefined) {
	if(!data) {
		return false;
	}
	
	console.log(process.env.MONGO_URL);
	let result = mongoose.connect(process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}).then(async () => {
		console.log('Connected to MongoDB');
		if(queryType == 'fetch') { 
			console.log('fetching');
			if (data) {
				return await Character.find({}).catch((err) => console.log(err));
			}
			else return [];
		}
		else if (queryType == 'update') {

			if (data.addCharacters) {
				console.log('in databasejs:',data);
				data = data.response.map((el)=>{

					const srcAttributeRegex = /src="(https:\/\/.*?\.png).*?"/;
					const match = el.textContent.match(srcAttributeRegex);

					if (match) {
						const srcAttributeValue = match[1]; // Captured portion of the URL
						console.log(srcAttributeValue);
						el.url = srcAttributeValue;
					} else {
						console.log('src attribute not found.');
					}

					return {name:el.innerText,url:el.url,page:el.characterLink};
				});
				await Character.insertMany(data)
					.then(insertedItems => {
						console.log(`${insertedItems.length} items inserted successfully.`);
						return;
					})
					.catch(error => {
						console.error('Error inserting items:', error);
					});
			}
			else if (data.smash) {
				console.log('from database:',data);

				await Character.findOne({ _id: data.id })
					.then( async(foundCharacter) => {
						// Check if the target IP exists in the 'smashed' or 'passed' arrays
						const ipExistsInSmashed = foundCharacter.smashed.some(item => item.ip === data.ip);
						const ipExistsInPassed = foundCharacter.passed.some(item => item.ip === data.ip);
					
						if (ipExistsInPassed) {
							console.log('ip for character found:', foundCharacter);
							foundCharacter.passed = foundCharacter.passed.filter((i)=>i.ip != data.ip);
							foundCharacter.smashed.push({ip:data.ip,sexualPreference:data.prefGender});
							await foundCharacter.save();
							// You can perform any necessary updates to the foundCharacter here
						} else if (ipExistsInSmashed) {
							//do nothing
						} else {
							console.log('No character found with the specified IP.');
							foundCharacter.smashed.push({ip:data.ip,sexualPreference:data.prefGender});
							await foundCharacter.save();
						}
						return;
					})
					.catch(error => {
						console.error('Error finding character:', error);
					});
			}
			else if (data.pass) {
				
				console.log('from database:',data);
				
				await Character.findOne({ _id: data.id })
					.then( async(foundCharacter) => {
					// Check if the target IP exists in the 'smashed' or 'passed' arrays
						const ipExistsInSmashed = foundCharacter.smashed.some(item => item.ip === data.ip);
						const ipExistsInPassed = foundCharacter.passed.some(item => item.ip === data.ip);
					
						if (ipExistsInSmashed) {
							console.log('ip for character found:', foundCharacter);
							foundCharacter.smashed = foundCharacter.smashed.filter(i => i.ip != data.ip);
							foundCharacter.passed.push({ip:data.ip,sexualPreference:data.prefGender});
							await foundCharacter.save();
						// You can perform any necessary updates to the foundCharacter here
						} else if (ipExistsInPassed) {
							//do nothing
						} else {
							console.log('No character found with the specified IP.');
							foundCharacter.passed.push({ip:data.ip,sexualPreference:data.prefGender});
							await foundCharacter.save();
						}
					})
					.catch(error => {
						console.error('Error finding character:', error);
					});
			}
		}
	}).catch(error => console.log(error));
		
	return await result;
}

export default lol;