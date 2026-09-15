import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Workspace from "../models/Workspace.js";
import ApiError from "../utils/ApiError.js";
import { createNotification } from "./notification.service.js";
import { createActivity } from "./activity.service.js";
import { deleteFromCloudinary } from "./upload.service.js";
const checkWorkspaceMember = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  const isMember = workspace.members.some(
    (member) => member.user.toString() === userId.toString(),
  );

  if (!isMember) {
    throw new ApiError(403, "You are not a member of this workspace");
  }

  return workspace;
};

export const createTask = async ({
  title,
  description,
  project,
  workspace,
  createdBy,
  assignedTo,
  status,
  priority,
  dueDate,
  tags,
}) => {
  await checkWorkspaceMember(workspace, createdBy);

  const projectExists = await Project.findOne({
    _id: project,
    workspace,
  });

  if (!projectExists) {
    throw new ApiError(404, "Project not found in this workspace");
  }

  if (assignedTo) {
    const isProjectMember = projectExists.members.some(
      (memberId) => memberId.toString() === assignedTo.toString(),
    );

    if (!isProjectMember) {
      throw new ApiError(400, "Assigned user must be a project member");
    }
  }

  const task = await Task.create({
    title,
    description,
    project,
    workspace,
    createdBy,
    assignedTo,
    status,
    priority,
    dueDate,
    tags,
  });

  await createActivity({
    workspace,
    project,
    task: task._id,
    user: createdBy,
    action: "created",
    entityType: "task",
    entityId: task._id,
    description: `Task "${task.title}" was created`,
  });

  return task;
};

export const getTasks = async ({
  project,
  workspace,
  assignedTo,
  status,
  priority,
  search,
  page,
  limit,
  userId,
}) => {
  const filter = {};

  if (workspace) {
    const workspaceExists = await Workspace.findById(workspace);

    if (!workspaceExists || !workspaceExists.isActive) {
      throw new ApiError(404, "Workspace not found");
    }

    const isMember = workspaceExists.members.some((member) => {
      const memberUserId = member.user?._id || member.user;

      return memberUserId && memberUserId.toString() === userId.toString();
    });

    if (!isMember) {
      throw new ApiError(403, "You do not have access to this workspace");
    }

    filter.workspace = workspace;
  }

  if (project) {
    const projectExists = await Project.findById(project);

    if (!projectExists) {
      throw new ApiError(404, "Project not found");
    }

    const workspaceExists = await Workspace.findById(projectExists.workspace);

    if (!workspaceExists || !workspaceExists.isActive) {
      throw new ApiError(404, "Workspace not found");
    }

    const isMember = workspaceExists.members.some((member) => {
      const memberUserId = member.user?._id || member.user;

      return memberUserId && memberUserId.toString() === userId.toString();
    });

    if (!isMember) {
      throw new ApiError(403, "You do not have access to this project");
    }

    filter.project = project;
  }

  if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (search) {
    filter.$text = {
      $search: search,
    };
  }

  const currentPage = Math.max(Number(page) || 1, 1);

  const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const skip = (currentPage - 1) * currentLimit;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate("createdBy", "name email avatar")
      .populate("assignedTo", "name email avatar")
      .populate("project", "name status priority")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit),

    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit),
    },
  };
};
export const getTaskById = async (taskId, userId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const workspace = await Workspace.findOne({
    _id: task.workspace,
    "members.user": userId,
    isActive: true,
  });

  if (!workspace) {
    throw new ApiError(403, "You do not have access to this task");
  }

  await task.populate([
    { path: "createdBy", select: "name email avatar" },
    { path: "assignedTo", select: "name email avatar" },
    { path: "project", select: "name status priority" },
    { path: "workspace", select: "name" },
  ]);

  return task;
};

