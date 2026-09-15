import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  generateTask as generateTaskService,
  generateTaskDescription as generateTaskDescriptionService,
  summarizeProject as summarizeProjectService,
  meetingNotesToTasks as meetingNotesToTasksService,
  askProjectAssistant as askProjectAssistantService,
} from "../services/ai.service.js";

export const generateTask = asyncHandler(async (req, res) => {
  const result = await generateTaskService(req.body);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Task generated successfully"));
});

export const generateTaskDescription = asyncHandler(async (req, res) => {
  const result = await generateTaskDescriptionService(req.body);

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Task description generated successfully"),
    );
});

export const summarizeProject = asyncHandler(async (req, res) => {
  const result = await summarizeProjectService(req.body);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Project summarized successfully"));
});

export const meetingNotesToTasks = asyncHandler(async (req, res) => {
  const result = await meetingNotesToTasksService(req.body);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Tasks generated from meeting notes successfully",
      ),
    );
});

export const askProjectAssistant = asyncHandler(async (req, res) => {
  const result = await askProjectAssistantService(req.body);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "AI assistant response generated successfully",
      ),
    );
});
