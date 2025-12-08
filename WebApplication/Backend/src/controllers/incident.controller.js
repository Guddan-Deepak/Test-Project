import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Incident from "../models/Incident.model.js";
import IncidentAssignmentRequest from "../models/IncidentAssignmentRequest.model.js";

const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED_TRUE_POSITIVE", "CLOSED_FALSE_POSITIVE"];
const VALID_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

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
        if (assignedTo === 'me') {
            query.assignedTo = req.user.email;
        } else if (assignedTo === 'null' || assignedTo === 'unassigned') {
            query.assignedTo = null;
            query.status = "OPEN";
        } else if (assignedTo === 'pending') {
            const myRequests = await IncidentAssignmentRequest.find({
                requestedBy: req.user._id,
                status: "PENDING"
            }).select('incident');

            const incidentIds = myRequests.map(req => req.incident);
            query._id = { $in: incidentIds };
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
    const user = req.user;

    const incident = await Incident.findOne({ incidentId });

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    if (incident.assignedTo && incident.assignedTo !== user.email) {
        throw new ApiError(403, `Incident is already assigned to ${incident.assignedTo}. Only admins can reassign.`);
    }

    incident.assignedTo = user.email;
    incident.status = "IN_PROGRESS";
    await incident.save();

    return res.status(200).json(
        new ApiResponse(200, incident, `Incident assigned to ${user.email}`)
    );
});

const unassignIncident = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;
    const user = req.user;

    const incident = await Incident.findOne({ incidentId });

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    if (incident.assignedTo !== user.email) {
        if (user.role !== 'admin') {
            throw new ApiError(403, "You can only unassign incidents assigned to yourself.");
        }
    }

    incident.assignedTo = null;
    if (incident.status === "IN_PROGRESS") {
        incident.status = "OPEN";
    }
    await incident.save();

    return res.status(200).json(
        new ApiResponse(200, incident, "Incident unassigned successfully")
    );
});


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

    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
        updateFields.status = status.toUpperCase();
    }

    if (assignedTo) {
        if (incident.assignedTo && incident.assignedTo !== req.user.email && incident.assignedTo !== assignedTo && req.user.role !== 'admin') {
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


const requestAssignment = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;
    const user = req.user;

    const incident = await Incident.findOne({ incidentId });
    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    if (incident.assignedTo) {
        throw new ApiError(400, "Incident is already assigned");
    }

    const existingRequest = await IncidentAssignmentRequest.findOne({
        incident: incident._id,
        requestedBy: user._id,
        status: "PENDING"
    });

    if (existingRequest) {
        throw new ApiError(400, "You already have a pending request for this incident");
    }

    await IncidentAssignmentRequest.create({
        incident: incident._id,
        requestedBy: user._id
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Assignment request submitted successfully")
    );
});

export { getIncidents, triageIncident, getIncidentDetails, assignIncident, unassignIncident, requestAssignment };