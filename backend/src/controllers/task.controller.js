import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  createTask as createTaskService,
  getTasks as getTasksService,
  getTaskById,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
  assignTask as assignTaskService,
  updateTaskStatus as updateTaskStatusService,
  deleteTaskAttachment as deleteTaskAttachmentService,
} from "../services/task.service.js";

export const createTask = asyncHandler(async (req, res) => {
  const task = await createTaskService({
    ...req.body,
    createdBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});

export const getTasks = asyncHandler(async (req, res) => {
  const result = await getTasksService({
    ...req.query,
    userId: req.user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, "Tasks fetched successfully"));
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await getTaskById(req.params.id, req.user._id);

  res.status(200).json(new ApiResponse(200, task, "Task fetched successfully"));
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await updateTaskService(req.params.id, req.body, req.user._id);

  res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
  await deleteTaskService(req.params.id, req.user._id);

  res.status(200).json(new ApiResponse(200, null, "Task deleted successfully"));
});

export const assignTask = asyncHandler(async (req, res) => {
  const task = await assignTaskService(
    req.params.id,
    req.body.assignedTo,
    req.user._id,
  );

  res
    .status(200)
    .json(new ApiResponse(200, task, "Task assigned successfully"));
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await updateTaskStatusService(
    req.params.id,
    req.body.status,
    req.user._id,
  );

  res
    .status(200)
    .json(new ApiResponse(200, task, "Task status updated successfully"));
});

export const deleteTaskAttachment = asyncHandler(async (req, res) => {
  const task = await deleteTaskAttachmentService(
    req.params.taskId,
    req.params.attachmentId,
    req.user._id,
  );

  res
    .status(200)
    .json(new ApiResponse(200, task, "Task attachment deleted successfully"));
});
