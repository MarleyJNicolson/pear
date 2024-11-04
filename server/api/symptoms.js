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

// Helper function to recursively find and update nested symptoms
const addSubSymptom = (symptomsArray, parentSymptomId, newSubSymptom) => {
  for (let symptom of symptomsArray) {
    if (symptom._id.toString() === parentSymptomId) {
      // Found the symptom, push the new sub-symptom
      symptom.symptoms.push(newSubSymptom);
      return true;
    }
    // Recursively check if the symptom has sub-symptoms
    if (symptom.symptoms && symptom.symptoms.length > 0) {
      const found = addSubSymptom(symptom.symptoms, parentSymptomId, newSubSymptom);
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
  const { _id, newSymptom, parentSymptomId, collectionName } = body;

  // Ensure the collectionName is provided
  if (!collectionName) {
    return {
      statusCode: 400,
      message: 'Collection name (collectionName) is required.',
    };
  }

  // Get the specified collection dynamically
  const collection = db.collection(collectionName);

  // Handle POST request (for inserting new symptoms)
  if (method === 'POST') {
    if (!_id) {
      return {
        statusCode: 400,
        message: 'Document ID (_id) is required for updating.',
      };
    }

    try {
      const objectId = new ObjectId(_id); // Convert document _id to ObjectId

      // Add a unique ID for the new symptom
      newSymptom._id = new ObjectId(); // Each symptom gets its own unique ID
      newSymptom.symptoms = newSymptom.symptoms || [];  // Initialize empty sub-symptoms array
      newSymptom.causes = newSymptom.causes || [];  // Initialize empty causes array

      // If no parentSymptomId is provided, we are adding a symptom to the root "symptoms" array
      if (!parentSymptomId) {
        // Add the new symptom to the root "symptoms" array in the document
        const result = await collection.updateOne(
          { _id: objectId },
          { $push: { symptoms: newSymptom } }  // Add new symptom to the root symptoms array
        );

        if (result.matchedCount === 0) {
          return {
            status: 'error',
            message: 'No document found with the provided _id',
          };
        }

        return {
          status: 'success',
          message: 'Symptom added successfully',
          newSymptomId: newSymptom._id,
        };

      } else {
        // Add new sub-symptom to an existing symptom identified by parentSymptomId
        const document = await collection.findOne({ _id: objectId });

        if (!document) {
          return {
            status: 'error',
            message: 'No document found with the provided _id',
          };
        }

        // Recursively find the parent symptom and add the sub-symptom
        const added = addSubSymptom(document.symptoms, parentSymptomId, newSymptom);

        if (!added) {
          return {
            status: 'error',
            message: 'No parent symptom found with the provided parentSymptomId',
          };
        }

        // Update the document after adding the sub-symptom
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
          message: 'Sub-symptom added successfully',
          newSymptomId: newSymptom._id,
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: `Error updating document: ${error.message}`,
      };
    }
  }
});
