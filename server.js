const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT;
// 미들웨어
const cors = require("cors");

// router
const postRouter = require("./posts.js");
const imageRouter = require("./image.js");

const getDB = require("./db.js");

app.use(cors());
app.use(express.json());

app.use("/post", postRouter);
app.use("/image", imageRouter);
app.get("/create", async (req, res, next) => {
  try {
    const db = await getDB();
    const col = db.collection("counter");

    const updataPost_id = await col.updateOne(
      { _id: "counter" },
      { $inc: { post_id: 1 } }
    );

    const findedData = await col.findOne({ _id: "counter" });
    const newPost_id = findedData.post_id;

    res.status(200).json({ _id: newPost_id });
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log("서버 열림(5000)");
});
app.delete("/deleteAllData", async (req, res, next) => {
  try {
    const db = await getDB();
    const col = db.collection("post");

    col.deleteMany({});

    res.status(200).send("삭제됨");
  } catch (error) {
    console.log(error);
  }
});
