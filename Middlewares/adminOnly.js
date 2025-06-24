const express = require("express")
const router = express.Router();
require('dotenv').config()

const adminOnly = (req, res, next) => {
  
  console.log("JWT user email:", req.user.email);
  
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = adminOnly;