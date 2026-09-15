import express from "express";

import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

import protect from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  createCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
  commentIdSchema,
} from "../validations/comment.validation.js";

const router = express.Router();

router.use(protect);

router.post("/", validate(createCommentSchema), createComment);

router.get("/task/:taskId", validate(getCommentsSchema), getComments);

router.patch("/:id", validate(updateCommentSchema), updateComment);

router.delete("/:id", validate(commentIdSchema), deleteComment);

export default router;
