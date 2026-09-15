import Activity from "../models/Activity.js";
import ApiError from "../utils/ApiError.js";
import Workspace from "../models/Workspace.js";

export const createActivity = async ({
  workspace,
  project = null,
  task = null,
  user,
  action,
  entityType,
  entityId,
  description,
  metadata = {},
}) => {
  return Activity.create({
    workspace,
    project,
    task,
    user,
    action,
    entityType,
    entityId,
    description,
    metadata,
  });
};

export const getActivities = async ({
  workspace,
  project,
  task,
  user,
  page = 1,
  limit = 20,
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
    filter.project = project;
  }

  if (task) {
    filter.task = task;
  }

  if (user) {
    filter.user = user;
  }

  const currentPage = Math.max(Number(page) || 1, 1);

  const currentLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const skip = (currentPage - 1) * currentLimit;

  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .populate("user", "name email avatar")
      .populate("project", "name")
      .populate("task", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit),

    Activity.countDocuments(filter),
  ]);

  return {
    activities,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit),
    },
  };
};

export const getActivityById = async (activityId, userId) => {
  const activity = await Activity.findById(activityId);

  if (!activity) {
    throw new ApiError(404, "Activity not found");
  }

  const workspace = await Workspace.findById(activity.workspace);

  if (!workspace || !workspace.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const isMember = workspace.members.some((member) => {
    const memberUserId = member.user?._id || member.user;

    return memberUserId && memberUserId.toString() === userId.toString();
  });

  if (!isMember) {
    throw new ApiError(403, "You do not have access to this activity");
  }

  await activity.populate([
    {
      path: "user",
      select: "name email avatar",
    },
    {
      path: "project",
      select: "name",
    },
    {
      path: "task",
      select: "title",
    },
  ]);

  return activity;
};
