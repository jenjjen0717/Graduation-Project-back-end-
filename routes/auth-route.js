const router = require("express").Router();
const jwt = require("jsonwebtoken");

const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").userModel;

router.use((req, res, next) => {
  console.log("Request Coming");
  next();
});

router.get("/testAPI", (req, res) => {
  return res.send("test api");
});

router.post("/register", async (req, res) => {
  //register validation
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //check if user exist
  const emailRegistered = await User.findOne({ email: req.body.email });
  if (emailRegistered) return res.status(400).send("Email has been register.");

  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const savedUser = await newUser.save();
    res.status(200).send({
      msg: "successfully saved user",
      savedObject: savedUser,
    });
  } catch (err) {
    res.status(400).send("User not saved.");
    console.log(err);
  }
});

router.post("/login", (req, res) => {
  //check validation of data
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(400).send("user not found");
      } else {
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (err) {
            console.log(err);
            return res
              .status(401)
              .send("User not found, please register first");
          }
          if (isMatch) {
            const tokenObject = {
              _id: user._id,
              email: user.email,
            };
            const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
            return res.send({ success: true, token: "JWT " + token, user });
          } else {
            return res.status(401).send("wrong password");
          }
        });
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
