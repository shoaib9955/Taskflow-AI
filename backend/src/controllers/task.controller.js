import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  createTaskService,
  getTasksService,
  getTaskByIdService,
  updateTaskService,
  deleteTaskService,
  assignTaskService,
  updateTaskStatusService,
  deleteTaskAttachmentService,
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
  const task = await getTaskByIdService({
    taskId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, task, "Task fetched successfully"));
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await updateTaskService({
    taskId: req.params.id,
    userId: req.user._id,
    ...req.body,
  });

  res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
  await deleteTaskService({
    taskId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, null, "Task deleted successfully"));
});

export const assignTask = asyncHandler(async (req, res) => {
  const task = await assignTaskService({
    taskId: req.params.id,
    userId: req.user._id,
    assignedTo: req.body.assignedTo,
  });

  res
    .status(200)
    .json(new ApiResponse(200, task, "Task assigned successfully"));
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await updateTaskStatusService({
    taskId: req.params.id,
    userId: req.user._id,
    status: req.body.status,
  });

  res
    .status(200)
    .json(new ApiResponse(200, task, "Task status updated successfully"));
});

export const deleteTaskAttachment = asyncHandler(async (req, res) => {
  const task = await deleteTaskAttachmentService({
    taskId: req.params.taskId,
    attachmentId: req.params.attachmentId,
    userId: req.user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, task, "Task attachment deleted successfully"));
});
