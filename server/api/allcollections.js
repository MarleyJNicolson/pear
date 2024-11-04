import { MongoClient } from 'mongodb';

let db = null;

async function connectToDatabase() {
  if (!db) {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    db = client.db('sortie');  // Change 'sortie' to your database name
  }
  return db;
}

export default defineEventHandler(async (event) => {
  const db = await connectToDatabase();

  // Handle GET request to list all collections
  if (event.req.method === 'GET') {
    try {
      // Fetch the list of all collections
      const collections = await db.listCollections().toArray();
      
      // Prepare the response by extracting collection names and ids
      const collectionInfo = collections.map((collection) => {
        return {
          name: collection.name,
          // MongoDB collections do not have _id, but we can include other metadata if needed
          type: collection.type,  // optional: type is usually "collection"
        };
      });

      return {
        status: 'success',
        collections: collectionInfo,
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to fetch collections: ${error.message}`,
      };
    }
  }
});
