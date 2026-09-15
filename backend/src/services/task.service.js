import mongoose from "mongoose";

import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Workspace from "../models/Workspace.js";

import { createActivity } from "./activity.service.js";
import { createNotification } from "./notification.service.js";

import { uploadToCloudinary, deleteFromCloudinary } from "./upload.service.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getWorkspaceForUser = async (workspaceId, userId) => {
  if (!workspaceId || !isValidObjectId(workspaceId)) {
    return null;
  }

  return Workspace.findOne({
    _id: workspaceId,
    isActive: true,
    "members.user": userId,
  });
};

const getUserWorkspaceIds = async (userId) => {
  const workspaces = await Workspace.find({
    isActive: true,
    "members.user": userId,
  }).select("_id");

  return workspaces.map((workspace) => workspace._id);
};

const getWorkspaceMemberRole = (workspace, userId) => {
  const member = workspace.members.find(
    (item) => item.user.toString() === userId.toString(),
  );

  return member?.role || null;
};

const isWorkspaceMember = (workspace, userId) => {
  return workspace.members.some(
    (member) => member.user.toString() === userId.toString(),
  );
};

const getProjectForWorkspace = async (projectId, workspaceId) => {
  if (!projectId || !isValidObjectId(projectId)) {
    return null;
  }

  return Project.findOne({
    _id: projectId,
    workspace: workspaceId,
  });
};

const isProjectMember = (project, userId) => {
  if (!project) return false;

  return project.members.some(
    (member) => member.toString() === userId.toString(),
  );
};

export const createTask = async ({
  title,
  description,
  project,
  workspace,
  assignedTo,
  status,
  priority,
  dueDate,
  tags,
  attachments,
  createdBy,
}) => {
  const workspaceDoc = await getWorkspaceForUser(workspace, createdBy);

  if (!workspaceDoc) {
    throw new Error("Workspace not found or access denied");
  }

  const workspaceRole = getWorkspaceMemberRole(workspaceDoc, createdBy);

  if (!["owner", "admin", "manager"].includes(workspaceRole)) {
    throw new Error("You do not have permission to create tasks");
  }

  const projectDoc = await getProjectForWorkspace(project, workspace);

  if (!projectDoc) {
    throw new Error("Project not found in this workspace");
  }

  if (assignedTo) {
    if (!isWorkspaceMember(workspaceDoc, assignedTo)) {
      throw new Error("Assigned user is not a member of this workspace");
    }

    if (!isProjectMember(projectDoc, assignedTo)) {
      throw new Error("Assigned user is not a member of this project");
    }
  }

  const task = await Task.create({
    title,
    description,
    project,
    workspace,
    assignedTo: assignedTo || null,
    status: status || "todo",
    priority: priority || "medium",
    dueDate: dueDate || null,
    tags: tags || [],
    attachments: attachments || [],
    createdBy,
  });

  await task.populate([
    {
      path: "createdBy",
      select: "name email",
    },
    {
      path: "assignedTo",
      select: "name email",
    },
    {
      path: "project",
      select: "name workspace",
    },
    {
      path: "workspace",
      select: "name",
    },
  ]);

  

  await createActivity({
    user: createdBy,
    workspace,
    project,
    task: task._id,
    action: "created",
    entityType: "task",
    entityId: task._id,
    description: `Created task "${task.title}"`,
  });

  

  if (assignedTo && assignedTo.toString() !== createdBy.toString()) {
    await createNotification({
      recipient: assignedTo,
      sender: createdBy,
      workspace,
      project,
      task: task._id,
      type: "task_assigned",
      message: `You were assigned task "${task.title}"`,
    });
  }

  return task;
};

export const getTasks = async ({
  userId,
  workspace,
  project,
  assignedTo,
  status,
  priority,
  search,
  page = 1,
  limit = 10,
}) => {
  

  if (!userId) {
    throw new Error("User authentication is required");
  }

  const accessibleWorkspaceIds = await getUserWorkspaceIds(userId);

  if (accessibleWorkspaceIds.length === 0) {
    return {
      tasks: [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 0,
        pages: 0,
      },
    };
  }

  const filter = {};

  

  if (workspace) {
    if (!isValidObjectId(workspace)) {
      throw new Error("Invalid workspace ID");
    }

    const hasAccess = accessibleWorkspaceIds.some(
      (workspaceId) => workspaceId.toString() === workspace.toString(),
    );

    if (!hasAccess) {
      throw new Error("You do not have access to this workspace");
    }

    filter.workspace = workspace;
  } else {
    

    filter.workspace = {
      $in: accessibleWorkspaceIds,
    };
  }

  

  if (project) {
    if (!isValidObjectId(project)) {
      throw new Error("Invalid project ID");
    }

    const projectDoc = await Project.findOne({
      _id: project,
      workspace: filter.workspace,
    });

    if (!projectDoc) {
      throw new Error("Project not found or access denied");
    }

    filter.project = project;
  }

  

  if (assignedTo) {
    if (!isValidObjectId(assignedTo)) {
      throw new Error("Invalid assigned user ID");
    }

    filter.assignedTo = assignedTo;
  }

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  

  if (search?.trim()) {
    filter.$or = [
      {
        title: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        description: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const skip = (pageNumber - 1) * limitNumber;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("project", "name workspace")
      .populate("workspace", "name")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber),

    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber),
    },
  };
};

