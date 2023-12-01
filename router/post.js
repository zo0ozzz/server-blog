const express = require("express");
const router = express.Router();
const getDB = require("../db.js");
const getTimeCode = require("../timeCode.js");

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
    const searchQuery = req.query.searchQuery;

    const db = await getDB();
    const col = db.collection("post");

    // const query = [
    //   {
    //     $search: {
    //       index: "titleAndContentIndex",
    //       text: {
    //         query: searchQuery,
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
        { title: { $regex: searchQuery, $options: "i" } },
        { content: { $regex: searchQuery, $options: "i" } },
      ],
    };
    // - $or는 여러 필드 중 하나에서만 해당 조건을 만족해도 서치 결과값으로 넘겨줌.
    // - 복수의 검색될 필드는 객체들을 담은 배열로 작성.
    // - $regex는 찾는 조건을 정규식으로 지정한다는 것.
    // - 이렇게 하면 전체든 부분이든 주어진 단어가 들어가는 모든 걸 검색할 수는 있는데
    // - 대상을 하나하나 다 순회해야 해서 리소스가 많이 듦.

    const searchPosts = await col.find(query).toArray();

    res.status(200).send({ searchPosts: searchPosts });
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

router.get("/categories/:categoryName", async (req, res, next) => {
  try {
    const categoryName = req.params.categoryName;

    const db = await getDB();
    const colInfo = db.collection("info");
    const colPost = db.collection("post");

    const infoData = await colInfo.findOne({ _id: "info" });
    // 모든 게시물을 포함하는 카테고리의 이름
    const allCategoryName = infoData.categoryData.find(
      (item) => item.isAllCategory === true
    ).name;

    if (categoryName === allCategoryName) {
      // - 요청 카테고리 이름이 갓테고리의 이름과 같다면,
      // -> 모든 post를 전송.
      const allPosts = await colPost.find({}).toArray();

      res.status(200).send({ categoryPosts: allPosts });
    }

    if (categoryName !== allCategoryName) {
      // - 요청 카테고리 이름이 갓테고리의 이름과 같지 않다면,
      // -> 해당 카테고리의 post를 전송.
      const categoryPosts = await colPost
        .find({ category: categoryName })
        .toArray();

      res.status(200).send({ categoryPosts: categoryPosts });
    }
  } catch (error) {
    next(error);
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

    const prevCategoryData = info.categoryData;
    const newPostCategory = newPost.category;
    const newCategoryData = prevCategoryData.map((item, index) => {
      if (item.name === newPostCategory) {
        const prevElement = prevCategoryData[index];
        const newElement = {
          ...prevElement,
          postCount: prevElement.postCount + 1,
        };

        return newElement;
      }

      return item;
    });

    await colInfo.updateOne(
      { _id: "info" },
      {
        $inc: { lastPost_id: 1, lastPostNumber: 1 },
        $set: { categoryData: newCategoryData },
      }
    );

    res.status(200).send({
      _id: lastPost_id + 1,
      categoryData: newCategoryData,
    });
  } catch (error) {
    console.log(error);
  }
});

router.patch("/updateCategoryData", async (req, res, next) => {
  try {
    const categoryData = req.body;

    const db = await getDB();
    const colPost = db.collection("post");
    const colInfo = db.collection("info");

    // 신경 써야 할 건 두 가지 경우
    // 1. 비어 있지 않은 카테고리가 삭제된 경우
    // - 과제: 해당 카테고리에 속해 있던 post들의 카테고리를 미분류로 재지정해준다.
    // - 이전 데이터의 id로 새로운 데이터를 순회해 해당 id에 걸리는 요소가 없다면
    //   이전에 있던 카테고리 이름을 가지고 카테고리 교체가 필요한 post를 지정할 수 있을 것.
    // 2. 기존 카테고리의 이름이 수정된 경우
    // - 과제: 이전 카테고리 이름으로 분류된 post들의 카테고리를 수정된 카테고리 이름으로 재지정해준다.
    // - god 페이지에서는 카테고리 id는 건들 수 없음으로 id로 순회하며 이름의 일치 여부를 확인해보면 될 것.
    // - 1번 문제와 비슷하게 풀 수 있을 것 같다.
    // - 일단 이 두 경우에 따르는 변화를 먼저 처리해주고, 그 뒤는 밑의 로직을 비슷하게 써도 될 듯하다.
    // - 아 id로 전체를 알아보는 건 고쳐야 함. isAllCategory

    const targetData = await colInfo.findOne({ _id: "info" });
    const prevCategoryData = targetData.categoryData;

    // 2. 카테고리 이름 변경됨
    // - 그냥 반환 없이 처리해보자.
    // - 여기서 다 처리해버리려면 filter나 find나 별 상관은 없겠다.
    //  - 만족하면 멈추는 find를 사용하는 게 낫지 않을까.
    for (prevItem of prevCategoryData) {
      const element = categoryData.find(
        (item) => item.id === prevItem.id && item.name !== prevItem.name
      );

      if (element !== undefined) {
        const prevCategoryName = prevItem.name;
        const categoryName = element.name;

        await colPost.updateMany(
          { category: prevCategoryName },
          { $set: { category: categoryName } }
        );
      }

      const element2 = categoryData.find((item) => item.id === prevItem.id);

      if (element2 === undefined && prevItem.postCount > 0) {
        const prevCategoryName = prevItem.name;
        const noCategory = categoryData.find(
          (item) => item.isNoCategory === true
        ).name;

        await colPost.updateMany(
          { category: prevCategoryName },
          { $set: { category: noCategory } }
        );
      }
    }

    const newCategoryData = [];
    for (const {
      id,
      name,
      isRepresentative,
      isAllCategory,
      isNoCategory,
    } of categoryData) {
      if (isAllCategory === true) {
        const result = await colInfo.findOne({ _id: "info" });
        const totalPostCount = result.lastPostNumber;
        newCategoryData.push({
          id: id,
          name: name,
          isRepresentative: isRepresentative,
          isAllCategory: true,
          isNoCategory: false,
          postCount: totalPostCount,
        });
      } else {
        const result = await colPost.find({ category: name }).toArray();
        const categoryPostCount = result.length;
        newCategoryData.push({
          id: id,
          name: name,
          isRepresentative: isRepresentative,
          isAllCategory: false,
          isNoCategory: isNoCategory,
          postCount: categoryPostCount,
        });
      }
    }

    await colInfo.updateOne(
      { _id: "info" },
      { $set: { categoryData: newCategoryData } }
    );

    res.status(200).send(newCategoryData);

    // const newCategories = req.body;

    // const db = await getDB();
    // const colPost = db.collection("post");
    // const colInfo = db.collection("info");

    // const categoryPostsCountObj = {};
    // for (let eachCategory of newCategories) {
    //   const result = await colPost.find({ category: eachCategory }).toArray();
    //   const count = result.length;
    //   categoryPostsCountObj[eachCategory] = count;
    // }

    // await colInfo.updateOne(
    //   { _id: "info" },
    //   { $set: { categoryData: categoryPostsCountObj } }
    // );

    // const info = await colInfo.findOne({ _id: "info" });
    // const categoryDataValue = info.categoryData;

    // res.status(200).send(categoryDataValue);
  } catch (error) {
    console.log(error);
  }
});

