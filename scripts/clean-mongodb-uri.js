// Fix MongoDB URI by removing problematic timeout parameters
require('dotenv').config();

console.log('Current MONGODB_URI:');
console.log(process.env.MONGODB_URI);

// Clean the URI by removing the problematic timeout parameters
const cleanUri = process.env.MONGODB_URI
  .replace(/&serverSelectionTimeoutMS=\d+/, '')
  .replace(/&connectTimeoutMS=\d+/, '')
  .replace(/&socketTimeoutMS=\d+/, '')
  .replace(/\?serverSelectionTimeoutMS=\d+&/, '?')
  .replace(/\?connectTimeoutMS=\d+&/, '?')
  .replace(/\?socketTimeoutMS=\d+&/, '?')
  .replace(/&serverSelectionTimeoutMS=\d+$/, '')
  .replace(/&connectTimeoutMS=\d+$/, '')
  .replace(/&socketTimeoutMS=\d+$/, '');

console.log('\nCleaned MONGODB_URI:');
console.log(cleanUri);