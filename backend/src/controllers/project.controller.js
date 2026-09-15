import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createProject as createProjectService,
  getProjects as getProjectsService,
  getProjectById,
  updateProject as updateProjectService,
  deleteProject as deleteProjectService,
} from "../services/project.service.js";

export const createProject = asyncHandler(async (req, res) => {
  const project = await createProjectService({
    ...req.body,
    createdBy: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

export const getProjects = asyncHandler(async (req, res) => {
  const result = await getProjectsService({
    ...req.query,
    userId: req.user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, "Projects fetched successfully"));
});
export const getProject = asyncHandler(async (req, res) => {
  const project = await getProjectById(req.params.id, req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await updateProjectService(
    req.params.id,
    req.body,
    req.user._id,
  );

  res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

export const deleteProject = asyncHandler(async (req, res) => {
  await deleteProjectService(req.params.id, req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Project deleted successfully"));
});
