const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hellow world");
});

// connect with database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1y2cc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const grocaCollection = client.db("grocaIteams").collection("iteams");
const run = async () => {
  try {
    await client.connect();
    // get data from database
    app.get("/iteams", async (req, res) => {
      const query = {};
      const filter = grocaCollection.find(query);
      const result = await filter.toArray();
      res.send(result);
    });
  } finally {
  }
};

run().catch(console.dir);

app.listen(port, () => {
  console.log("server number", port);
});
