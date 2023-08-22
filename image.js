const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { baseURL } = require("./url.js");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/image");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);

    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", express.static("public/image"));

router.use(function timeLog(req, res, next) {
  console.log("iamgeTime: ", Date.now());
  next();
});

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    console.log("몬가.. 몬가 들어옴!");

    const file = req.file;
    console.log(file);

    const url = `${baseURL}/image/${file.originalname}`;

    const obj = { url: url };

    res.status(200).send(obj);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
