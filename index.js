// server/index.js
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
const uri =
  "mongodb+srv://FirstDB:firstDB@cluster0.cynajx1.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB successfully!");

    const db = client.db("FreeMarket");
    const jobCollection = db.collection("jobs");

    // -------------------------------
    // 🟢 CREATE → Add a new job
    // -------------------------------
    app.post("/addjob", async (req, res) => {
      try {
        const job = req.body;

        // Required fields for a job
        const newJob = {
          title: job.title,
          postedBy: job.postedBy || "Anonymous",
          category: job.category || "General",
          summary: job.summary || job.description || "",
          coverImage: job.coverImage || "",
          userEmail: job.userEmail || "",
          createdAt: new Date(),
          acceptedByEmail: job.acceptedByEmail || null, // optional
        };

        const result = await jobCollection.insertOne(newJob);
        res.status(201).send({ success: true, data: result });
      } catch (err) {
        console.error("Failed to add job:", err);
        res.status(500).send({ success: false, message: "Failed to add job" });
      }
    });

    // -------------------------------
    // 🔵 READ → Get all jobs
    // -------------------------------
    app.get("/alljobs", async (req, res) => {
      try {
        const jobs = await jobCollection.find().sort({ createdAt: -1 }).toArray();
        res.status(200).send(jobs);
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch jobs", error: err });
      }
    });

    // -------------------------------
    // 🟡 READ → Get single job by ID
    // -------------------------------
    app.get("/alljobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const job = await jobCollection.findOne({ _id: new ObjectId(id) });
        res.status(200).send(job);
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch job", error: err });
      }
    });

    // -------------------------------
    // 🟠 UPDATE → Update a job by ID
    // -------------------------------
    app.put("/updatejob/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedJob = req.body;

        const result = await jobCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedJob }
        );

        res.status(200).send({ success: true, data: result });
      } catch (err) {
        res.status(500).send({ success: false, message: "Failed to update job" });
      }
    });

    // -------------------------------
    // 🔴 DELETE → Delete a job by ID
    // -------------------------------
    app.delete("/deletejob/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await jobCollection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send({ success: true, data: result });
      } catch (err) {
        res.status(500).send({ success: false, message: "Failed to delete job" });
      }
    });

    // -------------------------------
    // 👤 READ → Jobs added by logged-in user
    // -------------------------------
    app.get("/my-added-jobs/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const jobs = await jobCollection.find({ userEmail: email }).toArray();
        res.status(200).send(jobs);
      } catch (err) {
        res
          .status(500)
          .send({ success: false, message: "Failed to fetch my added jobs" });
      }
    });

    // -------------------------------
    // 👤 READ → Jobs accepted by logged-in user
    // -------------------------------
    app.get("/my-accepted-tasks/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const jobs = await jobCollection.find({ acceptedByEmail: email }).toArray();
        res.status(200).send(jobs);
      } catch (err) {
        res
          .status(500)
          .send({ success: false, message: "Failed to fetch my accepted tasks" });
      }
    });

  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
  }
}

run().catch(console.dir);

// 🏠 Default route
app.get("/", (req, res) => {
  res.send("🚀 FreeMarket Server is running!");
});

app.listen(port, () => {
  console.log(`🔥 Server running on http://localhost:${port}`);
});
