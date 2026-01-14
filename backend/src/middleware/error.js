module.exports.errorHandler = (err, req, res, next) => {
    console.error("❌ Error:", err);
  
    // Mongoose invalid ObjectId, etc.
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
  
    const status = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  };
  