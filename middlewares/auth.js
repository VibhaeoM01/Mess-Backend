// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) return res.status(401).json({ message: "No token provided" }); 
    console.log("Authorization Header:", req.headers.authorization);
    console.log("JWT_SECRET during verification:", process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  //foprkgv 
    console.log("Decoded Token:", decoded);
    const user = await User.findById(decoded.id);
      
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
 console.error("Error during token verification:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
 
export const isSuperAdmin = async (req, res, next) => {
  if (req.user.role != "super_admin") {
    return res.status(403).json({ message: "Access Denied" });
  }
  next();
};

export const isMessManager = (req, res, next) => {
  if (req.user.role != "mess_manager" && req.user.role != "super_admin") {
    return res.status(403).json({ message: "Student Access is restricted" });
  }
};

export const isStudent = (req, res, next) => {
  if (req.user.role != "student" && req.user.role != "super_admin") {
    return res.status(403).json({ message: "Access denied" });
  }
};
