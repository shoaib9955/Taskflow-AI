import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  getActivities as getActivitiesService,
  getActivityById as getActivityByIdService,
} from "../services/activity.service.js";

export const getActivities = asyncHandler(async (req, res) => {
  const result = await getActivitiesService({
    ...req.query,
    userId: req.user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, "Activities fetched successfully"));
});
export const getActivityById = asyncHandler(async (req, res) => {
  const activity = await getActivityByIdService(req.params.id, req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, activity, "Activity fetched successfully"));
});
