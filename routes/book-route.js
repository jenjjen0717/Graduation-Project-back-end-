const router = require("express").Router();
const multer = require("multer");
var path = require("path");

const Book = require("../models").bookModel;
const bookValidation = require("../validation").bookValidation;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

let upload = multer({ storage: storage });

router.use((req, res, next) => {
  console.log("request is coming to book api");
  next();
});

router.get("/", (req, res) => {
  Book.find({ user: req.user._id })
    .then((books) => {
      res.send(books);
    })
    .catch(() => {
      res.status(500).send("Cannot get book!");
    });
});

router.get("/recent", (req, res) => {
  Book.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .limit(5)
    .then((books) => {
      res.send(books);
    })
    .catch(() => {
      res.status(500).send("Cannot get book!");
    });
});

router.get("/search/:keyword", (req, res) => {
  let { keyword } = req.params;
  Book.find({ title: { $regex: keyword, $options: "i" }, user: req.user._id })
    .then((books) => {
      res.send(books);
    })
    .catch(() => {
      res.status(500).send("Cannot get book!");
    });
});

router.get("/info/:title", (req, res) => {
  let { title } = req.params;
  Book.findOne({ title: title, user: req.user._id })
    .populate("user", ["username", "email"])
    .then((book) => {
      res.send(book);
    })
    .catch(() => {
      res.status(500).send("cannot get course");
    });
});

router.post("/info", upload.single("cover"), async (req, res) => {
  const { error } = bookValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const bookExisted = await Book.findOne({
    title: req.body.title,
    author: req.body.author,
    user: req.user._id,
  });
  if (bookExisted) return res.status(400).send("Book Existed");

  let cover = req.file?.filename;
  let title = req.body.title;
  let author = req.body.author;
  let status = req.body.status;

  let newBook = new Book({
    cover,
    title,
    author,
    status,
    user: req.user._id,
  });

  try {
    await newBook.save();
    res.status(200).send({
      cover: req.file,
      title: req.body.title,
      author: req.body.author,
      status: req.body.status,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send("cannot save Book");
  }
});

router.post("/excerpt/:title", async (req, res) => {
  let { title } = req.params;

  try {
    let book = await Book.findOne({ title: title, user: req.user._id });

    if (!book) {
      res.status(404);
      return res.json({ success: false, message: "Book not found" });
    }

    book.excerpt.push(req.body);
    await book.save();
    res.send("Finished adding excerpt");
  } catch (err) {
    res.send(err);
  }
});

router.post("/review/:title", async (req, res) => {
  let { title } = req.params;

  try {
    let book = await Book.findOne({ title: title, user: req.user._id });

    if (!book) {
      res.status(404);
      return res.json({ success: false, message: "Book not found" });
    }

    Book.findOneAndUpdate({ title: title }, req.body, {
      new: true,
      runValidators: true,
    })
      .then(() => {
        res.send("success");
      })
      .catch((e) => {
        res.send({
          success: false,
          message: e,
        });
      });
  } catch (err) {
    res.send(err);
  }
});

router.patch("/info/:title", async (req, res) => {
  const { error } = bookValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { title } = req.params;

  let book = await Book.findOne({
    title: title,
    user: req.user._id,
  });
  if (!book) {
    res.status(404);
    return res.json({ success: false, message: "Book not found" });
  }

  // const bookExisted = await Book.findOne({
  //   title: req.body.title,
  //   author: req.body.author,
  //   user: req.user._id,
  // });
  // if (bookExisted) return res.status(400).send("Book Existed");

  Book.findOneAndUpdate({ title: title }, req.body, {
    new: true,
    runValidators: true,
  })
    .then(() => {
      res.send({
        title: req.body.title,
        author: req.body.author,
        status: req.body.status,
      });
    })
    .catch((e) => {
      res.send({
        success: false,
        message: e,
      });
    });
});

router.patch("/excerpt/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let book = await Book.findOneAndUpdate(
      { "excerpt._id": _id },
      {
        $set: {
          "excerpt.$[el].paragraph": req.body.paragraph,
          "excerpt.$[el].page": req.body.page,
          "excerpt.$[el].note": req.body.note,
        },
      },
      {
        arrayFilters: [{ "el._id": _id }],
        new: true,
      }
    );
    res.send(book);
  } catch (e) {
    res.send(e);
  }
});

router.delete("/excerpt/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    await Book.findOneAndUpdate(
      { "excerpt._id": _id },
      { $pull: { excerpt: { _id: _id } } },
      { safe: true, multi: false }
    );

    res.send("delete successfully");
  } catch (err) {
    res.send(err);
  }
});

router.delete("/info/:_id", async (req, res) => {
  let { _id } = req.params;

  const bookExisted = await Book.findOne({
    title: req.body.title,
    author: req.body.author,
    user: req.user._id,
  });
  if (bookExisted) return res.status(400).send("Book Existed");

  Book.deleteOne({ _id })
    .then(() => {
      res.send("book deleted.");
    })
    .catch((e) => {
      res.send({
        success: false,
        message: e,
      });
    });
});

module.exports = router;
