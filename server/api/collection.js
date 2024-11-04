import { MongoClient } from 'mongodb';

let db = null;

async function connectToDatabase() {
  if (!db) {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    db = client.db('sortie');  // Connect to the 'sortie' database
  }
  return db;
}

export default defineEventHandler(async (event) => {
  const db = await connectToDatabase();
  const method = event.req.method;

  // Handle collection creation
  if (method === 'POST') {
    const body = await readBody(event);
    const { collectionName, options } = body;

    if (!collectionName) {
      return {
        statusCode: 400,
        message: 'Collection name is required.',
      };
    }
    try {
      // Create a new collection if it doesn't exist
      const newCollection = await db.createCollection(collectionName, options || {});
      return {
        status: 'success',
        message: `Collection '${collectionName}' created successfully.`,
        collection: collectionName,
      };
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        return {
          statusCode: 400,
          message: `Collection '${collectionName}' already exists.`,
        };
      } else {
        return {
          statusCode: 500,
          message: `Error creating collection: ${error.message}`,
        };
      }
    }
  }
  // Handle other requests...
});
