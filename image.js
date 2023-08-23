const express = require("express");
const router = express.Router();
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { baseURL } = require("./url.js");
const getTimeCode = require("./timeCode.js");
const { Readable } = require("stream");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/image");
//   },
//   filename: async function (req, file, cb) {
//     console.log("file ", file);
//     try {
//       const fileHash = await getFileHash(file);
//       const fileExtName = path.extname(file.originalname);

//       cb(null, fileHash + fileExtName);
//     } catch (error) {
//       console.log(error);
//     }
//   },
// });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use("/", express.static("public/image"));

router.use(function timeLog(req, res, next) {
  console.log("* /image/... ", getTimeCode());

  next();
});

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    function getFileHash(file) {
      return new Promise((resolve, reject) => {
        const readStream = new Readable();
        // const readStream = fs.createReadStream(file.path);
        // 전송받은 파일에 대한 읽기 스트림 생성
        readStream.push(file.buffer);
        // 파일의 buffer를 스트림에 추가.
        readStream.push(null);
        // buffer 데이터가 모두 추가되면 null을 푸쉬.
        // 동기적 작업이기 때문에 다음 줄에 null을 추가해 앞선 작업의 끝을 알릴 수 있음.

        const hash = crypto.createHash("sha256");
        // crypto 모듈을 이용해 sha256 방식의 해시 객체를 생성.
        readStream.on("data", (chunk) => {
          hash.update(chunk);
        });
        // 앞서 선언한 읽기 스트림의 읽기 과정('data' 이벤트)가 발생하는 동안(읽는 동안)
        // 전달된 chuck를 이용해 hash 객체를 업데이트함.
        // - chunk는 읽기 대상이 되는 데이터를 비트 단위로 쪼갠 것.
        // - 쪼개진 데이터가 순서대로 전달되어 비동기적 과정을 거침.
        // - 즉, 모두 다운받지 않아도 랜더링이 가능해지는 것.
        // - 유튜브 막대가 점점 채워지는 걸 생각하면 비슷함.

        readStream.on("end", () => {
          const fileHash = hash.digest("hex");
          // 업로드된 파일을 해쉬화한 결과물.
          // 앞선 hash.update(chunk)로 해싱 완료된 결과물이 hash.digest에 할당됨.
          // ('hex')는 결과물을 어떤 형식으로 반환할지 결정.
          // - 몇 자리의 문자열로 반환할지 등등.

          resolve(fileHash);
        });

        readStream.on("error", (error) => {
          reject(error);
        });
      });
    }

    console.log("몬가.. 몬가 들어옴!");

    const file = req.file;
    const fileExt = path.extname(file.originalname);

    const fileHash = await getFileHash(file);

    const fileName = fileHash + fileExt;
    const fileSavePath = path.join("public/image", fileName);

    const isSameFileExist = fs.existsSync(fileSavePath);

    if (!isSameFileExist) {
      fs.writeFileSync(fileSavePath, file.buffer);

      const url = `${baseURL}/image/${fileName}`;

      const obj = { url: url };

      res.status(200).json(obj);
    } else {
      const url = `${baseURL}/image/${fileName}`;

      const obj = { url: url };

      res.status(200).json(obj);
    }

    // console.log(fileName);

    // const url = `${baseURL}/image/${fileName}`;

    // const obj = { url: url };

    // res.status(200).send(obj);

    // const hash = crypto.createHash("sha256");
    // const fileStream = fs.createReadStream(filePath);
    // fileStream.on("data", (data) => {
    //   hash.update(data);
    // });

    // fileStream.on("end", () => {
    //   const ext = path.extname(file.originalname);

    //   const fileHash = hash.digest("hex") + ext;

    //   const finalPath = path.join("public/image", fileHash);
    //   if (!fs.existsSync(finalPath)) {
    //     fs.renameSync(filePath, finalPath);

    //     console.log(fileHash);

    //     const url = `${baseURL}/image/${fileHash}`;

    //     const obj = { url: url };

    //     res.status(200).send(obj);
    //   } else {
    //     fs.unlinkSync(filePath);

    //     const url = `${baseURL}/image/${fileHash}`;

    //     const obj = { url: url };

    //     res.status(200).send(obj);
    //   }
    // });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
