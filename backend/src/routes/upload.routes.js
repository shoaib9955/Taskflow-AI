import express from "express";

import protect from "../middleware/auth.middleware.js";

import {
  uploadSingle,
  uploadMultiple,
} from "../middleware/upload.middleware.js";

import {
  uploadFile,
  uploadMultipleFiles,
  deleteUploadedFile,
} from "../controllers/upload.controller.js";

const router = express.Router();

router.use(protect);

router.post("/single", uploadSingle("file"), uploadFile);

router.post("/multiple", uploadMultiple("files", 5), uploadMultipleFiles);
router.delete("/single", deleteUploadedFile);

export default router;
