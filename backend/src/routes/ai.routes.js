import express from "express";

import {
  generateTask,
  generateTaskDescription,
  summarizeProject,
  meetingNotesToTasks,
  askProjectAssistant,
} from "../controllers/ai.controller.js";

import protect from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  generateTaskSchema,
  generateTaskDescriptionSchema,
  summarizeProjectSchema,
  meetingNotesToTasksSchema,
  projectAssistantSchema,
} from "../validations/ai.validation.js";

const router = express.Router();

router.use(protect);

router.post("/generate-task", validate(generateTaskSchema), generateTask);

router.post(
  "/generate-task-description",
  validate(generateTaskDescriptionSchema),
  generateTaskDescription,
);

router.post(
  "/summarize-project",
  validate(summarizeProjectSchema),
  summarizeProject,
);

router.post(
  "/meeting-to-tasks",
  validate(meetingNotesToTasksSchema),
  meetingNotesToTasks,
);

router.post(
  "/project-assistant",
  validate(projectAssistantSchema),
  askProjectAssistant,
);

export default router;
