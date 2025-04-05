const fs = require('fs');
const path = require('path');

// A 1x1 transparent PNG
const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Decode base64 to binary
const imageBuffer = Buffer.from(transparentPngBase64, 'base64');

// Write files
fs.writeFileSync(path.join(__dirname, 'icon.png'), imageBuffer);
fs.writeFileSync(path.join(__dirname, 'splash.png'), imageBuffer);
fs.writeFileSync(path.join(__dirname, 'adaptive-icon.png'), imageBuffer);
fs.writeFileSync(path.join(__dirname, 'favicon.png'), imageBuffer);

console.log('Created all placeholder images successfully!'); 