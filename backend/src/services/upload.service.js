import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (file, folder = "taskflow-ai") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image",
) => {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });

  return result;
};
