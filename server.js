const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;
const DB_ID = process.env.DB_ID;
const DB_PASSWORD = process.env.DB_PASSWORD;
// 서버에 쓰기 권한을 승인.
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${DB_ID}:${DB_PASSWORD}@cluster0.cndvfyw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
const dbName = "blog";

async function runDB() {
  try {
    await client.connect();

    db = client.db(dbName);

    console.log("DB 연결 완료");
  } catch (error) {
    console.log("DB 연결 실패");
  }
}

runDB();

// client
//   .connect()
//   .then(() => {
//     console.log("mongoDB 연결 완료");

//     db = client.db(dbName);
//   })
//   .catch((error) => console.log(error));

// const db = client.db("blog");

// async function runDB() {
//   try {
//     await client.connect();

//     const dbName = "blog";
//     const db = client.db(dbName);

//   }catch {}
// }

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }

// const dbName = "blog";
// const db = client.db(dbName);

// async function run() {
//   try {
//     await client.connect();
//     console.log("connected correctly to server");
//     // const db = client.db(dbName);

//     // const col = db.collection("people");

//     // let personDocument = {
//     //   name: { first: "Alan", last: "Turing" },
//     //   birth: new Date(1912, 5, 23),
//     //   death: new Date(1954, 5, 7),
//     //   contribs: ["Turing machine", "Turing test", "Turingery"],
//     //   views: 1250000,
//     // };

//     // const p = await col.insertOne(personDocument);
//     // const myDoc = await col.findOne();
//     // console.log(myDoc);
//   } catch (error) {
//     console.log(err.stack);
//   } finally {
//     await client.close();
//   }
// }

// run().catch(console.dir);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/image", express.static("public/image"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/image");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);

    cb(null, file.originalname + ext);
  },
});

const upload = multer({ storage: storage });

app.post("/image", upload.single("image"), (req, res, next) => {
  console.log("몬가.. 몬가 들어옴!");

  const file = req.file;

  const url = `http://localhost:5000/image/${file.originalname}`;

  const obj = { url: url };

  res.send(obj);
});

app.post("/post/:id", async function (req, res, next) {
  try {
    const col = db.collection("post");

    const data = req.body;

    const p = await col.insertOne(data);
    const myDoc = await col.find();
    console.log(myDoc);
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log("서버 열림(5000)");
});
