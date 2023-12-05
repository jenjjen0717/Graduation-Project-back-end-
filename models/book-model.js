const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    cover: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["To Read", "Reading", "Finished"],
      default: "finished",
      required: true,
    },
    excerpt: {
      type: [
        {
          paragraph: String,
          page: Number,
          note: String,
        },
      ],
      default: [],
    },
    review: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;
