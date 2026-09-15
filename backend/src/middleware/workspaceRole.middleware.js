import ApiError from "../utils/ApiError.js";
import Workspace from "../models/Workspace.js";

const workspaceRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, "Authentication required"));
      }

      const workspaceId = req.params.id;

      if (!workspaceId) {
        return next(new ApiError(400, "Workspace ID is required"));
      }

      const workspace = await Workspace.findOne({
        _id: workspaceId,
        "members.user": req.user._id,
        isActive: true,
      });

      if (!workspace) {
        return next(
          new ApiError(404, "Workspace not found or you are not a member"),
        );
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

      req.workspace = workspace;
      req.workspaceMember = member;
      req.workspaceRole = member.role;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default workspaceRole;
