const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./middleware/error");

const taskRoutes = require("./routes/task.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);  // Week 3 optional
app.use("/api/tasks", taskRoutes);

app.use(errorHandler);

module.exports = app;
