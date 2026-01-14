const jwt = require("jsonwebtoken");

function getToken(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return null;
  return h.slice("Bearer ".length);
}

exports.optionalAuth = (req, res, next) => {
  const token = getToken(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return next(); // ignore invalid token in optional mode
  }
};

exports.requireAuth = (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
