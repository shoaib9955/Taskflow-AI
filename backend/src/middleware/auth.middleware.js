import jwt from "jsonwebtoken";
import User from "../models/User.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    let decoded;

    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new ApiError(401, "Token has expired");
      }

      if (error.name === "JsonWebTokenError") {
        throw new ApiError(401, "Invalid token");
      }

      throw error;
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    if (!user.isActive) {
      throw new ApiError(403, "User account is inactive");
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default protect;
