import express from "express";

import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  assignTask,
  updateTaskStatus,
  deleteTaskAttachment,
} from "../controllers/task.controller.js";

import protect from "../middleware/auth.middleware.js";
import taskRole from "../middleware/taskRole.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
  assignTaskSchema,
  updateTaskStatusSchema,
  deleteTaskAttachmentSchema,
} from "../validations/task.validation.js";

const router = express.Router();

router.use(protect);

router.post("/", validate(createTaskSchema), createTask);

router.get("/", getTasks);

router.get("/:id", validate(taskIdSchema), getTask);

router.patch("/:id", validate(updateTaskSchema), updateTask);

router.delete(
  "/:id",
  validate(taskIdSchema),
  taskRole("owner", "admin"),
  deleteTask,
);

router.patch(
  "/:id/assign",
  validate(assignTaskSchema),
  taskRole("owner", "admin", "manager"),
  assignTask,
);

router.patch("/:id/status", validate(updateTaskStatusSchema), updateTaskStatus);

router.delete(
  "/:taskId/attachments/:attachmentId",
  validate(deleteTaskAttachmentSchema),
  deleteTaskAttachment,
);

export default router;