export const updateTask = async (taskId, updateData, updatedBy) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const workspace = await Workspace.findById(task.workspace);

  if (!workspace || !workspace.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const isMember = workspace.members.some((member) => {
    const memberUserId = member.user?._id || member.user;

    return memberUserId && memberUserId.toString() === updatedBy.toString();
  });

  if (!isMember) {
    throw new ApiError(403, "You do not have access to this task");
  }

  const oldValues = {
    title: task.title,
    description: task.description,
    assignedTo: task.assignedTo,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    tags: task.tags,
    attachments: task.attachments,
  };

  const allowedUpdates = [
    "title",
    "description",
    "assignedTo",
    "status",
    "priority",
    "dueDate",
    "tags",
    "attachments",
  ];

  const updates = {};

  for (const field of allowedUpdates) {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  }

  Object.assign(task, updates);

  if (
    updates.status &&
    updates.status === "completed" &&
    task.completedAt === null
  ) {
    task.completedAt = new Date();
  }

  if (updates.status && updates.status !== "completed") {
    task.completedAt = null;
  }

  await task.save();

  const changedFields = [];

  for (const field of allowedUpdates) {
    if (updateData[field] !== undefined) {
      changedFields.push(field);
    }
  }

  await createActivity({
    workspace: task.workspace,
    project: task.project,
    task: task._id,
    user: updatedBy,
    action: "updated",
    entityType: "task",
    entityId: task._id,
    description: `Task "${task.title}" was updated`,
    metadata: {
      changedFields,
      oldValues,
      newValues: updates,
    },
  });

  await task.populate([
    {
      path: "createdBy",
      select: "name email avatar",
    },
    {
      path: "assignedTo",
      select: "name email avatar",
    },
    {
      path: "project",
      select: "name status priority",
    },
  ]);

  return task;
};
export const deleteTask = async (taskId, deletedBy) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const workspace = await Workspace.findOne({
    _id: task.workspace,
    "members.user": deletedBy,
    isActive: true,
  });

  if (!workspace) {
    throw new ApiError(403, "You do not have access to this task");
  }

  const member = workspace.members.find(
    (item) => item.user.toString() === deletedBy.toString(),
  );

  if (!member || !["owner", "admin"].includes(member.role)) {
    throw new ApiError(403, "Only workspace owner or admin can delete a task");
  }

  await createActivity({
    workspace: task.workspace,
    project: task.project,
    task: task._id,
    user: deletedBy,
    action: "deleted",
    entityType: "task",
    entityId: task._id,
    description: `Task "${task.title}" was deleted`,
  });

  await Task.findByIdAndDelete(taskId);

  return task;
};
export const assignTask = async (taskId, assignedTo, assignedBy) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const workspace = await Workspace.findOne({
    _id: task.workspace,
    "members.user": assignedBy,
    isActive: true,
  });

  if (!workspace) {
    throw new ApiError(403, "You do not have access to this task");
  }

  const actor = workspace.members.find(
    (member) => member.user.toString() === assignedBy.toString(),
  );

  if (!actor || !["owner", "admin", "manager"].includes(actor.role)) {
    throw new ApiError(403, "You do not have permission to assign this task");
  }

  if (assignedTo) {
    const isWorkspaceMember = workspace.members.some(
      (member) => member.user.toString() === assignedTo.toString(),
    );

    if (!isWorkspaceMember) {
      throw new ApiError(400, "Assigned user must be a workspace member");
    }

    const project = await Project.findOne({
      _id: task.project,
      workspace: task.workspace,
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const isProjectMember = project.members.some(
      (memberId) => memberId.toString() === assignedTo.toString(),
    );

    if (!isProjectMember) {
      throw new ApiError(400, "Assigned user must be a project member");
    }
  }

  const previousAssignee = task.assignedTo;

  task.assignedTo = assignedTo || null;

  await task.save();

  if (
    assignedTo &&
    (!previousAssignee || previousAssignee.toString() !== assignedTo.toString())
  ) {
    await createNotification({
      recipient: assignedTo,
      sender: assignedBy,
      type: "task-assigned",
      title: "Task assigned to you",
      message: `You have been assigned the task "${task.title}"`,
      relatedTask: task._id,
      relatedProject: task.project,
      relatedWorkspace: task.workspace,
    });

    await createActivity({
      workspace: task.workspace,
      project: task.project,
      task: task._id,
      user: assignedBy,
      action: "assigned",
      entityType: "task",
      entityId: task._id,
      description: `Task "${task.title}" was assigned to a user`,
      metadata: {
        assignedTo,
      },
    });
  }

  return task;
};
export const updateTaskStatus = async (taskId, status, updatedBy) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const workspace = await Workspace.findOne({
    _id: task.workspace,
    "members.user": updatedBy,
    isActive: true,
  });

  if (!workspace) {
    throw new ApiError(403, "You do not have access to this task");
  }

  const previousStatus = task.status;

  task.status = status;

  if (status === "completed") {
    task.completedAt = new Date();
  } else {
    task.completedAt = null;
  }

  await task.save();

  if (previousStatus !== status) {
    await createActivity({
      workspace: task.workspace,
      project: task.project,
      task: task._id,
      user: updatedBy,
      action: "status-changed",
      entityType: "task",
      entityId: task._id,
      description: `Task "${task.title}" status changed from "${previousStatus}" to "${status}"`,
      metadata: {
        previousStatus,
        newStatus: status,
      },
    });
  }

  return task;
};
export const deleteTaskAttachment = async (taskId, attachmentId, deletedBy) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const workspace = await Workspace.findById(task.workspace);

  if (!workspace || !workspace.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const isMember = workspace.members.some((member) => {
    const memberUserId = member.user?._id || member.user;

    return memberUserId && memberUserId.toString() === deletedBy.toString();
  });

  if (!isMember) {
    throw new ApiError(403, "You do not have access to this task");
  }

  const attachment = task.attachments.id(attachmentId);

  if (!attachment) {
    throw new ApiError(404, "Attachment not found");
  }

  await deleteFromCloudinary(attachment.publicId);

  task.attachments.pull(attachmentId);

  await task.save();

  await createActivity({
    workspace: task.workspace,
    project: task.project,
    task: task._id,
    user: deletedBy,
    action: "deleted",
    entityType: "task",
    entityId: task._id,
    description: `Attachment "${attachment.originalName}" was deleted from task "${task.title}"`,
    metadata: {
      attachmentId,
      originalName: attachment.originalName,
      publicId: attachment.publicId,
    },
  });

  return task;
};
