import Activity from "../models/Activity.js";
import ApiError from "../utils/ApiError.js";
import Workspace from "../models/Workspace.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

const isWorkspaceMember = (workspace, userId) => {
  if (!workspace || !userId) {
    return false;
  }

  return workspace.members.some((member) => {
    const memberUserId = member.user?._id || member.user;

    return memberUserId && memberUserId.toString() === userId.toString();
  });
};

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
  if (!userId) {
    throw new ApiError(401, "User authentication is required");
  }

  

  let authorizedWorkspaceId = null;

  if (workspace) {
    const workspaceExists = await Workspace.findOne({
      _id: workspace,
      isActive: true,
    });

    if (!workspaceExists) {
      throw new ApiError(404, "Workspace not found");
    }

    if (!isWorkspaceMember(workspaceExists, userId)) {
      throw new ApiError(403, "You do not have access to this workspace");
    }

    authorizedWorkspaceId = workspaceExists._id;
  } else {
    

    const userWorkspaces = await Workspace.find({
      isActive: true,
      "members.user": userId,
    }).select("_id");

    

    if (userWorkspaces.length === 0) {
      return {
        activities: [],
        pagination: {
          page: Math.max(Number(page) || 1, 1),
          limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
          total: 0,
          totalPages: 0,
        },
      };
    }

    

    authorizedWorkspaceId = {
      $in: userWorkspaces.map((item) => item._id),
    };
  }

  

  const filter = {
    workspace: authorizedWorkspaceId,
  };

  

  if (project) {
    const projectExists = await Project.findById(project);

    if (!projectExists) {
      throw new ApiError(404, "Project not found");
    }

    

    if (authorizedWorkspaceId && !authorizedWorkspaceId.$in) {
      if (
        projectExists.workspace.toString() !== authorizedWorkspaceId.toString()
      ) {
        throw new ApiError(403, "Project does not belong to this workspace");
      }
    }

    

    if (authorizedWorkspaceId?.$in) {
      const hasAccess = authorizedWorkspaceId.$in.some(
        (workspaceId) =>
          workspaceId.toString() === projectExists.workspace.toString(),
      );

      if (!hasAccess) {
        throw new ApiError(403, "You do not have access to this project");
      }
    }

    filter.project = project;
  }

  

  if (task) {
    const taskExists = await Task.findById(task);

    if (!taskExists) {
      throw new ApiError(404, "Task not found");
    }

    

    if (authorizedWorkspaceId && !authorizedWorkspaceId.$in) {
      if (
        taskExists.workspace.toString() !== authorizedWorkspaceId.toString()
      ) {
        throw new ApiError(403, "Task does not belong to this workspace");
      }
    }

    

    if (authorizedWorkspaceId?.$in) {
      const hasAccess = authorizedWorkspaceId.$in.some(
        (workspaceId) =>
          workspaceId.toString() === taskExists.workspace.toString(),
      );

      if (!hasAccess) {
        throw new ApiError(403, "You do not have access to this task");
      }
    }

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
      .sort({
        createdAt: -1,
      })
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

  

  const workspace = await Workspace.findOne({
    _id: activity.workspace,
    isActive: true,
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  

  if (!isWorkspaceMember(workspace, userId)) {
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
