import { Router } from "express";
import { getIncidents, getIncidentDetails, triageIncident, assignIncident, unassignIncident, requestAssignment } from "../controllers/incident.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply auth to all incident routes

// Dashboard - List Incidents
router.route("/").get(getIncidents);

// Assignment Actions
router.route("/:incidentId/assign").post(authorizeRoles("analyst", "admin"), assignIncident);
router.route("/:incidentId/unassign").post(authorizeRoles("analyst", "admin"), unassignIncident);
router.route("/:incidentId/request-assignment").post(authorizeRoles("analyst"), requestAssignment);

// Incident Details & Triage
router.route("/:incidentId")
    .get(getIncidentDetails)
    .patch(authorizeRoles("analyst", "admin"), triageIncident);

export default router;
