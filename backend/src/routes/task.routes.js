import express from "express";

import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  assignTask,
  updateTaskStatus,
} from "../controllers/task.controller.js";
import { deleteTaskAttachment } from "../controllers/task.controller.js";
import { deleteTaskAttachmentSchema } from "../validations/task.validation.js";

import protect from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  updateTaskStatusSchema,
  taskIdSchema,
} from "../validations/task.validation.js";

const router = express.Router();

router.use(protect);

router.post("/", validate(createTaskSchema), createTask);

router.get("/", getTasks);
router.delete(
  "/:taskId/attachments/:attachmentId",
  validate(deleteTaskAttachmentSchema),
  deleteTaskAttachment,
);

router.get("/:id", validate(taskIdSchema), getTask);

router.patch("/:id", validate(updateTaskSchema), updateTask);

router.delete("/:id", validate(taskIdSchema), deleteTask);

router.patch("/:id/assign", validate(assignTaskSchema), assignTask);

router.patch("/:id/status", validate(updateTaskStatusSchema), updateTaskStatus);

export default router;
