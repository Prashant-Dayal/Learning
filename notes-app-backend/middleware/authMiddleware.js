import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
    const payload = jwt.verify(header.slice(7).trim(), process.env.JWT_SECRET);
    if (!payload.sub) return res.status(401).json({ message: "Invalid authentication token." });
    req.user = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }
}