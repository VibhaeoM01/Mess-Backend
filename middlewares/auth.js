// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
export const verifyToken = async (req, res, next) => {
  try {
    // - Extracts JWT token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) return res.status(401).json({ message: "No token provided" });  

    // - Uses jwt.verify() to both verify the token's validity and decode its payload
    //   (jwt.verify() returns the decoded payload if valid, or throws an error if invalid/expired)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);   

    // - Uses the decoded id to fetch the user from the database
    const decodedUser = await User.findById(decoded.id);
      
    if (!decodedUser) return res.status(401).json({ message: "User not found" });

    // - Attaches the user object to req.user for use in downstream controllers/routes
    req.user = decodedUser;
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
  next();
};

export const isStudent = (req, res, next) => {
  if (req.user.role != "student" && req.user.role != "super_admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
