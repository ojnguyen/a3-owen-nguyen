require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const express = require('express');
const app = express();

// Registers static-file middleware
app.use(express.static('public/'));

// Registers JSON-parsing middleware
app.use(express.json());

// NOTE: Weight will be in pounds, reps will be an integer, and ORM will be a float rounded to 2 decimal places.
let liftsCollection;

// ORM = One Rep Max
// Epley formula: ORM = weight * (1 + reps / 30)
const computeORM = function (weight, reps) {
  const unroundedORM = weight * (1 + reps / 30);
  const roundedORM = Math.round(unroundedORM * 100) / 100; // Round to 2 decimal places
  return roundedORM;
};

// Middleware for GET /lifts
app.get('/lifts', async (req, res) => {
  const liftsQuery = await liftsCollection.find({}).toArray(); // Queries DB for all lifts, converts to array
  res.json(liftsQuery); // Sets JSON content-type header and stringifies/sends the lifts array 
});

// Middleware for POST /addLift
app.post('/addLift', async (req, res) => {
  // Build new lift object, push to lifts array, and send back the whole array
  const data = req.body; // JSON-parsing middleware
  const newLift = {
    exercise: data.exercise,
    weight: data.weight,
    reps: data.reps,
    orm: computeORM(data.weight, data.reps)
  };
  await liftsCollection.insertOne(newLift); // Inserts new lift into DB
  const liftsQuery = await liftsCollection.find({}).toArray(); // Queries DB for all lifts, converts to array
  res.json(liftsQuery); // Sets JSON content-type header and stringifies/sends the lifts array back to client
});

// Middleware for POST /deleteLift
app.post('/deleteLift', async (req, res) => {
  const data = req.body; // JSON-parsing middleware
  const deleteID = new ObjectId(data.ID); // Converts string to ObjectId, MongoDB stores _id as type ObjectId
  await liftsCollection.deleteOne({_id: deleteID}); // Deletes the lift from DB with the specified ID
  const liftsQuery = await liftsCollection.find({}).toArray(); // Queries DB for all lifts, converts to array
  res.json(liftsQuery); // Sets JSON content-type header and stringifies/sends the lifts array back to client
})

// Function template from MongoDB's Guide
async function run() {
  // Connect the client to the server	(optional starting in v4.7).
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");

  liftsCollection = client.db("a3-owen-nguyen").collection("lifts"); // Gets/creates lifts collections in DB

  // Starts listening for incoming requests
  app.listen(process.env.PORT || 3000);
}

run().catch(console.dir);