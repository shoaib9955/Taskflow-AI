import app from "../src/app.js";
import connectDB from "../src/config/db.js";

let dbConnectionPromise;

const handler = async (req, res) => {
  try {
    if (!dbConnectionPromise) {
      dbConnectionPromise = connectDB();
    }

    await dbConnectionPromise;

    // Vercel's /api function receives the remaining path.
    // Add /api back so Express routes continue to work.
    if (!req.url.startsWith("/api")) {
      req.url = `/api${req.url}`;
    }

    return app(req, res);
  } catch (error) {
    console.error("Vercel API error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default handler;