router.patch("/:_id", async (req, res, next) => {
  try {
    const _id = parseInt(req.params._id);

    const db = await getDB();
    const colPost = db.collection("post");
    const colInfo = db.collection("info");

    const prevPost = await colPost.findOne({ _id: _id });
    const prevCategory = prevPost.category;

    const editedPost = req.body;
    const editedTitle = editedPost.title;
    const editedContent = editedPost.content;
    const editedCategory = editedPost.category;

    await colPost.updateOne(
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

    if (prevCategory !== editedCategory) {
      const info = await colInfo.findOne({ _id: "info" });
      const prevCategoryData = info.categoryData;
      const newCategoryData = prevCategoryData.map((item, index) => {
        const targetCategory = item.name;
        if (targetCategory === prevCategory) {
          const prevElement = prevCategoryData[index];
          const newElement = {
            ...prevElement,
            postCount: prevElement.postCount - 1,
          };

          return newElement;
        }

        if (targetCategory === editedCategory) {
          const prevElement = prevCategoryData[index];
          const newElement = {
            ...prevElement,
            postCount: prevElement.postCount + 1,
          };

          return newElement;
        }

        return item;
      });

      await colInfo.updateOne(
        { _id: "info" },
        { $set: { categoryData: newCategoryData } }
      );

      res.status(200).send({ categoryData: newCategoryData });

      return;
    }

    if (prevCategory === editedCategory) {
      const info = await colInfo.findOne({ _id: "info" });
      const categoryData = info.categoryData;

      res.status(200).send({ categoryData: categoryData });

      return;
    }

    // const arrayFilters = [
    //   { "element.name": prevCategory },
    //   { "element.name": editedCategory },
    // ];

    // await colInfo.updateOne(
    //   { _id: "info" },
    //   {
    //     $inc: {
    //       "categoryData.$[prevCategory].postCount": -1,
    //       "categoryData.$[editedCategory].postCount": 1,
    //     },
    //   },
    //   { arrayFilters: arrayFilters }
    // );

    // const newInfo = await colInfo.findOne({ _id: "info" });
    // const newCategoryData = newInfo.categoryData;

    // res.status(200).send(newCategoryData);
  } catch (error) {
    next(error);
  }
});

router.delete("/:_id", async (req, res, next) => {
  try {
    const _id = parseInt(req.params._id);

    const db = await getDB();
    const colPost = db.collection("post");
    const colInfo = db.collection("info");

    const post = await colPost.findOne({ _id: _id });
    const category = post.category;

    await colInfo.updateOne(
      { _id: "info", "categoryData.name": category },
      { $inc: { lastPostNumber: -1, "categoryData.$.postCount": -1 } }
    );

    await colPost.deleteOne({ _id: _id });

    const result = await colInfo.findOne({ _id: "info" });
    const newCategoryData = result.categoryData;

    res.status(200).send({ categoryData: newCategoryData });
  } catch (error) {
    console.log(error);
  }
});

router.get("/test/:_id", async (req, res, next) => {
  try {
    const _id = parseInt(req.params._id);

    const db = await getDB();
    const colPost = db.collection("post");

    const post = await colPost.findOne({ _id: _id });
    const categoryName = post.category;
    const categoryPosts = await colPost
      .find({ category: categoryName })
      .toArray();
    const index = categoryPosts.findIndex((item) => item._id === _id);
    const prevPost = categoryPosts[index - 1];
    const currentPost = categoryPosts[index];
    const nextPost = categoryPosts[index + 1];

    const posts = {
      prev: prevPost ? { _id: prevPost._id, title: prevPost.title } : null,
      current: currentPost,
      next: nextPost ? { _id: nextPost._id, title: nextPost.title } : null,
    };

    res.status(200).send({ posts: posts });
  } catch (error) {
    res.status(500).end();

    next(error);
  }
});

router.use((error, req, res, next) => {
  console.error(error);
});

module.exports = router;
// es6) export default router;
