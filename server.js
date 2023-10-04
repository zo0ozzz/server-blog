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

app.get("/search", async (req, res, next) => {
  try {
    const db = await getDB();
    const col = db.collection("post");
    // const indexing = await col.createIndex({ title: "text" });

    const searchString = req.query.searchString;
    console.log(searchString);

    const query = [
      {
        $search: {
          index: "titleSearch",
          text: {
            query: searchString,
            path: "title",
          },
        },
      },
    ];

    console.log("여기까지는 실행1");
    const posts = await col.aggregate(query).toArray();
    console.log("여기까지는 실행2");
    console.log(posts);

    res.send(posts);
  } catch (error) {
    console.log(error);
    next(error);
  }
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
