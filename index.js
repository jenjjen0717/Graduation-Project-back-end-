const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const passport = require("passport");
const bodyParser = require("body-parser");
dotenv.config();

const authRoute = require("./routes").auth;
const bookRoute = require("./routes").book;
require("./config/passport")(passport);

mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => {
    console.log("Connect to Mongo Atlas");
  })
  .catch((e) => {
    console.log(e);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/api/user", authRoute);
app.use(
  "/api/book",
  passport.authenticate("jwt", { session: false }),
  bookRoute
);

app.listen(8080, () => {
  console.log("Server is running on port 8080.");
});
