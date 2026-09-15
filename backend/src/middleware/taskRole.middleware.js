import ApiError from "../utils/ApiError.js";
import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";

const taskRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, "Authentication required"));
      }

      const taskId = req.params.id;

      if (!taskId) {
        return next(new ApiError(400, "Task ID is required"));
      }

      const task = await Task.findById(taskId);

      if (!task) {
        return next(new ApiError(404, "Task not found"));
      }

      const workspace = await Workspace.findOne({
        _id: task.workspace,
        isActive: true,
      });

      if (!workspace) {
        return next(new ApiError(404, "Workspace not found"));
      }

      const member = workspace.members.find(
        (item) => item.user.toString() === req.user._id.toString(),
      );

      if (!member) {
        return next(
          new ApiError(403, "You are not a member of this workspace"),
        );
      }

      if (!allowedRoles.includes(member.role)) {
        return next(
          new ApiError(
            403,
            "You do not have permission to perform this action",
          ),
        );
      }

      req.task = task;
      req.workspace = workspace;
      req.workspaceMember = member;
      req.workspaceRole = member.role;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default taskRole;
