import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import { createNotification } from "../services/notification.service.js";
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
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  const member = workspace.members.find(
    (item) => item.user.toString() === req.user._id.toString(),
  );

  if (!member || !["owner", "admin"].includes(member.role)) {
    throw new ApiError(
      403,
      "You do not have permission to update this workspace",
    );
  }

  Object.assign(workspace, req.body);

  await workspace.save();

  res
    .status(200)
    .json(new ApiResponse(200, workspace, "Workspace updated successfully"));
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findOne({
    _id: req.params.id,
    owner: req.user._id,
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
  const { userId, role } = req.body;

  const workspace = await Workspace.findById(id);

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  const currentMember = workspace.members.find(
    (member) => member.user.toString() === req.user._id.toString(),
  );

  if (!currentMember) {
    throw new ApiError(403, "You are not a member of this workspace");
  }

  if (!["owner", "admin"].includes(currentMember.role)) {
    throw new ApiError(403, "You do not have permission to add members");
  }

  const existingMember = workspace.members.find(
    (member) => member.user.toString() === userId.toString(),
  );

  if (existingMember) {
    throw new ApiError(409, "User is already a member of this workspace");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  workspace.members.push({
    user: userId,
    role: role || "member",
  });

  await workspace.save();
  await createNotification({
    recipient: userId,
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
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  const currentMember = workspace.members.find(
    (member) => member.user.toString() === req.user._id.toString(),
  );

  if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
    throw new ApiError(
      403,
      "You do not have permission to update member roles",
    );
  }

  const member = workspace.members.find(
    (item) => item.user.toString() === req.params.userId,
  );

  if (!member) {
    throw new ApiError(404, "Workspace member not found");
  }

  if (member.role === "owner") {
    throw new ApiError(400, "Owner role cannot be changed");
  }

  member.role = req.body.role;

  await workspace.save();

  res
    .status(200)
    .json(new ApiResponse(200, workspace, "Member role updated successfully"));
});

export const removeMember = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  const currentMember = workspace.members.find(
    (member) => member.user.toString() === req.user._id.toString(),
  );

  if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
    throw new ApiError(403, "You do not have permission to remove members");
  }

  const member = workspace.members.find(
    (item) => item.user.toString() === req.params.userId,
  );

  if (!member) {
    throw new ApiError(404, "Workspace member not found");
  }

  if (member.role === "owner") {
    throw new ApiError(400, "Workspace owner cannot be removed");
  }

  workspace.members = workspace.members.filter(
    (item) => item.user.toString() !== req.params.userId,
  );

  await workspace.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Member removed successfully"));
});
