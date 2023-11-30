const express = require("express");
const router = express.Router();
const getDB = require("../db.js");
const getTimeCode = require("../timeCode.js");

router.use((req, res, next) => {
  console.log("* /god/...", getTimeCode());

  next();
});

router.get("/blogName", async (req, res, next) => {
  try {
    const db = await getDB();
    const colGod = db.collection("god");

    const targetData = await colGod.findOne({ _id: "god" });
    const blogName = targetData.blogName;

    res.status(200).send({ blogName: blogName });
  } catch (error) {
    res.status(500).end();

    console.log(error);
  }
});

router.patch("/blogName", async (req, res, next) => {
  try {
    const newBlogName = req.body.blogName;

    const db = await getDB();
    const colGod = db.collection("god");

    await colGod.updateOne({ _id: "god" }, { $set: { blogName: newBlogName } });

    const targetData = await colGod.findOne({ _id: "god" });
    const blogName = targetData.blogName;

    res.status(200).send({ blogName: blogName });
  } catch (error) {
    res.status(500).end();

    console.log(error);
  }
});

router.get("/categoryData", async (req, res, next) => {
  try {
    const db = await getDB();
    const colInfo = db.collection("info");

    const targetData = await colInfo.findOne({ _id: "info" });
    const categoryData = targetData.categoryData;

    res.status(200).send({ categoryData: categoryData });
  } catch (error) {
    res.status(500).end();

    console.log(error);
  }
});

router.get("/hellowMessage", async (req, res, next) => {
  try {
    const db = await getDB();
    const colInfo = db.collection("info");

    const infoData = await colInfo.findOne({ _id: "info" });
    const hellowMessage = infoData.hellowMessage;

    res.status(200).send({ hellowMessage: hellowMessage });
  } catch (error) {
    res.status(500).end();

    next(error);
  }
});

router.patch("/hellowMessage", async (req, res, next) => {
  try {
    const body = req.body;
    const newHellowMessage = body.hellowMessage;

    const db = await getDB();
    const colInfo = db.collection("info");

    await colInfo.updateOne(
      { _id: "info" },
      { $set: { hellowMessage: newHellowMessage } }
    );

    res.status(200).end();
  } catch (error) {
    res.status(500).end();

    next(error);
  }
});

router.use((error, req, res, next) => {
  console.error(error);
});

module.exports = router;
