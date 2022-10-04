const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
// middle ware a
app.use(cors());
app.use(express.json());

// middleware
app.use(cors());
app.use(express.json());

// Json web token function middletare
const verifyJWT = (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = tokenHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
    if (error) {
      return res.status(403).send({ message: "forbidden access" });
    } else {
      req.decoded = decoded;
      next();
    }
  });
};

app.get("/", (req, res) => {
  res.send("hellow heroku");
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
    // get all data from database
    app.get("/iteams", async (req, res) => {
      const query = {};
      const filter = grocaCollection.find(query);
      const result = await filter.toArray();
      res.send(result);
    });

    // get specific data from database
    app.get("/details/:id", async (req, res) => {
      const id = req.params;
      const query = { _id: ObjectId(id) };
      const result = await grocaCollection.findOne(query);
      res.send(result);
    });

    // update data
    app.put("/update/:id", async (req, res) => {
      const id = req.params;
      const iteam = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: iteam,
      };
      const result = await grocaCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // post data
    app.post("/addIteam", async (req, res) => {
      const iteam = req.body;
      const result = await grocaCollection.insertOne(iteam);
      res.send(result);
    });

    // delete data
    app.delete("/iteam/:id", async (req, res) => {
      const id = req.params;
      const query = { _id: ObjectId(id) };
      const result = await grocaCollection.deleteOne(query);
      res.send(result);
    });

    // Json Web token

    app.post("/get-token", (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      console.log(accessToken);
      res.send({ accessToken });
    });

    // get data by user email
    app.get("/userIteams/:id", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      const verifyEmail = decoded.email;
      const userId = req.params;
      if (verifyEmail === userId.id) {
        const filter = grocaCollection.find({
          email: userId.id,
        });
        const result = await filter.toArray();
        res.send(result);
      } else {
        res.status(403).send({ message: "forbidden access" });
      }
    });
  } finally {
  }
};

run().catch(console.dir);

app.listen(port, () => {
  console.log("server number", port);
});
module.exports = app;
