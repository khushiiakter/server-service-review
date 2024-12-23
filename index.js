const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;


// Td0wO6ICWQx3deDR
// service_hunter

// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7xkdi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const serviceCollection = client.db("serviceReviews").collection("services");
    const reviewsCollection = client.db("serviceReviews").collection("reviews");

    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/reviews", async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email }
      const result = await reviewsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/reviews", async (req, res) => {
      const { serviceId } = req.query;
      const query = { serviceId: serviceId }
      const result = await reviewsCollection.find(query).toArray();
      res.send(result);
    });
    

    app.post("/reviews", async (req, res) =>{
      const {_id, ...review} = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      
      try{
        const result = await reviewsCollection.deleteOne({ _id: new ObjectId(id)});
       

        if (result.deletedCount > 0) {
          res.send({
            success: true,
            message: 'Review deleted successfully',
            
            deletedReview: result,
          })
        }else{
          res.status(404).send({ success: false, message: 'Review not found'});

        }
      } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(404).send({ success: false, message: 'Failed to delete review'});

        
      }
    });

    
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Service review server is running");
});

app.listen(port, () => {
  console.log(`server is running in port: ${port}`);
});
