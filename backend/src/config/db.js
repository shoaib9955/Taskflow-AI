import mongoose from "mongoose";
import env from "./env.js";

let cachedConnection = null;
let connectionPromise = null;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // Connection is already being established
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    })
    .then((connection) => {
      cachedConnection = connection;

      console.log("MongoDB connected successfully");

      return connection;
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);

      // Allow the next request to try again
      connectionPromise = null;

      throw error;
    });

  return connectionPromise;
};

export default connectDB;
