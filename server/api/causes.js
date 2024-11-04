import { MongoClient, ObjectId } from 'mongodb';

let db = null;

async function connectToDatabase() {
  if (!db) {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    db = client.db('sortie');  // Connect to the MongoDB database
  }
  return db;
}

// Helper function to recursively find and add causes to nested symptoms
const addCauseToNestedSymptom = (symptomsArray, symptomId, newCause) => {
  for (let symptom of symptomsArray) {
    if (symptom._id.toString() === symptomId) {
      // Found the symptom, push the new cause
      symptom.causes.push(newCause);
      return true;
    }
    // Recursively check if the symptom has nested symptoms
    if (symptom.symptoms && symptom.symptoms.length > 0) {
      const found = addCauseToNestedSymptom(symptom.symptoms, symptomId, newCause);
      if (found) return true;
    }
  }
  return false;
};

export default defineEventHandler(async (event) => {
  const db = await connectToDatabase();
  const method = event.req.method;

  // Read the request body
  const body = await readBody(event);
  const { _id, symptomId, newCause, collectionName } = body;

  // Ensure the collectionName and symptomId are provided
  if (!collectionName || !symptomId) {
    return {
      statusCode: 400,
      message: 'Collection name (collectionName) and symptom ID (symptomId) are required.',
    };
  }

  // Get the specified collection dynamically
  const collection = db.collection(collectionName);

  // Handle POST request (for adding a cause to a symptom)
  if (method === 'POST') {
    if (!_id || !newCause) {
      return {
        statusCode: 400,
        message: 'Document ID (_id) and new cause are required for adding a cause.',
      };
    }

    try {
      const objectId = new ObjectId(_id); // Convert document _id to ObjectId

      // Fetch the document to modify
      const document = await collection.findOne({ _id: objectId });

      if (!document) {
        return {
          status: 'error',
          message: 'No document found with the provided _id',
        };
      }

      // Ensure the cause has a name and linkedSymptom
      // if (!newCause.name || !newCause.linkedSymptom) {
      //   return {
      //     statusCode: 400,
      //     message: 'Both name and linkedSymptom are required for the cause.',
      //   };
      // }

      newCause._id = new ObjectId();  // Optionally generate a unique ID for the cause (if needed)

      // Recursively find the target symptom and add the cause
      const added = addCauseToNestedSymptom(document.symptoms, symptomId, newCause);

      if (!added) {
        return {
          status: 'error',
          message: 'No symptom found with the provided symptomId',
        };
      }

      // Update the document after adding the cause
      const updateResult = await collection.updateOne(
        { _id: objectId },
        { $set: { symptoms: document.symptoms } }  // Update the entire symptoms array
      );

      if (updateResult.matchedCount === 0) {
        return {
          status: 'error',
          message: 'Failed to update the document',
        };
      }

      return {
        status: 'success',
        message: 'Cause added successfully',
        newCauseId: newCause._id,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: `Error updating document: ${error.message}`,
      };
    }
  }
});
