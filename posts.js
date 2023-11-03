const express = require("express");
const router = express.Router();
const getDB = require("./db.js");
const getTimeCode = require("./timeCode.js");

router.use(function timeLog(req, res, next) {
  console.log("* /post/... ", getTimeCode());
  next();
});

router.use(async (req, res, next) => {
  // const db = await getDB();
  // req.db = db;

  next();
});

router.get("/", async (req, res, next) => {
  const db = await getDB();
  const col = db.collection("post");

  const queryString = req.query.category;

  if (!queryString) {
    try {
      const posts = await col.find().toArray();

      res.send(posts);
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("쿼리스트링 있음", queryString);
    try {
      const posts = await col.find({ category: queryString }).toArray();
      console.log(posts);

      res.send(posts);
    } catch (error) {
      console.log(error);
    }
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

// router.get("/category", async (req, res, next) => {
//   const searchString = req.query.category;
//   console.log(searchString);
// });

router.post("/", async (req, res, next) => {
  try {
    const newPost = req.body;

    const db = await getDB();
    const colInfo = db.collection("info");
    const colPost = db.collection("post");

    const info = await colInfo.findOne({ _id: "info" });
    const lastPost_id = info.lastPost_id;
    const lastPostNumber = info.lastPostNumber;

    await colPost.insertOne({
      _id: lastPost_id + 1,
      number: lastPostNumber + 1,
      createDate: getTimeCode(),
      lastEditDate: getTimeCode(),
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
    });

    await colInfo.updateOne(
      { _id: "info" },
      { $inc: { lastPost_id: 1, lastPostNumber: 1 } }
    );

    res.status(200).json({ _id: lastPost_id + 1 });
  } catch (error) {
    console.log(error);
  }
});

router.patch("/:_id", async (req, res, next) => {
  try {
    const _id = parseInt(req.params._id);

    const db = await getDB();
    const colPost = db.collection("post");

    const editedPost = req.body;
    const editedTitle = editedPost.title;
    const editedContent = editedPost.content;
    const editedCategory = editedPost.category;

    const result = await colPost.updateOne(
      { _id: _id },
      {
        $set: {
          title: editedTitle,
          content: editedContent,
          category: editedCategory,
          lastEditDate: getTimeCode(),
        },
      }
    );

    res.status(200).send();
  } catch (error) {
    console.log(error);
  }
});

router.delete("/:_id", async (req, res, next) => {
  try {
    const _id = parseInt(req.params._id);

    const db = await getDB();
    const colPost = db.collection("post");

    const result = await colPost.deleteOne({ _id: _id });

    console.log("result: ", result);

    const colInfo = db.collection("info");

    const result2 = await colInfo.updateOne(
      { _id: "info" },
      { $inc: { lastPostNumber: -1 } }
    );

    console.log("result2: ", result2);

    res.status(200).send();
  } catch (error) {
    console.log(error);
  }
});

router.use((err, req, res, next) => {
  console.log("여기서 처리: ", err);
});

module.exports = router;
// es6) export default router;
