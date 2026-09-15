import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  createComment as createCommentService,
  getComments as getCommentsService,
  updateComment as updateCommentService,
  deleteComment as deleteCommentService,
} from "../services/comment.service.js";

export const createComment = asyncHandler(async (req, res) => {
  const comment = await createCommentService({
    ...req.body,
    user: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

export const getComments = asyncHandler(async (req, res) => {
  const comments = await getCommentsService(req.params.taskId, req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

export const updateComment = asyncHandler(async (req, res) => {
  const comment = await updateCommentService(
    req.params.id,
    req.user._id,
    req.body.content,
  );

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  await deleteCommentService(req.params.id, req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});
