const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT;
// 미들웨어
const cors = require("cors");

// router
const godRouter = require("./router/god.js");
const postRouter = require("./router/post.js");
const imageRouter = require("./router/image.js");
const loginRouter = require("./router/login.js");

const getDB = require("./db.js");

app.use(cors());
app.use(express.json());

app.use("/god", godRouter);
app.use("/post", postRouter);
app.use("/image", imageRouter);
app.use("/login", loginRouter);

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
