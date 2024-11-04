import { MongoClient, ObjectId } from 'mongodb';

let db = null;

// Helper function to connect to the MongoDB database
async function connectToDatabase() {
  if (!db) {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    db = client.db('sortie');
  }
  return db;
}

export default defineEventHandler(async (event) => {
  // Get the HTTP method and query params
  const method = getMethod(event);  // Get the request method
  const query = getQuery(event);  // Get query params from the URL
  
  // Read the request body (for non-GET requests)
  const body = method !== 'GET' ? await readBody(event) : {};

  // Check for collectionName in query parameters or body
  const collectionName = query?.collectionName || body?.collectionName;

  // Validate that collectionName is provided
  if (!collectionName) {
    return {
      statusCode: 400,
      message: 'Collection name (collectionName) is required.',
    };
  }

  const db = await connectToDatabase();
  const collection = db.collection(collectionName);

  // Handle GET requests
  if (method === 'GET') {
    try {
      const documents = await collection.find().toArray();  // Fetch all documents in the collection
      return documents;
    } catch (error) {
      return {
        statusCode: 500,
        message: `Error fetching documents: ${error.message}`,
      };
    }
  }

  // Handle POST requests
  if (method === 'POST') {
    try {
      const { name, symptoms } = body;
      if (!name) {
        return {
          statusCode: 400,
          message: 'Name field is required.',
        };
      }

      // Create the document structure
      const newDocument = { name, symptoms: symptoms || [] };
      const result = await collection.insertOne(newDocument);

      return {
        status: 'success',
        insertedId: result.insertedId,
        message: 'Data inserted successfully',
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: `Error inserting document: ${error.message}`,
      };
    }
  }

  // Handle PUT requests
// Handle PUT requests
if (method === 'PUT') {
  const { _id, name } = body;
  if (!_id) {
    return {
      statusCode: 400,
      message: 'Document ID (_id) is required for updating.',
    };
  }

  if (!name) {
    return {
      statusCode: 400,
      message: 'Name field is required for updating.',
    };
  }

  try {
    // Convert string _id to MongoDB ObjectId
    const objectId = new ObjectId(_id);
    
    // Update only the name field
    const updateData = { name };
    
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData }  // Only updates the `name` field
    );

    if (result.matchedCount === 0) {
      return {
        status: 'error',
        message: 'No document found with the provided _id',
      };
    }

    return {
      status: 'success',
      message: 'Name updated successfully',
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: `Error updating document: ${error.message}`,
    };
  }
}


  // Return 405 for unsupported methods
  return {
    statusCode: 405,
    message: 'HTTP method is not allowed.',
  };
});
