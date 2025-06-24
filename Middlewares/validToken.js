const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validate = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401);
      throw new Error("Missing token");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("Invalid or expired token");
      }

      req.user = decoded.user;
      next();
    });
  } else {
    res.status(401);
    throw new Error("Not authorized, token missing or malformed");
  }
});

module.exports = validate;
