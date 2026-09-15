import express from "express";

import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

import protect from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
} from "../validations/project.validation.js";

const router = express.Router();

router.use(protect);

router.post("/", validate(createProjectSchema), createProject);

router.get("/", getProjects);

router.get("/:id", validate(projectIdSchema), getProject);

router.patch("/:id", validate(updateProjectSchema), updateProject);

router.delete("/:id", validate(projectIdSchema), deleteProject);

export default router;
