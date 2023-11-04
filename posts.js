const express = require("express");
const router = express.Router();
const getDB = require("./db.js");
const getTimeCode = require("./timeCode.js");

router.use(function timeLog(req, res, next) {
  console.log("* /post/... ", getTimeCode());
  next();
});

router.get("/", async (req, res, next) => {
  try {
    const db = await getDB();
    const col = db.collection("post");

    const posts = await col.find().toArray();

    res.send(posts);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const searchString = req.query.searchString;

    const db = await getDB();
    const col = db.collection("post");

    // const query = [
    //   {
    //     $search: {
    //       index: "titleAndContentIndex",
    //       text: {
    //         query: searchString,
    //         path: ["title", "content"],
    //       },
    //     },
    //   },
    // ];
    // - search index가 적용된 검색의 쿼리는 배열로 넘겨줘야 함.
    // - $search 필드 외에 다른 필드로 세부 설정을 하기 때문(인 듯함).

    // const posts = await col.aggregate(query).toArray();
    // console.log(posts);

    const query = {
      $or: [
        { title: { $regex: searchString, $options: "i" } },
        { content: { $regex: searchString, $options: "i" } },
      ],
    };
    // - $or는 여러 필드 중 하나에서만 해당 조건을 만족해도 서치 결과값으로 넘겨줌.
    // - 복수의 검색될 필드는 객체들을 담은 배열로 작성.
    // - $regex는 찾는 조건을 정규식으로 지정한다는 것.
    // - 이렇게 하면 전체든 부분이든 주어진 단어가 들어가는 모든 걸 검색할 수는 있는데
    // - 대상을 하나하나 다 순회해야 해서 리소스가 많이 듦.

    const posts = await col.find(query).toArray();

    res.status(200).send(posts);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:_id", async (req, res, next) => {
  try {
    const _id = parseInt(req.params._id);

    const db = await getDB();
    const col = db.collection("post");

    const post = await col.findOne({ _id: _id });

    res.status(200).send(post);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/categories/:category", async (req, res, next) => {
  try {
    const category = req.params.category;

    if (category === "전체") {
      const db = await getDB();
      const col = db.collection("post");

      const posts = await col.find().toArray();

      res.send(posts);

      return;
    }

    if (category === "미분류") {
      const db = await getDB();
      const col = db.collection("post");

      const posts = await col.find({ category: "" }).toArray();

      res.send(posts);

      return;
    }

    if (category !== "전체" && category !== "미분류") {
      const db = await getDB();
      const col = db.collection("post");

      const posts = await col.find({ category: category }).toArray();

      res.send(posts);

      return;
    }
  } catch (error) {
    console.log(error);
  }
});

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
  console.log("끝단에서 에러 처리: ", err);
});

module.exports = router;
// es6) export default router;
