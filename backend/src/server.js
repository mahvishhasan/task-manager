require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
(async () => {
  await connectDB(process.env.MONGO_URI);
  const PORT = process.env.PORT || 5051;

  app.listen(PORT, () => {
    console.log(`API running on http://127.0.0.1:${PORT}`);
  });
  })();
