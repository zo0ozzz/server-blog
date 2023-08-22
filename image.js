const express = require("express");
const router = express.Router();
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { baseURL } = require("./url.js");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/image");
  },
  // filename: function (req, file, cb) {
  //   console.log("multer");
  //   cb(null, file.originalname);
  // },
});

const upload = multer({ storage: storage });

router.use("/", express.static("public/image"));

router.use(function timeLog(req, res, next) {
  console.log("iamgeTime: ", Date.now());
  next();
});

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    console.log("몬가.. 몬가 들어옴!");

    const file = req.file;
    const filePath = file.path;

    const hash = crypto.createHash("sha256");
    const fileStream = fs.createReadStream(filePath);
    fileStream.on("data", (data) => {
      hash.update(data);
    });

    fileStream.on("end", () => {
      const fileHash = hash.digest("hex");

      const finalPath = path.join("public/image", fileHash);
      if (!fs.existsSync(finalPath)) {
        fs.renameSync(filePath, finalPath);
      }

      console.log(fileHash);

      const url = `${baseURL}/image/${fileHash}`;

      const obj = { url: url };

      res.status(200).send(obj);
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
