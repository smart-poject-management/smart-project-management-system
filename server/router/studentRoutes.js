import express from "express";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";
import {
  deleteProjectFile,
  downloadFile,
  getAvailableSupervisors,
  getDashboardStats,
  getFeedback,
  getStudentProject,
  getSupervisor,
  requestSupervisor,
  requestDeadlineExtension,
  submitProposal,
  uploadFiles,
  getDeadlineExtensionRequest,
} from "../controllers/studentController.js";
import { handleUploadError, upload } from "../middlewares/upload.js";

const router = express.Router();

router.get(
  "/project",
  isAuthenticated,
  isAuthorized("Student"),
  getStudentProject,
);

router.post(
  "/project-proposal",
  isAuthenticated,
  isAuthorized("Student"),
  submitProposal,
);

router.post(
  "/upload/:projectId",
  isAuthenticated,
  isAuthorized("Student"),
  upload.array("files", 10),
  handleUploadError,
  uploadFiles,
);

router.get(
  "/fetch-supervisors",
  isAuthenticated,
  isAuthorized("Student"),
  getAvailableSupervisors,
);

router.get(
  "/supervisor",
  isAuthenticated,
  isAuthorized("Student"),
  getSupervisor,
);

router.post(
  "/request-supervisor",
  isAuthenticated,
  isAuthorized("Student"),
  requestSupervisor,
);

router.post(
  "/deadline-extension-request",
  isAuthenticated,
  isAuthorized("Student"),
  upload.single("proof"),
  handleUploadError,
  requestDeadlineExtension,
);

router.get(
  "/feedback/:projectId",
  isAuthenticated,
  isAuthorized("Student"),
  getFeedback,
);

router.get(
  "/fetch-dashboard-stats",
  isAuthenticated,
  isAuthorized("Student"),
  getDashboardStats,
);

router.get(
  "/download/:projectId/:fileId",
  isAuthenticated,
  isAuthorized("Student"),
  downloadFile,
);

router.delete(
  "/file/:projectId/:fileId",
  isAuthenticated,
  isAuthorized("Student"),
  deleteProjectFile,
);

router.get(
  "/get-deadline-extension-request",
  isAuthenticated,
  isAuthorized("Student"),
  getDeadlineExtensionRequest
);

export default router;
