const router = require("express").Router();
const Joi = require("joi");
const { validate } = require("../middleware/validate");
const ctrl = require("../controllers/auth.controller");

const registerSchema = Joi.object({
  name: Joi.string().allow("").max(80).optional(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(72).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(72).required()
});

router.post("/register", validate(registerSchema), ctrl.register);
router.post("/login", validate(loginSchema), ctrl.login);

module.exports = router;
