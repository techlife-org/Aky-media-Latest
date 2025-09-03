const { MongoClient } = require('mongodb');
require('dotenv').config();

console.log('Testing connection with URI:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  socketTimeoutMS: 30000
});

client.connect()
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    return client.db().admin().ping();
  })
  .then(() => {
    console.log('✅ Ping successful');
    return client.db().listCollections().toArray();
  })
  .then(collections => {
    console.log('✅ Found', collections.length, 'collections');
    return client.close();
  })
  .then(() => {
    console.log('✅ Connection test completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });