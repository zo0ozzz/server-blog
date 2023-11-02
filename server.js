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

    const updatePost_id = await col.updateOne(
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

app.get("/search", async (req, res, next) => {
  try {
    const db = await getDB();
    const col = db.collection("post");

    const searchString = req.query.searchString;

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
    console.log(posts);

    res.status(200).send(posts);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.delete("/deleteAllData", async (req, res, next) => {
  try {
    const db = await getDB();

    const colPost = db.collection("post");
    const colInfo = db.collection("info");

    colPost.deleteMany({});
    colInfo.updateOne(
      { _id: "info" },
      {
        $set: {
          lastPost_id: 0,
          lastPostNumber: 0,
        },
      }
    );

    res.status(200).send("삭제됨");
  } catch (error) {
    console.log(error);
  }
});

app.use((error, req, res, next) =>
  res.status(500).send("서버 오류 발생: " + error.message)
);

app.listen(PORT, () => {
  console.log("서버 열림(5000)");
});

// const path = require("path");
// const fs = require("fs");

// const filePath = "./test/test.txt";
// const fileName = path.basename(filePath);
// const dirName = path.dirname(filePath);
// const extName = path.extname(filePath);

// const text = "하이!";
// fs.writeFile(filePath, text, (err) => {
//   if (err) {
//   } else {
//   }
// });
