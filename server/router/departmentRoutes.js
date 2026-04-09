import express from 'express';
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';
import { createDepartment, deleteDepartment, getDepartments } from '../controllers/departmentController.js';

const router = express.Router();

router.get(
    '/',
    isAuthenticated,
    getDepartments
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


export default router;