import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  throw new Error('Please add your Mongo URI to .env.local');
}

export default clientPromise!;

export async function getDb(dbName = "shikshasathi") {
  if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local');
  }
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error("Mongo connection failed", error);
    throw error;
  }
}
