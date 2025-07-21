import { MongoClient, type Db, MongoClientOptions } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 15000, // Increased to 15 seconds
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 1,
  ssl: true,
  tlsAllowInvalidCertificates: false,
  directConnection: false, // Changed to false for replica set
  replicaSet: 'atlas-7b1q5i-shard-0', // Explicitly set replica set
  appName: 'techlife-web-app',
  keepAlive: true,
  keepAliveInitialDelay: 300000, // 5 minutes
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'production') {
  client = new MongoClient(MONGODB_URI, options);
  clientPromise = client.connect().catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process on connection failure in production
  }) as Promise<MongoClient>;
} else {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options);
    global._mongoClientPromise = client.connect().catch(err => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

export default clientPromise;
