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
import validate from "../middleware/validate.middleware.js";
import authorize from "../middleware/role.middleware.js";

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

router.patch("/:id", validate(updateWorkspaceSchema), updateWorkspace);

router.delete("/:id", validate(workspaceIdSchema), deleteWorkspace);

router.post("/:id/members", validate(addMemberSchema), addMember);

router.patch("/:id/members/:userId", validate(memberSchema), updateMemberRole);

router.delete("/:id/members/:userId", validate(memberSchema), removeMember);

export default router;
