let dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@cluster0.r5e76.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const usersCollection = client.db("HireHive").collection("users");
    const jobsCollection = client.db("HireHive").collection("jobs");
    const jobApplicationsCollection = client
      .db("HireHive")
      .collection("jobApplications");

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.patch("/users", async (req, res) => {
      const user = req.body;
      const email = user.email;
      const Password = user.password;
      const LastSignInTime = user.lastSignInTime;
      const filter = { email };
      const updateDoc = {
        $set: {
          lastSignInTime: LastSignInTime,
          password: Password,
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const name = user.name;
      const email = user?.email;
      const lastSignInTime = user.lastSignInTime;
      const creationTime = user.creationTime;
      const signedInMedium = user.signedInMedium;
      const filter = email ? { email } : { name };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name,
          email,
          lastSignInTime,
          creationTime,
          signedInMedium,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.post("/jobs", async (req, res) => {
      const jobPost = req.body;
      const result = await jobsCollection.insertOne(jobPost);
      res.send(result);
    });

    app.get("/jobs", async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    app.post("/jobApplications", async (req, res) => {
      const applicantInfo = req.body;
      const result = await jobApplicationsCollection.insertOne(applicantInfo);
      res.send(result);
    });

    app.get("/jobApplications", async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };
      const cursor = jobApplicationsCollection.find(query);
      const result = await cursor.toArray();
      for (let myapply of result) {
        const jobId = myapply.jobId;
        const query = { _id: new ObjectId(jobId) };
        const desiredjob = await jobsCollection.findOne(query);
        myapply.company_logo = desiredjob.company_logo;
        myapply.company = desiredjob.company;
        myapply.location = desiredjob.location;
      }
      res.send(result);
    });

    app.delete("/jobApplications/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobApplicationsCollection.deleteOne(query);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("HireHive -- a job portal server is running");
});

app.listen(port);
