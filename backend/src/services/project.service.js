import Project from "../models/Project.js";
import Workspace from "../models/Workspace.js";
import ApiError from "../utils/ApiError.js";
import { createActivity } from "./activity.service.js";

export const createProject = async ({
  name,
  description,
  workspace,
  members = [],
  status,
  priority,
  startDate,
  dueDate,
  createdBy,
}) => {
  const workspaceExists = await Workspace.findById(workspace);

  if (!workspaceExists || !workspaceExists.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const currentMember = workspaceExists.members.find(
    (member) => member.user.toString() === createdBy.toString(),
  );

  if (!currentMember) {
    throw new ApiError(403, "You are not a member of this workspace");
  }

  const validMembers = members.filter((memberId) =>
    workspaceExists.members.some(
      (member) => member.user.toString() === memberId.toString(),
    ),
  );

  if (validMembers.length !== members.length) {
    throw new ApiError(400, "All project members must belong to the workspace");
  }

  const project = await Project.create({
    name,
    description,
    workspace,
    createdBy,
    members: validMembers,
    status,
    priority,
    startDate,
    dueDate,
  });

  await createActivity({
    workspace,
    project: project._id,
    user: createdBy,
    action: "created",
    entityType: "project",
    entityId: project._id,
    description: `Project "${project.name}" was created`,
  });

  return project;
};

export const getProjects = async ({
  workspace,
  page,
  limit,
  search,
  status,
  priority,
  userId,
}) => {
  const filter = {};

  if (workspace) {
    const workspaceExists = await Workspace.findById(workspace);

    if (!workspaceExists || !workspaceExists.isActive) {
      throw new ApiError(404, "Workspace not found");
    }

    const isMember = workspaceExists.members.some(
      (member) => member.user.toString() === userId.toString(),
    );

    if (!isMember) {
      throw new ApiError(403, "You do not have access to this workspace");
    }

    filter.workspace = workspace;
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

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate("createdBy", "name email avatar")
      .populate("members", "name email avatar")
      .populate("workspace", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit),

    Project.countDocuments(filter),
  ]);

  return {
    projects,

    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit),
    },
  };
};

export const getProjectById = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const workspace = await Workspace.findById(project.workspace);

  if (!workspace || !workspace.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const currentMember = workspace.members.find(
    (member) => member.user.toString() === userId.toString(),
  );

  if (!currentMember) {
    throw new ApiError(403, "You do not have access to this project");
  }

  await project.populate([
    {
      path: "createdBy",
      select: "name email avatar",
    },
    {
      path: "members",
      select: "name email avatar",
    },
    {
      path: "workspace",
      select: "name",
    },
  ]);

  return project;
};

export const updateProject = async (projectId, updateData, updatedBy) => {

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const workspace = await Workspace.findById(project.workspace);

  if (!workspace || !workspace.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const currentMember = workspace.members.find(
    (member) => member.user.toString() === updatedBy.toString(),
  );

  if (!currentMember) {
    throw new ApiError(403, "You do not have access to this project");
  }

  if (!["owner", "admin", "manager"].includes(currentMember.role)) {
    throw new ApiError(
      403,
      "You do not have permission to update this project",
    );
  }

  const allowedFields = [
    "name",
    "description",
    "members",
    "status",
    "priority",
    "startDate",
    "dueDate",
    "isArchived",
  ];

  const changes = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updateData, field)) {
      const oldValue = project[field];
      const newValue = updateData[field];

      if (String(oldValue) !== String(newValue)) {
        changes[field] = {
          from: oldValue,
          to: newValue,
        };
      }

      project[field] = newValue;
    }
  }

  if (Object.prototype.hasOwnProperty.call(updateData, "members")) {
    const members = updateData.members || [];

    const validMembers = members.filter((memberId) =>
      workspace.members.some(
        (workspaceMember) =>
          workspaceMember.user.toString() === memberId.toString(),
      ),
    );

    if (validMembers.length !== members.length) {
      throw new ApiError(
        400,
        "All project members must belong to the workspace",
      );
    }

    project.members = validMembers;
  }

  await project.save();

  if (Object.keys(changes).length > 0) {
    await createActivity({
      workspace: project.workspace,
      project: project._id,
      user: updatedBy,
      action: "updated",
      entityType: "project",
      entityId: project._id,
      description: `Project "${project.name}" was updated`,
      metadata: {
        changes,
      },
    });
  }

  await project.populate([
    {
      path: "createdBy",
      select: "name email avatar",
    },
    {
      path: "members",
      select: "name email avatar",
    },
    {
      path: "workspace",
      select: "name",
    },
  ]);

  return project;
};

export const deleteProject = async (projectId, deletedBy) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const workspace = await Workspace.findById(project.workspace);

  if (!workspace || !workspace.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const currentMember = workspace.members.find(
    (member) => member.user.toString() === deletedBy.toString(),
  );

  if (!currentMember) {
    throw new ApiError(403, "You do not have access to this project");
  }

  if (!["owner", "admin"].includes(currentMember.role)) {
    throw new ApiError(
      403,
      "Only workspace owner or admin can delete a project",
    );
  }

  await createActivity({
    workspace: project.workspace,
    project: project._id,
    user: deletedBy,
    action: "deleted",
    entityType: "project",
    entityId: project._id,
    description: `Project "${project.name}" was deleted`,
  });

  await Project.findByIdAndDelete(projectId);

  return project;
};
