import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";
import corsOptions from "./config/cors.js";
const app = express();

app.use(helmet());

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.use(cookieParser());

app.use(morgan("dev"));
//app.use(apiRateLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TaskFlow AI API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFound);

app.use(errorHandler);

export default app;
