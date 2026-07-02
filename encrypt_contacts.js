const fs = require('fs');
const crypto = require('crypto');

const PASSWORD = 'AquaRevier2026';
const INPUT_FILE = 'contacts.geojson';
const OUTPUT_FILE = 'contacts.enc';

if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Error: ${INPUT_FILE} not found!`);
    process.exit(1);
}

console.log(`Reading ${INPUT_FILE}...`);
const plainText = fs.readFileSync(INPUT_FILE, 'utf8');

console.log("Generating salt and IV...");
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);

console.log("Deriving key using PBKDF2...");
const key = crypto.pbkdf2Sync(PASSWORD, salt, 100000, 32, 'sha256');

console.log("Encrypting database using AES-256-GCM...");
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
const authTag = cipher.getAuthTag();

// Combined buffer structure: salt (16 bytes) + iv (12 bytes) + authTag (16 bytes) + ciphertext
const combined = Buffer.concat([salt, iv, authTag, encrypted]);

console.log(`Saving encrypted file to ${OUTPUT_FILE}...`);
fs.writeFileSync(OUTPUT_FILE, combined.toString('base64'), 'utf8');
console.log(`Success! Encrypted file created successfully.`);
