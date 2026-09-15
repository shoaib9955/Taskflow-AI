import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../services/upload.service.js";
import { deleteFromCloudinary } from "../services/upload.service.js";
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: "Please upload a file",
    });
  }

  const result = await uploadToCloudinary(req.file, "taskflow-ai/uploads");

  const file = {
    url: result.secure_url,
    publicId: result.public_id,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  };

  res
    .status(200)
    .json(new ApiResponse(200, file, "File uploaded successfully"));
});
export const uploadMultipleFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: "Please upload at least one file",
    });
  }

  const uploadedFiles = await Promise.all(
    req.files.map((file) => uploadToCloudinary(file, "taskflow-ai/uploads")),
  );

  const files = uploadedFiles.map((result, index) => ({
    url: result.secure_url,
    publicId: result.public_id,
    originalName: req.files[index].originalname,
    mimeType: req.files[index].mimetype,
    size: req.files[index].size,
  }));

  res
    .status(200)
    .json(new ApiResponse(200, files, "Files uploaded successfully"));
});
export const deleteUploadedFile = asyncHandler(async (req, res) => {
  const { publicId } = req.body;

  if (!publicId) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: "Public ID is required",
    });
  }

  const result = await deleteFromCloudinary(publicId);

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "File deleted from Cloudinary successfully"),
    );
});
