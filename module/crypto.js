const crypto = require('crypto');
const config = require('../config.json');

const key = config.Password.slice(0, 32).padEnd(32, '0'); 
const iv = Buffer.alloc(16, 0);

function encryptObject(obj) {
	const encrypted = {};
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			encrypted[key] = encrypt(String(obj[key]));
		}
	}
	return encrypted;
}

function encrypt(text) {
	const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
}

function decrypt(encrypted) {
	const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
	let decrypted = decipher.update(encrypted, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}

module.exports = { encrypt, decrypt, encryptObject };