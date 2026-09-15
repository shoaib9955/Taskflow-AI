import env from "./env.js";

const allowedOrigins = [env.clientUrl, "https://taskflow-shoaib.vercel.app"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow TaskFlow frontend Vercel preview deployments
    if (
      origin.startsWith("https://taskflow-ai-frontend-") &&
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    callback(new Error("CORS policy: Origin not allowed"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;
