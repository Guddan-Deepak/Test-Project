import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Incident from "../models/Incident.model.js";
import IncidentAssignmentRequest from "../models/IncidentAssignmentRequest.model.js";

const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "FALSE_POSITIVE", "ASSIGNED"];
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
            query.assignedTo = req.user._id;
            query.status = "ASSIGNED";
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
            // Assuming assignedTo query param is an ID if specific
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
        .populate("assignedTo", "name email") // Populate Analyst details
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

    // Check if assigned and if assigned to someone else
    if (incident.assignedTo && incident.assignedTo.toString() !== user._id.toString()) {
        throw new ApiError(403, "Incident is already assigned to another analyst. Only admins can reassign.");
    }

    incident.assignedTo = user._id;
    incident.status = "ASSIGNED";
    await incident.save();

    // Populate for response
    await incident.populate("assignedTo", "name email");

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

    if (incident.assignedTo && incident.assignedTo.toString() !== user._id.toString()) {
        if (user.role !== 'admin') {
            throw new ApiError(403, "You can only unassign incidents assigned to yourself.");
        }
    }

    incident.assignedTo = null;
    if (["ASSIGNED", "IN_PROGRESS"].includes(incident.status)) {
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
        const newStatus = status.toUpperCase();

        // Role-based Status Restrictions
        if (req.user.role !== 'admin') {
            // Analysts can only move to IN_PROGRESS (Submit for review)
            if (["RESOLVED", "FALSE_POSITIVE"].includes(newStatus)) {
                throw new ApiError(403, "Only admins can close incidents (Resolve or False Positive)");
            }
        }
        updateFields.status = newStatus;
    }

    if (assignedTo) {
        // If reassigning, ensure permissions
        if (incident.assignedTo && incident.assignedTo.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            // If trying to assign to self while validly open, it's fine. 
            // But if assignedTo is set, check match.
            // If incident.assignedTo exists AND it's not me AND I'm not admin -> Block
            if (incident.assignedTo.toString() !== assignedTo) {
                throw new ApiError(403, "Cannot reassign incident assigned to another analyst");
            }
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
        .populate('relatedLogs')
        .populate('assignedTo', 'name email');

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