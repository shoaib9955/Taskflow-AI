import ApiError from "../utils/ApiError.js";
import Project from "../models/Project.js";
import Workspace from "../models/Workspace.js";

const projectRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, "Authentication required"));
      }

      const projectId = req.params.id;

      if (!projectId) {
        return next(new ApiError(400, "Project ID is required"));
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return next(new ApiError(404, "Project not found"));
      }

      const workspace = await Workspace.findOne({
        _id: project.workspace,
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

      req.project = project;
      req.workspace = workspace;
      req.workspaceMember = member;
      req.workspaceRole = member.role;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default projectRole;
