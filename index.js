const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;


//Middlewere
app.use(cors())
app.use(express.json())


const uri =
  `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.epxaz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const database = client.db("cofee");
    const cofeeCollection = database.collection("haiku");
    // collection for user create
    const userDatabase = client.db("cofee").collection("user")

    // Data read 
    app.get("/coffee", async (req, res) => {
      const cursor = cofeeCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    // one data load for update
    app.get('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await cofeeCollection.findOne(query)
      res.send(result)
    })

    app.post("/coffee", async (req, res) => {
      const data = req.body;
      const result = await cofeeCollection.insertOne(data)
      res.send(result)
    })
    //update one data 
    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id)}
      const options = { upsert: true}
      const updateData = {
        $set: {
          name: data.name,
          quantity: data.quantity,
          supplier: data.supplier,
          test: data.test,
          category: data.category,
          details: data.details,
          photo: data.photo,
        }
      }
      const result = await cofeeCollection.updateOne(filter, updateData, options)
      res.send(result)
    });

    // delete operation
    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await cofeeCollection.deleteOne(query)
      res.send(result)
    })

    // Read operator of users
    app.get("/user", async (req, res) => {
      const cursor = userDatabase.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    // user api
    app.post('/user', async (req, res) => {
      const user = req.body;
      const result = await userDatabase.insertOne(user)
      res.send(result)
    })

    // user data delete methode
    app.delete('/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await userDatabase.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// primary home server
app.get("/", (req, res) => {
    res.send("Coffee Store server is running")
})

app.listen(port, () => {
    console.log("Coffee store server is running on port number:", port)
})