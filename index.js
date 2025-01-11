const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

// middle ware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://assignment-11-eb26e.web.app",
      "https://assignment-11-eb26e.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  // verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    
    const userCollection = client.db("serviceReviews").collection("users");
    const serviceCollection = client
      .db("serviceReviews")
      .collection("services");
    const reviewsCollection = client.db("serviceReviews").collection("reviews");

    // auth related APIs
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,

          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,

          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    app.get("/services", async (req, res) => {
      const email = req.query.email;

      let result;

      if (email) {
        const query = { userEmail: email };
        result = await serviceCollection.find(query).toArray();
      } else {
        result = await serviceCollection.find().toArray();
      }

      res.send(result);
    });

    app.get("/featured-services", async (req, res) => {
      try {
        const topService = await serviceCollection
          .find()
          .sort({ rating: -1 })
          .limit(6)
          .toArray();
        res.send(topService);
      } catch (error) {
        console.error("Error fetching top-rated movies:", error);
        res.status(500).send({ message: "Failed to fetch top-rated movies" });
      }
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });
    app.get("/reviews", async (req, res) => {
      const { serviceId, email } = req.query;
      let query = {};
      if (serviceId) {
        query.serviceId = serviceId;
      }
      if (email) {
        query.userEmail = email;
      }
      const cursor = reviewsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/services", async (req, res) => {
      const newService = req.body;

      const result = await serviceCollection.insertOne(newService);
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const { _id, ...review } = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    app.put("/services/:id", async (req, res) => {
      const { id } = req.params;
      const updatedService = req.body;
      const result = await serviceCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedService }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).send({
          success: false,
          message: "Review not found or no changes made.",
        });
      }
      res.send({ success: true, message: "Review updated successfully." });
    });

    app.put("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      const { reviewText, rating } = req.body;
      if (!reviewText || rating == null) {
        return res.status(400).send({
          success: false,
          message: "Review text and rating are required.",
        });
      }

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          reviewText,
          rating,
        },
      };

      const result = await reviewsCollection.updateOne(filter, updateDoc);

      if (result.modifiedCount === 0) {
        return res.status(404).send({
          success: false,
          message: "Review not found or no changes made.",
        });
      }
      res.send({ success: true, message: "Review updated successfully." });
    });

    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await serviceCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount > 0) {
          res.send({
            success: true,
            message: "Service deleted successfully",

            deletedService: result,
          });
        } else {
          res
            .status(404)
            .send({ success: false, message: "Service not found" });
        }
      } catch (error) {
        console.error("Error deleting Service:", error);
        res
          .status(404)
          .send({ success: false, message: "Failed to delete service" });
      }
    });
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;

      try {
        const result = await reviewsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount > 0) {
          res.send({
            success: true,
            message: "Review deleted successfully",

            deletedReview: result,
          });
        } else {
          res.status(404).send({ success: false, message: "Review not found" });
        }
      } catch (error) {
        console.error("Error deleting movie:", error);
        res
          .status(404)
          .send({ success: false, message: "Failed to delete review" });
      }
    });

    // Count Routes for Users, Reviews, and Services of the website...
    app.get("/count/users", async (req, res) => {
      const totalUsers = await userCollection.countDocuments();
      res.send({ totalUsers });
    });

    app.get("/count/reviews", async (req, res) => {
      const totalReviews = await reviewsCollection.countDocuments();
      res.send({ totalReviews });
    });

    app.get("/count/services", async (req, res) => {
      const totalServices = await serviceCollection.countDocuments();
      res.send({ totalServices });
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
