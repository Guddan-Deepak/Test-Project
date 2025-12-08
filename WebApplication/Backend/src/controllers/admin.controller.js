import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Incident from "../models/Incident.model.js";
import Log from "../models/Log.model.js";
import Blocklist from "../models/Blocklist.model.js";
import mongoose from "mongoose";


const getSystemHealth = asyncHandler(async (req, res) => {

    const dbStatus = mongoose.connection.readyState === 1 ? "UP" : "DOWN";


    const [
        activeIncidents,
        criticalIncidents,
        totalLogs24h,
        totalBlocks,
        recentLogs1h
    ] = await Promise.all([
        Incident.countDocuments({ status: { $in: ["OPEN", "IN_PROGRESS"] } }),
        Incident.countDocuments({ severity: "CRITICAL", status: { $in: ["OPEN", "IN_PROGRESS"] } }),
        Log.countDocuments({ timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
        Blocklist.countDocuments({ isActive: true }),
        Log.countDocuments({ timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } })
    ]);

    const topAttackers = await Log.aggregate([
        {
            $match: {
                category: "SECURITY",
                timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
        },
        { $group: { _id: "$sourceIP", count: { $sum: 1 }, country: { $first: "$geo.country" } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    const healthData = {
        system: {
            database: dbStatus,
            api: "UP",
            socket: "UNKNOWN"
        },
        metrics: {
            activeIncidents,
            criticalIncidents,
            blockedIPs: totalBlocks,
            logsLastHour: recentLogs1h,
            logsLast24h: totalLogs24h,
            mttr: "45m"
        },
        topAttackers
    };

    return res.status(200).json(
        new ApiResponse(200, healthData, "System health data fetched successfully")
    );
});

export { getSystemHealth, getAssignmentRequests, handleAssignmentRequest, getAllIncidents, updateIncident, autoResolveIncident };

import IncidentAssignmentRequest from "../models/IncidentAssignmentRequest.model.js";
import ApiError from "../utils/ApiError.js";

const getAssignmentRequests = asyncHandler(async (req, res) => {
    const requests = await IncidentAssignmentRequest.find({ status: "PENDING" })
        .populate("incident", "incidentId type severity sourceIp status")
        .populate("requestedBy", "name email")
        .sort({ createdAt: 1 });

    return res.status(200).json(
        new ApiResponse(200, requests, "Assignment requests fetched successfully")
    );
});

const handleAssignmentRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { action } = req.body; // "APPROVE" or "REJECT"

    if (!["APPROVE", "REJECT"].includes(action)) {
        throw new ApiError(400, "Invalid action. Use APPROVE or REJECT");
    }

    const request = await IncidentAssignmentRequest.findById(requestId).populate("incident");
    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    if (request.status !== "PENDING") {
        throw new ApiError(400, "Request is already processed");
    }

    if (action === "REJECT") {
        request.status = "REJECTED";
        request.actedBy = req.user._id;
        request.actedAt = new Date();
        await request.save();

        return res.status(200).json(new ApiResponse(200, null, "Request rejected"));
    }

    // APPROVE
    const incident = await Incident.findById(request.incident._id);
    if (!incident) throw new ApiError(404, "Incident associated with request not found");

    if (incident.assignedTo) {
        throw new ApiError(400, "Incident is already assigned to someone else");
    }

    // 1. Assign Incident
    // request.requestedBy is populated, so we access email
    incident.assignedTo = request.requestedBy._id;
    incident.status = "ASSIGNED";
    await incident.save();

    // 2. Delete the Approved Request
    await IncidentAssignmentRequest.findByIdAndDelete(request._id);

    // 3. Reject other pending requests for same incident
    await IncidentAssignmentRequest.updateMany(
        { incident: incident._id, status: "PENDING" },
        { status: "REJECTED", actedBy: req.user._id, actedAt: new Date() }
    );

    return res.status(200).json(new ApiResponse(200, null, "Request approved and incident assigned"));
});


const getAllIncidents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) {
        query.status = status;
    }

    // Custom sort: Critical > High > Medium > Low, then LastSeenAt desc
    // Since severity is string enum, we can't just sort by it directly if we want a specific order unless we use aggregate or multiple queries.
    // For simplicity and standard mongoose features, we'll try to use a simple sort if possible, or aggregation.
    // However, the enum strings "CRITICAL", "HIGH", "MEDIUM", "LOW" don't sort alphabetically to importance.
    // Let's use aggregation for precise sorting.

    const severityWeight = {
        "CRITICAL": 4,
        "HIGH": 3,
        "MEDIUM": 2,
        "LOW": 1
    };

    const incidents = await Incident.aggregate([
        { $match: query },
        {
            $addFields: {
                severityOrder: {
                    $switch: {
                        branches: [
                            { case: { $eq: ["$severity", "CRITICAL"] }, then: 4 },
                            { case: { $eq: ["$severity", "HIGH"] }, then: 3 },
                            { case: { $eq: ["$severity", "MEDIUM"] }, then: 2 },
                            { case: { $eq: ["$severity", "LOW"] }, then: 1 }
                        ],
                        default: 0
                    }
                }
            }
        },
        { $sort: { severityOrder: -1, lastSeenAt: -1 } },
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) },
        {
            $lookup: {
                from: "analysts", // collection name for Analyst model
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [{ $project: { name: 1, email: 1 } }]
            }
        },
        { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } }
    ]);

    const total = await Incident.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, { incidents, total, page, limit }, "Incidents fetched successfully")
    );
});

