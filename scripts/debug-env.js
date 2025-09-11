// Test to see where the modified MONGODB_URI is coming from
require('dotenv').config();

console.log('dotenv MONGODB_URI:');
console.log(process.env.MONGODB_URI);

console.log('\nEnvironment MONGODB_URI:');
console.log(process.env.MONGODB_URI);