export const getTaskById = async ({ taskId, userId }) => {
  if (!isValidObjectId(taskId)) {
    throw new Error("Invalid task ID");
  }

  const task = await Task.findById(taskId)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("project", "name workspace members")
    .populate("workspace", "name members");

  if (!task) {
    throw new Error("Task not found");
  }

  if (!task.workspace) {
    throw new Error("Task workspace not found");
  }

  const hasAccess = isWorkspaceMember(task.workspace, userId);

  if (!hasAccess) {
    throw new Error("You do not have access to this task");
  }

  return task;
};

export const updateTask = async ({
  taskId,
  userId,
  title,
  description,
  assignedTo,
  status,
  priority,
  dueDate,
  tags,
  attachments,
}) => {
  if (!isValidObjectId(taskId)) {
    throw new Error("Invalid task ID");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const workspace = await getWorkspaceForUser(task.workspace, userId);

  if (!workspace) {
    throw new Error("Workspace not found or access denied");
  }

  const workspaceRole = getWorkspaceMemberRole(workspace, userId);

  const isManagerLevel = ["owner", "admin", "manager"].includes(workspaceRole);

  const isTaskOwner = task.createdBy?.toString() === userId.toString();

  const isAssignee = task.assignedTo?.toString() === userId.toString();

  

  if (!isManagerLevel && !isTaskOwner && !isAssignee) {
    throw new Error("You do not have permission to update this task");
  }

  

  if (assignedTo !== undefined) {
    if (assignedTo === null || assignedTo === "") {
      task.assignedTo = null;
    } else {
      if (!isValidObjectId(assignedTo)) {
        throw new Error("Invalid assigned user ID");
      }

      if (!isManagerLevel) {
        throw new Error("You do not have permission to reassign tasks");
      }

      if (!isWorkspaceMember(workspace, assignedTo)) {
        throw new Error("Assigned user is not a member of this workspace");
      }

      const project = await getProjectForWorkspace(
        task.project,
        task.workspace,
      );

      if (!project) {
        throw new Error("Project not found");
      }

      if (!isProjectMember(project, assignedTo)) {
        throw new Error("Assigned user is not a member of this project");
      }

      task.assignedTo = assignedTo;
    }
  }

  

  if (title !== undefined) {
    task.title = title;
  }

  if (description !== undefined) {
    task.description = description;
  }

  if (status !== undefined) {
    task.status = status;

    if (status === "completed") {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }
  }

  if (priority !== undefined) {
    task.priority = priority;
  }

  if (dueDate !== undefined) {
    task.dueDate = dueDate;
  }

  if (tags !== undefined) {
    task.tags = tags;
  }

  if (attachments !== undefined) {
    task.attachments = attachments;
  }

  await task.save();

  await task.populate([
    {
      path: "createdBy",
      select: "name email",
    },
    {
      path: "assignedTo",
      select: "name email",
    },
    {
      path: "project",
      select: "name workspace",
    },
    {
      path: "workspace",
      select: "name",
    },
  ]);

  

  await createActivity({
    user: userId,
    workspace: task.workspace,
    project: task.project,
    task: task._id,
    action: "updated",
    entityType: "task",
    entityId: task._id,
    description: `Updated task "${task.title}"`,
  });

  return task;
};

export const updateTaskStatus = async ({ taskId, userId, status }) => {
  if (!isValidObjectId(taskId)) {
    throw new Error("Invalid task ID");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const workspace = await getWorkspaceForUser(task.workspace, userId);

  if (!workspace) {
    throw new Error("Workspace not found or access denied");
  }

  const workspaceRole = getWorkspaceMemberRole(workspace, userId);

  const isManagerLevel = ["owner", "admin", "manager"].includes(workspaceRole);

  const isTaskOwner = task.createdBy?.toString() === userId.toString();

  const isAssignee = task.assignedTo?.toString() === userId.toString();

  if (!isManagerLevel && !isTaskOwner && !isAssignee) {
    throw new Error("You do not have permission to update this task");
  }

  task.status = status;

  if (status === "completed") {
    task.completedAt = new Date();
  } else {
    task.completedAt = null;
  }

  await task.save();

  await task.populate([
    {
      path: "createdBy",
      select: "name email",
    },
    {
      path: "assignedTo",
      select: "name email",
    },
    {
      path: "project",
      select: "name workspace",
    },
    {
      path: "workspace",
      select: "name",
    },
  ]);

  await createActivity({
    user: userId,
    workspace: task.workspace,
    project: task.project,
    task: task._id,
    action: "status_updated",
    entityType: "task",
    entityId: task._id,
    description: `Changed task "${task.title}" status to "${status}"`,
  });

  return task;
};

export const deleteTask = async ({ taskId, userId }) => {
  if (!isValidObjectId(taskId)) {
    throw new Error("Invalid task ID");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const workspace = await getWorkspaceForUser(task.workspace, userId);

  if (!workspace) {
    throw new Error("Workspace not found or access denied");
  }

  const workspaceRole = getWorkspaceMemberRole(workspace, userId);

  if (!["owner", "admin"].includes(workspaceRole)) {
    throw new Error("You do not have permission to delete this task");
  }

  

  if (Array.isArray(task.attachments) && task.attachments.length > 0) {
    for (const attachment of task.attachments) {
      if (attachment.publicId) {
        try {
          await deleteFromCloudinary(attachment.publicId);
        } catch (error) {

        }
      }
    }
  }

  await task.deleteOne();

  await createActivity({
    user: userId,
    workspace: task.workspace,
    project: task.project,
    task: task._id,
    action: "deleted",
    entityType: "task",
    entityId: task._id,
    description: `Deleted task "${task.title}"`,
  });

  return {
    message: "Task deleted successfully",
  };
};

export const assignTask = async ({ taskId, userId, assignedTo }) => {
  if (!isValidObjectId(taskId)) {
    throw new Error("Invalid task ID");
  }

  if (!isValidObjectId(assignedTo)) {
    throw new Error("Invalid assigned user ID");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const workspace = await getWorkspaceForUser(task.workspace, userId);

  if (!workspace) {
    throw new Error("Workspace not found or access denied");
  }

  const workspaceRole = getWorkspaceMemberRole(workspace, userId);

  if (!["owner", "admin", "manager"].includes(workspaceRole)) {
    throw new Error("You do not have permission to assign tasks");
  }

  if (!isWorkspaceMember(workspace, assignedTo)) {
    throw new Error("Assigned user is not a member of this workspace");
  }

  const project = await getProjectForWorkspace(task.project, task.workspace);

  if (!project) {
    throw new Error("Project not found");
  }

  if (!isProjectMember(project, assignedTo)) {
    throw new Error("Assigned user is not a member of this project");
  }

  task.assignedTo = assignedTo;

  await task.save();

  await task.populate([
    {
      path: "createdBy",
      select: "name email",
    },
    {
      path: "assignedTo",
      select: "name email",
    },
    {
      path: "project",
      select: "name workspace",
    },
    {
      path: "workspace",
      select: "name",
    },
  ]);

  await createActivity({
    user: userId,
    workspace: task.workspace,
    project: task.project,
    task: task._id,
    action: "assigned",
    entityType: "task",
    entityId: task._id,
    description: `Assigned task "${task.title}"`,
  });

  if (assignedTo.toString() !== userId.toString()) {
    await createNotification({
      recipient: assignedTo,
      sender: userId,
      workspace: task.workspace,
      project: task.project,
      task: task._id,
      type: "task_assigned",
      message: `You were assigned task "${task.title}"`,
    });
  }

  return task;
};

export const deleteTaskAttachment = async ({
  taskId,
  attachmentId,
  userId,
}) => {
  if (!isValidObjectId(taskId)) {
    throw new Error("Invalid task ID");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const workspace = await getWorkspaceForUser(task.workspace, userId);

  if (!workspace) {
    throw new Error("Workspace not found or access denied");
  }

  const workspaceRole = getWorkspaceMemberRole(workspace, userId);

  const isManagerLevel = ["owner", "admin", "manager"].includes(workspaceRole);

  const isTaskOwner = task.createdBy?.toString() === userId.toString();

  const isAssignee = task.assignedTo?.toString() === userId.toString();

  if (!isManagerLevel && !isTaskOwner && !isAssignee) {
    throw new Error("You do not have permission to delete this attachment");
  }

  const attachmentIndex = task.attachments.findIndex(
    (attachment) =>
      attachment._id?.toString() === attachmentId.toString() ||
      attachment.publicId === attachmentId,
  );

  if (attachmentIndex === -1) {
    throw new Error("Attachment not found");
  }

  const attachment = task.attachments[attachmentIndex];

  

  if (attachment.publicId) {
    await deleteFromCloudinary(attachment.publicId);
  }

  

  task.attachments.splice(attachmentIndex, 1);

  await task.save();

  await createActivity({
    user: userId,
    workspace: task.workspace,
    project: task.project,
    task: task._id,
    action: "attachment_deleted",
    entityType: "task",
    entityId: task._id,
    description: `Deleted attachment from task "${task.title}"`,
  });

  return task;
};

export {
  createTask as createTaskService,
  getTasks as getTasksService,
  getTaskById as getTaskByIdService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
  assignTask as assignTaskService,
  updateTaskStatus as updateTaskStatusService,
  deleteTaskAttachment as deleteTaskAttachmentService,
};