const updateIncident = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;
    const { status, severity, assignedTo, blockIp, analystNotes } = req.body;

    const incident = await Incident.findById(incidentId);

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    if (status) incident.status = status;
    if (severity) incident.severity = severity;
    if (assignedTo) incident.assignedTo = assignedTo; // Assuming assignedTo is ObjectId of Analyst
    if (analystNotes !== undefined) incident.analystNotes = analystNotes;

    // Handle Manual Block IP Option
    if (blockIp && incident.sourceIp) {
        // Calculate expiry based on current severity (or updated severity if provided) or default to policy
        const currentSeverity = severity || incident.severity;
        let expiryDate = null;
        const now = new Date();

        switch (currentSeverity) {
            case "MEDIUM":
                expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                break;
            case "HIGH":
                expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
            case "CRITICAL":
                expiryDate = null; // Permanent
                break;
            default:
                // Low/Unknown - maybe 1 hour or 24h default? Let's do 24h to be safe for a manual block.
                expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                break;
        }

        await Blocklist.findOneAndUpdate(
            { ip: incident.sourceIp },
            {
                ip: incident.sourceIp,
                reason: `Manual block via Incident Management: ${incident.type}`,
                source: "MANUAL",
                expiresAt: expiryDate,
                isActive: true,
                createdBy: req.user.username || "ADMIN"
            },
            { upsert: true, new: true }
        );

        incident.analystNotes = (incident.analystNotes || "") + `\n[${req.user.username || "Admin"}]: Manually blocked IP.`;
    }

    await incident.save();

    return res.status(200).json(
        new ApiResponse(200, incident, "Incident updated successfully")
    );
});

const autoResolveIncident = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;

    const incident = await Incident.findById(incidentId);
    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    if (incident.status === "RESOLVED") {
        throw new ApiError(400, "Incident is already resolved");
    }

    let expiryDate = null;
    let shouldBlock = true;

    // Determine expiry based on severity
    const now = new Date();
    switch (incident.severity) {
        case "MEDIUM":
            // 24 hours
            expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            break;
        case "HIGH":
            // 1 week
            expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
        case "CRITICAL":
            // Permanent (null)
            expiryDate = null;
            break;
        default:
            // For LOW or others, maybe we don't block IP automatically or just resolve?
            // Requirement says "block the ip of the medium, high and critical inciidents"
            shouldBlock = false;
            break;
    }

    if (shouldBlock && incident.sourceIp) {
        // Check if already blocked
        const existingBlock = await Blocklist.findOne({ ip: incident.sourceIp });

        if (existingBlock) {
            // Update existing block if the new one is more restrictive (e.g. permanent vs temporary)
            // or just update it to restart the timer?
            // Let's standard update it to the new rule if it's active.
            existingBlock.expiresAt = expiryDate;
            existingBlock.reason = `Auto-resolve: ${incident.type} (Severity: ${incident.severity})`;
            existingBlock.isActive = true;
            existingBlock.source = "RULE_ENGINE"; // or AUTOMATED
            existingBlock.createdBy = "SYSTEM";
            await existingBlock.save();
        } else {
            await Blocklist.create({
                ip: incident.sourceIp,
                reason: `Auto-resolve: ${incident.type} (Severity: ${incident.severity})`,
                source: "AUTOMATED",
                expiresAt: expiryDate,
                isActive: true,
                createdBy: "SYSTEM"
            });
        }
    }

    incident.status = "RESOLVED";
    incident.analystNotes = (incident.analystNotes || "") + "\n[System]: Auto-resolved with IP block action.";
    await incident.save();

    return res.status(200).json(
        new ApiResponse(200, incident, "Incident auto-resolved successfully")
    );
});
