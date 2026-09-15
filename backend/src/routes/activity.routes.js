import express from "express";

import {
  getActivities,
  getActivityById,
} from "../controllers/activity.controller.js";

import protect from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  getActivitiesSchema,
  activityIdSchema,
} from "../validations/activity.validation.js";

const router = express.Router();

router.use(protect);

router.get("/", validate(getActivitiesSchema), getActivities);

router.get("/:id", validate(activityIdSchema), getActivityById);

export default router;
