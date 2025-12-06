import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Incident } from "../models/Incident.model.js";

// Utility for checking valid severity/status enums
const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED_TRUE_POSITIVE", "CLOSED_FALSE_POSITIVE"];
const VALID_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

/**
 * Endpoint to get a list of all incidents with pagination and filtering.
 */
const getIncidents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, severity, attackerIP, assignedTo } = req.query;
    const query = {};

    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
        query.status = status.toUpperCase();
    }
    if (severity && VALID_SEVERITIES.includes(severity.toUpperCase())) {
        query.severity = severity.toUpperCase();
    }
    if (attackerIP) {
        query.sourceIp = attackerIP;
    }
    if (assignedTo) {
        // If assignedTo is 'me', user current user's username or id
        if (assignedTo === 'me') {
            query.assignedTo = req.user.username; // Storing username in assignedTo based on previous schema
        } else {
            query.assignedTo = assignedTo;
        }
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { lastSeenAt: -1 }
    };

    const skip = (options.page - 1) * options.limit;

    const incidents = await Incident.find(query)
        .sort(options.sort)
        .skip(skip)
        .limit(options.limit);

    const totalIncidents = await Incident.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                incidents,
                totalIncidents,
                page: options.page,
                totalPages: Math.ceil(totalIncidents / options.limit)
            },
            "Incidents fetched successfully"
        )
    );
});

const assignIncident = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;
    const user = req.user; // From auth middleware

    const incident = await Incident.findOne({ incidentId });

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    // Check if already assigned
    if (incident.assignedTo && incident.assignedTo !== user.username) {
        throw new ApiError(403, `Incident is already assigned to ${incident.assignedTo}. Only admins can reassign.`);
    }

    incident.assignedTo = user.username;
    incident.status = "IN_PROGRESS"; // Auto-update status
    await incident.save();

    return res.status(200).json(
        new ApiResponse(200, incident, `Incident assigned to ${user.username}`)
    );
});

const unassignIncident = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;
    const user = req.user;

    const incident = await Incident.findOne({ incidentId });

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    // Check if assigned to current user
    if (incident.assignedTo !== user.username) {
        // Allow admin to force unassign (future proofing), but for now restrict
        if (user.role !== 'admin') {
            throw new ApiError(403, "You can only unassign incidents assigned to yourself.");
        }
    }

    incident.assignedTo = null;
    // Optional: Revert status to OPEN if it was IN_PROGRESS? 
    // Usually better to leave status or set to OPEN. Let's set to OPEN for cleanliness.
    if (incident.status === "IN_PROGRESS") {
        incident.status = "OPEN";
    }
    await incident.save();

    return res.status(200).json(
        new ApiResponse(200, incident, "Incident unassigned successfully")
    );
});

/**
 * Endpoint to handle Incident Triage (updating status, assignment, and notes).
 */
const triageIncident = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;
    const { status, assignedTo, analystNotes, newSeverity } = req.body;

    if (!incidentId) {
        throw new ApiError(400, "Incident ID is required for triage");
    }

    let incident = await Incident.findOne({ incidentId: incidentId });
    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    const updateFields = {};
    const currentStatus = incident.status;

    // 2. Status Update
    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
        const newStatus = status.toUpperCase();
        if (newStatus === "IN_PROGRESS" && !incident.assignedTo && !assignedTo) {
            // throw new ApiError(400, "Assignee is required when setting status to IN_PROGRESS");
            // Instead of error, auto-assign to current user if not provided? 
            // Logic kept strict for now as per previous, but client should handle assignment first.
        }
        updateFields.status = newStatus;
    }

    // 3. Other Updates
    // Strict assignment check for triage as well
    if (assignedTo) {
        if (incident.assignedTo && incident.assignedTo !== req.user.username && incident.assignedTo !== assignedTo && req.user.role !== 'admin') {
            throw new ApiError(403, "Cannot reassign incident assigned to another analyst");
        }
        updateFields.assignedTo = assignedTo;
    }

    if (analystNotes) {
        updateFields.analystNotes = analystNotes;
    }
    if (newSeverity && VALID_SEVERITIES.includes(newSeverity.toUpperCase())) {
        updateFields.severity = newSeverity.toUpperCase();
    }

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "No valid update fields or actions provided");
    }

    const updatedIncident = await Incident.findOneAndUpdate(
        { incidentId: incidentId },
        { $set: updateFields },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedIncident, `Incident ${incidentId} triaged successfully.`)
    );
});

const getIncidentDetails = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;

    if (!incidentId) {
        throw new ApiError(400, "Incident ID is required");
    }

    const incident = await Incident.findOne({ incidentId })
        .populate('relatedLogs');

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    return res.status(200).json(
        new ApiResponse(200, incident, `Details for incident ${incidentId} fetched successfully`)
    );
});

export { getIncidents, triageIncident, getIncidentDetails, assignIncident, unassignIncident };