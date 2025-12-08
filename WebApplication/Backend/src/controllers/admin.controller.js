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

export { getSystemHealth, getAssignmentRequests, handleAssignmentRequest };

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
    incident.assignedTo = request.requestedBy.email;
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
