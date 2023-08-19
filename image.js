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

    cb(null, file.originalname + ext);
  },
});

const upload = multer({ storage: storage });

router.use(function timeLog(req, res, next) {
  console.log("iamgeTime: ", Date.now());
  next();
});

router.get("/", express.static("public/image"));

router.post("/", upload.single("image"), (req, res, next) => {
  console.log("몬가.. 몬가 들어옴!");

  const file = req.file;

  const url = `${baseURL}/image/${file.originalname}`;

  const obj = { url: url };

  res.send(obj);
});

module.exports = router;
