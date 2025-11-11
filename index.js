const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
const uri = "mongodb+srv://FirstDB:firstDB@cluster0.cynajx1.mongodb.net/?appName=Cluster0";
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

    const db = client.db('FreeMarket');
    const jobCollection = db.collection('jobs');

    // 🟢 CREATE → Add a new job
    app.post('/addJob', async (req, res) => {
      const job = req.body;
      job.createdAt = new Date();
      const result = await jobCollection.insertOne(job);
      res.send(result);
    });

    // 🔵 READ → Get all jobs
    app.get('/allJobs', async (req, res) => {
      const jobs = await jobCollection.find().sort({ createdAt: -1 }).toArray();
      res.send(jobs);
    });

    // 🟣 READ → Get latest 6 jobs
    app.get('/latestJobs', async (req, res) => {
      const latestJobs = await jobCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(latestJobs);
    });

    // 🟡 READ → Get single job by ID
    app.get('/allJobs/:id', async (req, res) => {
      const id = req.params.id;
      const job = await jobCollection.findOne({ _id: new ObjectId(id) });
      res.send(job);
    });

    // 🟠 UPDATE → Update a job by ID
    app.put('/updateJob/:id', async (req, res) => {
      const id = req.params.id;
      const updatedJob = req.body;

      const result = await jobCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedJob }
      );

      res.send(result);
    });

    // 🔴 DELETE → Delete a job by ID
    app.delete('/deleteJob/:id', async (req, res) => {
      const id = req.params.id;
      const result = await jobCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // 👤 Example: Users collection (optional)
    const userCollection = db.collection('Freelance');
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
  }
}

run().catch(console.dir);

// 🏠 Default route
app.get('/', (req, res) => {
  res.send('🚀 FreeMarket Server is running!');
});

app.listen(port, () => {
  console.log(`🔥 Server running on http://localhost:${port}`);
});
