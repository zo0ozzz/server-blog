const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv").config();
const ID = process.env.DB_ID;
const PASSWORD = process.env.DB_PASSWORD;

const uri = `mongodb+srv://${ID}:${PASSWORD}@cluster0.cndvfyw.mongodb.net/?retryWrites=true&w=majority`;

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

async function getDB() {
  try {
    if (!db) {
      await runDB();
    }

    return db;
  } catch (error) {
    console.log(error);
  }
}

module.exports = getDB;
