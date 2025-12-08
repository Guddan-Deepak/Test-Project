// import ruleRouter from "./admin/rules.routes.js"; // Deprecated
import ragChunkRouter from "./admin/ragChunks.routes.js";
import blocklistRouter from "./admin/blocklist.routes.js";
import userRouter from "./admin/users.routes.js";
import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/auth.middleware.js';
import { getAssignmentRequests, getSystemHealth, handleAssignmentRequest } from '../controllers/admin.controller.js';

const router = express.Router();

// Protect all admin routes
router.use(verifyJWT);
router.use(authorizeRoles("admin"));

// Overview
router.route("/health").get(getSystemHealth);
router.route("/assignment-requests").get(getAssignmentRequests);
router.route("/assignment-request/:requestId/handle").post(handleAssignmentRequest);

// Modules
// router.use("/rules", ruleRouter); // Removed
router.use("/knowledge", ragChunkRouter);
router.use("/blocklist", blocklistRouter);
router.use("/users", userRouter);

export default router;

