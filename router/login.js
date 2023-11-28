const express = require("express");
const router = express.Router();
const getDB = require("../db.js");
const getTimeCode = require("../timeCode.js");

router.use((req, res, next) => {
  console.log("/login/...", getTimeCode());

  next();
});

router.post("/test", async (req, res, next) => {
  try {
    const db = await getDB();
    const colUser = db.collection("user");

    const data = req.body;
    const id = data.id;
    const password = data.password;

    const result = await colUser.findOne({ id: id });

    if (result === null) {
      return res.status(401).send({ result: "아이디가 없어~~" });
    }

    if (result !== null && result.password !== password) {
      return res.status(401).send({ result: "비밀번호가 틀려~~" });
    }

    if (result !== null && result.password === password) {
      return res.status(200).send({ result: "토큰" });
    }
  } catch (error) {
    next(error);
  }
});

router.use((error, req, res, next) => {
  console.error(error.stack);

  return res.status(500).send({ result: "서버 오류~ 서버 코드 고쳐~" });
});

module.exports = router;
