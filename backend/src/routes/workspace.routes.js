import express from "express";

import {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
  updateMemberRole,
} from "../controllers/workspace.controller.js";

import protect from "../middleware/auth.middleware.js";
import workspaceRole from "../middleware/workspaceRole.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdSchema,
  addMemberSchema,
  memberSchema,
} from "../validations/workspace.validation.js";

const router = express.Router();

router.use(protect);

router.post("/", validate(createWorkspaceSchema), createWorkspace);

router.get("/", getWorkspaces);

router.get("/:id", validate(workspaceIdSchema), getWorkspace);

router.patch(
  "/:id",
  validate(updateWorkspaceSchema),
  workspaceRole("owner", "admin"),
  updateWorkspace,
);

router.delete(
  "/:id",
  validate(workspaceIdSchema),
  workspaceRole("owner"),
  deleteWorkspace,
);

router.post(
  "/:id/members",
  validate(addMemberSchema),
  workspaceRole("owner", "admin"),
  addMember,
);

router.patch(
  "/:id/members/:userId",
  validate(memberSchema),
  workspaceRole("owner", "admin"),
  updateMemberRole,
);

router.delete(
  "/:id/members/:userId",
  validate(memberSchema),
  workspaceRole("owner", "admin"),
  removeMember,
);

export default router;
