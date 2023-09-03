import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
	name:String,
	url: String,
	page:String,
	smashed:[{
		ip: String,
		sexualPreference:String,
	}],
	passed:[{
		ip: String,
		sexualPreference:String,
	}]

});

export const Character = mongoose.model('Character',characterSchema);
