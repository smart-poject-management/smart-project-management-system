import express from 'express';
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';
import { getAvailableSupervisors, getStudentProject, submitProposal, uploadFiles } from '../controllers/studentController.js';
import { handleUploadError, upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/project', isAuthenticated, isAuthorized("Student"), getStudentProject); // replace the method post -> get 

router.post('/project-proposal', isAuthenticated, isAuthorized("Student"), submitProposal)

router.post('/upload/:projectId', isAuthenticated, isAuthorized("Student"), upload.array("files", 10), handleUploadError, uploadFiles);

router.get('/fetch-supervisors', isAuthenticated, isAuthorized("Student"), getAvailableSupervisors);


export default router;