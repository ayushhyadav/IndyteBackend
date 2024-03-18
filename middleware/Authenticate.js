import jwt from "jsonwebtoken";
import prisma from "../db/db.config.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader === null || authHeader === undefined) {
    return res.status(401).json({ status: 401, message: "UnAuthorized" });
  }
  console.log("The token is", authHeader);
  const token = authHeader.split(" ")[1]; // removing bearer from token

  //   * Verify the JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(401).json({ status: 401, message: "UnAuthorized" });
    req.user = user;
    req.body.user = user;
    next();
  });
};

export const onlyAdmin = async (req, res, next) => {
  if (!req.headers.authorization && !req.authorization?.startsWith("Bearer"))
    return res.status(401).json({ message: "No Token" });
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const response = await prisma.admin.findFirst({
      where: { id: decoded.id },
    });
    if (!response) return res.status(401).json({ message: "Admin only" });
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const onlyDietician = async (req, res, next) => {
  if (!req.headers.authorization && !req.authorization?.startsWith("Bearer"))
    return res.status(401).json({ message: "No Token" });
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const response = await prisma.dietician.findUnique({
      where: { id: decoded.id },
    });
    if (!response) return res.status(401).json({ message: "Dietician only" });
    console.log(response);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const onlyUser = async (req, res, next) => {
  if (!req.headers.authorization && !req.authorization?.startsWith("Bearer"))
    return res.status(401).json({ message: "No Token" });
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const response = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!response) return res.status(401).json({ message: "User only" });

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
export const allUser = async (req, res, next) => {
  if (!req.headers.authorization && !req.authorization?.startsWith("Bearer"))
    return res.status(401).json({ message: "No Token" });
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user == "admin" || "dietician" || "user") {
      req.user = decoded;
      next();
    } else
      return res
        .status(401)
        .json({ message: "Authenticated user or dietician or admin only" });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export default authMiddleware;
