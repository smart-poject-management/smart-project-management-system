import express from 'express';
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';
import {
    createDepartment,
    createExpertise,
    deleteDepartment,
    deleteExpertise,
    editDepartment,
    editExpertise,
    getDepartments,
    getExpertiseByDepartment
} from '../controllers/departmentController.js';

const router = express.Router();

router.get(
    '/',
    isAuthenticated,
    getDepartments
);

router.get(
    '/:departmentId/expertise',
    isAuthenticated,
    getExpertiseByDepartment
);

router.post(
    '/create',
    isAuthenticated,
    isAuthorized("Admin"),
    createDepartment
);

router.delete(
    '/delete/:id',
    isAuthenticated,
    isAuthorized("Admin"),
    deleteDepartment
);

router.post(
    '/:departmentId/expertise/create',
    isAuthenticated,
    isAuthorized("Admin"),
    createExpertise
);

router.delete(
    '/:departmentId/expertise/delete/:expertiseId',
    isAuthenticated,
    isAuthorized("Admin"),
    deleteExpertise
);

router.put(
    '/update/:departmentId',
    isAuthenticated,
    isAuthorized("Admin"),
    editDepartment
);

router.put(
    '/:departmentId/expertise/update/:expertiseId',
    isAuthenticated,
    isAuthorized("Admin"),
    editExpertise
);

export default router;