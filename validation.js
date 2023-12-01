const Joi = require("joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(15).required(),
    email: Joi.string().min(6).max(50).required().email(),
    password: Joi.string().min(8).max(255).required(),
  });

  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(50).required().email(),
    password: Joi.string().min(6).max(255).required(),
  });
  return schema.validate(data);
};

const bookValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(50).required(),
    author: Joi.string().min(1).max(50).required(),
    status: Joi.string().required().valid("To Read", "Reading", "Finished"),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.bookValidation = bookValidation;
