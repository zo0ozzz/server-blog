const express = require("express");
const router = express.Router();
const getDB = require("./db.js");

router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

router.use(async (req, res, next) => {
  // const db = await getDB();
  // req.db = db;

  next();
});

router.get("/", async (req, res, next) => {
  const db = await getDB();

  console.log("get, /post");

  try {
    const col = db.collection("post");

    const posts = await col.find().toArray();

    res.send(posts);
  } catch (error) {
    console.log(error);
  }
});

router.get("/:_id", async (req, res, next) => {
  const db = await getDB();

  console.log("get, /post/_id");

  try {
    const _id = parseInt(req.params._id);
    console.log(_id);

    const col = db.collection("post");

    const post = await col.findOne({ _id: _id });

    res.status(200).send(post);
  } catch (error) {
    console.log(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const newPost = req.body;

    const db = await getDB();
    const colCounter = db.collection("counter");
    const colPost = db.collection("post");

    const findedData = await colCounter.findOne({ _id: "counter" });
    const totalPostsCount = findedData.postNumber;

    console.log(newPost._id);

    await colPost.insertOne({
      _id: parseInt(newPost._id),
      number: totalPostsCount + 1,
      date: Date.now(),
      title: newPost.title,
      content: newPost.content,
    });

    const findedData2 = await colCounter.updateOne(
      { _id: "counter" },
      { $inc: { postNumber: 1 } }
    );

    res.status(200).send({ message: "잘 왔음" });
  } catch (error) {
    console.log(error);
  }
});

router.patch("/", async (req, res, next) => {
  try {
    const db = await getDB();

    const post = req.body;
    const { _id, title, content } = post;

    const result = await db
      .collection("post")
      .updateOne({ _id: _id }, { $set: { title: title, content: content } });

    console.log(result);

    res.status(200).send("ddd");
  } catch (error) {
    console.log(error);
  }
});

router.use((err, req, res, next) => {
  console.log("여기서 처리: ", err);
});

module.exports = router;
// es6) export default router;
