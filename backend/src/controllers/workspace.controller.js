import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import Workspace from "../models/Workspace.js";
import User from "../models/User.js";

import { createNotification } from "../services/notification.service.js";

const WORKSPACE_ROLES = ["owner", "admin", "manager", "member"];

const isWorkspaceManager = (role) => {
  return ["owner", "admin"].includes(role);
};

const isValidWorkspaceRole = (role) => {
  return WORKSPACE_ROLES.includes(role);
};

export const createWorkspace = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const workspace = await Workspace.create({
    name,
    description,
    owner: req.user._id,

    members: [
      {
        user: req.user._id,
        role: "owner",
      },
    ],
  });

  res
    .status(201)
    .json(new ApiResponse(201, workspace, "Workspace created successfully"));
});

export const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({
    "members.user": req.user._id,
    isActive: true,
  })
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, workspaces, "Workspaces fetched successfully"));
});

export const getWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findOne({
    _id: req.params.id,
    "members.user": req.user._id,
    isActive: true,
  })
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar");

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, workspace, "Workspace fetched successfully"));
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findOne({
    _id: req.params.id,
    "members.user": req.user._id,
    isActive: true,
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  const member = workspace.members.find(
    (item) => item.user.toString() === req.user._id.toString(),
  );

  if (!member || !isWorkspaceManager(member.role)) {
    throw new ApiError(
      403,
      "You do not have permission to update this workspace",
    );
  }

  const allowedUpdates = ["name", "description"];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      workspace[field] = req.body[field];
    }
  });

  await workspace.save();

  res
    .status(200)
    .json(new ApiResponse(200, workspace, "Workspace updated successfully"));
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findOne({
    _id: req.params.id,
    owner: req.user._id,
    isActive: true,
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found or you are not the owner");
  }

  workspace.isActive = false;

  await workspace.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Workspace deleted successfully"));
});

export const addMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;

  if (!email) {
    throw new ApiError(400, "User email is required");
  }

  const memberRole = role || "member";

  if (!isValidWorkspaceRole(memberRole)) {
    throw new ApiError(400, "Invalid workspace role");
  }

  if (memberRole === "owner") {
    throw new ApiError(400, "A workspace can only have one owner");
  }

  const workspace = await Workspace.findById(id);

  if (!workspace || !workspace.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const currentMember = workspace.members.find(
    (member) => member.user.toString() === req.user._id.toString(),
  );

  if (!currentMember) {
    throw new ApiError(403, "You are not a member of this workspace");
  }

  if (!isWorkspaceManager(currentMember.role)) {
    throw new ApiError(403, "You do not have permission to add members");
  }

  if (memberRole === "admin" && currentMember.role !== "owner") {
    throw new ApiError(
      403,
      "Only the workspace owner can assign the admin role",
    );
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!user) {
    throw new ApiError(404, "No user found with this email");
  }

  const existingMember = workspace.members.find(
    (member) => member.user.toString() === user._id.toString(),
  );

  if (existingMember) {
    throw new ApiError(409, "User is already a member of this workspace");
  }

  workspace.members.push({
    user: user._id,
    role: memberRole,
  });

  await workspace.save();

  await createNotification({
    recipient: user._id,
    sender: req.user._id,
    type: "workspace-invitation",
    title: "Added to workspace",
    message: `You have been added to the workspace "${workspace.name}"`,
    relatedWorkspace: workspace._id,
  });

  await workspace.populate([
    {
      path: "owner",
      select: "name email avatar",
    },
    {
      path: "members.user",
      select: "name email avatar",
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, workspace, "Member added successfully"));
});
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;
  const { role } = req.body;

  if (!isValidWorkspaceRole(role)) {
    throw new ApiError(400, "Invalid workspace role");
  }

  if (role === "owner") {
    throw new ApiError(400, "Owner role cannot be assigned this way");
  }

  const workspace = await Workspace.findById(id);

  if (!workspace || !workspace.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const currentMember = workspace.members.find(
    (member) => member.user.toString() === req.user._id.toString(),
  );

  if (!currentMember || !isWorkspaceManager(currentMember.role)) {
    throw new ApiError(
      403,
      "You do not have permission to update member roles",
    );
  }

  const member = workspace.members.find(
    (item) => item.user.toString() === userId.toString(),
  );

  if (!member) {
    throw new ApiError(404, "Workspace member not found");
  }

  if (member.role === "owner") {
    throw new ApiError(400, "Owner role cannot be changed");
  }

  if (
    (member.role === "admin" || role === "admin") &&
    currentMember.role !== "owner"
  ) {
    throw new ApiError(403, "Only the workspace owner can manage admin roles");
  }

  member.role = role;

  await workspace.save();

  await workspace.populate([
    {
      path: "owner",
      select: "name email avatar",
    },
    {
      path: "members.user",
      select: "name email avatar",
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, workspace, "Member role updated successfully"));
});

export const removeMember = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace || !workspace.isActive) {
    throw new ApiError(404, "Workspace not found");
  }

  const currentMember = workspace.members.find(
    (member) => member.user.toString() === req.user._id.toString(),
  );

  if (!currentMember || !isWorkspaceManager(currentMember.role)) {
    throw new ApiError(403, "You do not have permission to remove members");
  }

  const member = workspace.members.find(
    (item) => item.user.toString() === req.params.userId.toString(),
  );

  if (!member) {
    throw new ApiError(404, "Workspace member not found");
  }

  if (member.role === "owner") {
    throw new ApiError(400, "Workspace owner cannot be removed");
  }

  if (member.role === "admin" && currentMember.role !== "owner") {
    throw new ApiError(403, "Only the workspace owner can remove an admin");
  }

  workspace.members = workspace.members.filter(
    (item) => item.user.toString() !== req.params.userId.toString(),
  );

  await workspace.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Member removed successfully"));
});
