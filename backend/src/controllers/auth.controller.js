const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET,
    { subject: String(user._id), expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

exports.register = async (req, res, next) => {
  try {
    const { name = "", email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    next(e);
  }
};
