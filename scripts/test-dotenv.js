// Test loading from .env file
require('dotenv').config();

console.log('Loaded MONGODB_URI from .env:');
console.log(process.env.MONGODB_URI);