import Comment from "../models/Comment.js";

import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";
import ApiError from "../utils/ApiError.js";
import { createNotification } from "./notification.service.js";
import { createActivity } from "./activity.service.js";
export const createComment = async ({ task, user, content }) => {
  const taskExists = await Task.findById(task);

  if (!taskExists) {
    throw new ApiError(404, "Task not found");
  }

  const workspace = await Workspace.findById(taskExists.workspace);

  if (!workspace || !workspace.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const isMember = workspace.members.some((member) => {
    const memberUserId = member.user?._id || member.user;

    return memberUserId && memberUserId.toString() === user.toString();
  });

  if (!isMember) {
    throw new ApiError(403, "You do not have access to this task");
  }

  const comment = await Comment.create({
    task,
    user,
    content,
  });

  await comment.populate("user", "name email avatar");

  await createActivity({
    workspace: taskExists.workspace,
    project: taskExists.project,
    task: taskExists._id,
    user,
    action: "commented",
    entityType: "comment",
    entityId: comment._id,
    description: `${comment.user.name} commented on task "${taskExists.title}"`,
    metadata: {
      commentId: comment._id,
    },
  });

  const recipients = new Set();

  if (
    taskExists.createdBy &&
    taskExists.createdBy.toString() !== user.toString()
  ) {
    recipients.add(taskExists.createdBy.toString());
  }

  if (
    taskExists.assignedTo &&
    taskExists.assignedTo.toString() !== user.toString()
  ) {
    recipients.add(taskExists.assignedTo.toString());
  }

  await Promise.all(
    [...recipients].map((recipient) =>
      createNotification({
        recipient,
        sender: user,
        type: "comment-added",
        title: "New comment on your task",
        message: `A new comment was added to "${taskExists.title}"`,
        relatedTask: taskExists._id,
        relatedProject: taskExists.project,
        relatedWorkspace: taskExists.workspace,
      }),
    ),
  );

  return comment;
};
export const getComments = async (taskId, userId) => {
  const taskExists = await Task.findById(taskId);

  if (!taskExists) {
    throw new ApiError(404, "Task not found");
  }

  const workspace = await Workspace.findById(taskExists.workspace);

  if (!workspace || !workspace.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const isMember = workspace.members.some((member) => {
    const memberUserId = member.user?._id || member.user;

    return memberUserId && memberUserId.toString() === userId.toString();
  });

  if (!isMember) {
    throw new ApiError(403, "You do not have access to this task");
  }

  return Comment.find({ task: taskId })
    .populate("user", "name email avatar")
    .sort({ createdAt: -1 });
};
export const updateComment = async (commentId, userId, content) => {
  const comment = await Comment.findOne({
    _id: commentId,
    user: userId,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found or you are not the owner");
  }

  const task = await Task.findById(comment.task);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const workspace = await Workspace.findById(task.workspace);

  if (!workspace || !workspace.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const isMember = workspace.members.some((member) => {
    const memberUserId = member.user?._id || member.user;

    return memberUserId && memberUserId.toString() === userId.toString();
  });

  if (!isMember) {
    throw new ApiError(403, "You do not have access to this task");
  }

  comment.content = content;
  comment.editedAt = new Date();

  await comment.save();

  await comment.populate("user", "name email avatar");

  return comment;
};

export const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findOne({
    _id: commentId,
    user: userId,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found or you are not the owner");
  }

  const task = await Task.findById(comment.task);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const workspace = await Workspace.findById(task.workspace);

  if (!workspace || !workspace.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const isMember = workspace.members.some((member) => {
    const memberUserId = member.user?._id || member.user;

    return memberUserId && memberUserId.toString() === userId.toString();
  });

  if (!isMember) {
    throw new ApiError(403, "You do not have access to this task");
  }

  await Comment.findByIdAndDelete(commentId);

  return comment;
};
