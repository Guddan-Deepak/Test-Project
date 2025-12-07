import { Router } from "express";
import { createLog, getLogs, getLogStats } from "../controllers/log.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Allow public log creation (e.g., for attacker module without auth)
router.post("/", createLog);

// Protect fetching routes
// router.use(verifyJWT);
// router.get("/", authorizeRoles("admin", "analyst"), getLogs);
// router.get("/stats", authorizeRoles("admin", "analyst"), getLogStats);

router.get("/", getLogs);
router.get("/stats", getLogStats);

export default router;
