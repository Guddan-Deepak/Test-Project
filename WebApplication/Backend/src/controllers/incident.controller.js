import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Incident } from "../models/Incident.model.js";
import { blockIP, unblockIP, getBlockedIPs } from '../services/containment.service.js';
// Utility for checking valid severity/status enums (optional, but good practice)
const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED_TRUE_POSITIVE", "CLOSED_FALSE_POSITIVE"];
const VALID_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

/**
 * Endpoint to get a list of all incidents with pagination and filtering.
 * (SOC Analyst Dashboard View)
 */
const getIncidents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, severity, attackerIP } = req.query;
    const query = {};

    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
        query.status = status.toUpperCase();
    }
    if (severity && VALID_SEVERITIES.includes(severity.toUpperCase())) {
        query.severity = severity.toUpperCase();
    }
    if (attackerIP) {
        query.attackerIP = attackerIP;
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { timeOfLastEvent: -1 } // Sort by most recent activity
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


/**
 * Endpoint to handle Incident Triage (updating status, assignment, and notes).
 */
// const triageIncident = asyncHandler(async (req, res) => {
//     const { incidentId } = req.params;
//     const { status, assignedTo, analystNotes, newSeverity } = req.body;

//     if (!incidentId) {
//         throw new ApiError(400, "Incident ID is required for triage");
//     }

//     const updateFields = {};

//     // 1. Status Update (Triage Action)
//     if (status && VALID_STATUSES.includes(status.toUpperCase())) {
//         updateFields.status = status.toUpperCase();
//         // Automatically set assignment if status moves from OPEN
//         if (updateFields.status === "IN_PROGRESS" && !assignedTo) {
//              throw new ApiError(400, "Assignee is required when setting status to IN_PROGRESS");
//         }
//     }

//     // 2. Assignment Update
//     if (assignedTo) {
//         updateFields.assignedTo = assignedTo;
//     }

//     // 3. Notes Update (Phase 9: Investigation Record)
//     if (analystNotes) {
//         updateFields.analystNotes = analystNotes;
//     }

//     // 4. Severity Update (Analyst Prioritization)
//     if (newSeverity && VALID_SEVERITIES.includes(newSeverity.toUpperCase())) {
//         updateFields.severity = newSeverity.toUpperCase();
//     }

//     if (Object.keys(updateFields).length === 0) {
//         throw new ApiError(400, "No valid update fields provided");
//     }

//     const incident = await Incident.findOneAndUpdate(
//         { incidentId: incidentId },
//         { $set: updateFields },
//         { new: true } // Return the updated document
//     );

//     if (!incident) {
//         throw new ApiError(404, "Incident not found");
//     }

//     return res.status(200).json(
//         new ApiResponse(200, incident, `Incident ${incidentId} triaged successfully. Status: ${incident.status}`)
//     );
// });


const triageIncident = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;
    const { status, assignedTo, analystNotes, newSeverity } = req.body;

    if (!incidentId) {
        throw new ApiError(400, "Incident ID is required for triage");
    }

    // 1. PHASE 9 SETUP: Fetch the existing incident FIRST 
    // This is required to get the attackerIP and current severity before updating.
    let incident = await Incident.findOne({ incidentId: incidentId });
    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    const updateFields = {};
    let containmentAction = null;
    const currentStatus = incident.status; // Track the original status

    // 2. Status Update (Triage Action)
    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
        const newStatus = status.toUpperCase();

        // Validation: Assignee required when moving to IN_PROGRESS
        if (newStatus === "IN_PROGRESS" && !incident.assignedTo && !assignedTo) {
            throw new ApiError(400, "Assignee is required when setting status to IN_PROGRESS");
        }

        // Trigger Containment Logic when status changes to a final state
        if (newStatus !== currentStatus) {
            if (newStatus === "CLOSED_TRUE_POSITIVE" && (incident.severity === "HIGH" || incident.severity === "CRITICAL")) {
                // TRUE POSITIVE of High/Critical severity requires containment
                containmentAction = 'BLOCK';
            }
            // If the analyst closes it as a FALSE POSITIVE, ensure the IP is removed from any manual blocks
            if (newStatus === "CLOSED_FALSE_POSITIVE") {
                containmentAction = 'UNBLOCK';
            }
        }
        updateFields.status = newStatus;
    }

    // 3. Other Updates (Assignment, Notes, Severity)
    if (assignedTo) {
        updateFields.assignedTo = assignedTo;
    }
    if (analystNotes) {
        // Use $set for overwrite or potentially $push/$addToSet for audit trail
        updateFields.analystNotes = analystNotes;
    }
    if (newSeverity && VALID_SEVERITIES.includes(newSeverity.toUpperCase())) {
        updateFields.severity = newSeverity.toUpperCase();
    }

    if (Object.keys(updateFields).length === 0 && !containmentAction) {
        throw new ApiError(400, "No valid update fields or actions provided");
    }

    // 4. Perform DB Update
    const updatedIncident = await Incident.findOneAndUpdate(
        { incidentId: incidentId },
        { $set: updateFields },
        { new: true } // Return the updated document
    );

    // 5. PHASE 10: Perform Containment Action (ASYNC REDIS CALLS)
    if (containmentAction === 'BLOCK') {
        // Block the attacker's IP found in the original incident object
        await blockIP(incident.attackerIP);
    } else if (containmentAction === 'UNBLOCK') {
        await unblockIP(incident.attackerIP);
    }

    const actionMessage = containmentAction ? `Containment action: ${containmentAction}.` : 'No containment action taken.';

    return res.status(200).json(
        new ApiResponse(200, updatedIncident, `Incident ${incidentId} triaged successfully. Status: ${updatedIncident.status}. ${actionMessage}`)
    );
});

/**
 * Endpoint to get the full details of a single incident, including all related logs.
 * (Phase 9: Investigation View)
 */
const getIncidentDetails = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;

    if (!incidentId) {
        throw new ApiError(400, "Incident ID is required");
    }

    const incident = await Incident.findOne({ incidentId })
        .populate('relatedLogIds'); // Joins the related Log documents

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    return res.status(200).json(
        new ApiResponse(200, incident, `Details for incident ${incidentId} fetched successfully`)
    );
});





const getContainmentBlocklist = asyncHandler(async (req, res) => {
    const blockedIPs = await getBlockedIPs();

    return res.status(200).json(
        new ApiResponse(200, { blockedIPs, count: blockedIPs.length }, "Containment blocklist fetched successfully")
    );
});




export { getIncidents, triageIncident, getIncidentDetails };