import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import env from "../config/env.js";

const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors = null;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors || null;
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";

    errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  } else if (error?.code === 11000) {
    statusCode = 409;

    const fields = Object.keys(error.keyValue);

    message = `${fields.join(", ")} already exists`;
  } else if (error instanceof SyntaxError && error.status === 400) {
    statusCode = 400;
    message = "Invalid JSON payload";
  } else if (error?.name === "MulterError") {
    statusCode = 400;

    if (error.code === "LIMIT_FILE_SIZE") {
      message = "File size exceeds the 10MB limit";
    } else if (error.code === "LIMIT_FILE_COUNT") {
      message = "Too many files uploaded";
    } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field";
    } else {
      message = error.message;
    }
  } else {
    console.error(error);
  }

  const response = {
    statusCode,
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (env.nodeEnv === "development" && error.stack) {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

export default errorHandler;
