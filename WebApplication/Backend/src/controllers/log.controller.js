import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Log from "../models/Log.model.js";
import { v4 as uuidv4 } from "uuid";
import { processLog, analyzeLog } from "../utils/threatEngine.js";
import Incident from "../models/Incident.model.js";

const createLog = asyncHandler(async (req, res) => {
    const logData = req.body;

    if (!logData) {
        throw new ApiError(400, "Log data is required");
    }

    // Auto-generate required fields if missing
    const enrichedLogData = {
        ...logData,
        logId: logData.logId || uuidv4(),
        timestamp: logData.timestamp || new Date(),
        // Ensure other required fields have defaults or are checked
        sourceIP: logData.sourceIP || req.ip || "UNKNOWN",
        sourceType: logData.sourceType || "APP",
        targetSystem: logData.targetSystem || "Mini-SOC-Backend",
        endpoint: logData.endpoint || "UNKNOWN",
        statusCode: logData.statusCode || 0,
        category: logData.category || "REQUEST",
        eventType: logData.eventType || "MANUAL_LOG",
        severity: logData.severity || "LOW",
        classification: logData.classification || "INFO",
        attackVector: logData.attackVector || "NONE",
        details: logData.details || { tags: [] }
    };

    // 1. Analyze the log (e.g. check for Brute Force patterns)
    analyzeLog(enrichedLogData);

    const log = await Log.create(enrichedLogData);

    // 2. If it's a Security log, feed it into the Threat Engine to potentially create an Incident
    if (enrichedLogData.category === "SECURITY") {
        processLog(log);
    }

    return res.status(201).json(
        new ApiResponse(201, log, "Log created and processed successfully")
    )
})



const getLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, severity, classification, attackVector, category, sourceIP, endpoint, startTime, endTime } = req.query;
    const query = {};

    if (severity) query.severity = severity;
    if (classification) query.classification = classification;
    if (attackVector) query.attackVector = attackVector;
    if (category) query.category = category;

    // Partial matches
    if (sourceIP) query.sourceIP = { $regex: sourceIP, $options: "i" };
    if (endpoint) query.endpoint = { $regex: endpoint, $options: "i" };

    // Date Range
    if (startTime || endTime) {
        query.timestamp = {};
        if (startTime) query.timestamp.$gte = new Date(startTime);
        if (endTime) query.timestamp.$lte = new Date(endTime);
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { timestamp: -1 }
    };

    const skip = (options.page - 1) * options.limit;

    const logs = await Log.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(options.limit);

    const totalLogs = await Log.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, { logs, totalLogs, page: options.page, totalPages: Math.ceil(totalLogs / options.limit) }, "Logs fetched successfully")
    )
})



const getLogStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const stats = await Log.aggregate([
        { $match: { timestamp: { $gte: today } } },
        {
            $group: {
                _id: null,
                totalLogs: { $sum: 1 },
                securityLogs: {
                    $sum: { $cond: [{ $eq: ["$category", "SECURITY"] }, 1, 0] }
                }
            }
        }
    ]);

    // Severity Distribution
    const severityStats = await Log.aggregate([
        { $match: { timestamp: { $gte: today } } },
        { $group: { _id: "$severity", count: { $sum: 1 } } }
    ]);

    // Attack Vectors
    const attackVectorStats = await Log.aggregate([
        { $match: { category: "SECURITY", timestamp: { $gte: today } } },
        { $group: { _id: "$attackVector", count: { $sum: 1 } } }
    ]);

    // 24h Timeline
    const timelineStats = await Log.aggregate([
        { $match: { timestamp: { $gte: yesterday } } },
        {
            $group: {
                _id: { $hour: "$timestamp" },
                count: { $sum: 1 },
                securityCount: {
                    $sum: { $cond: [{ $eq: ["$category", "SECURITY"] }, 1, 0] }
                }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    // Top Attacking IPs
    const topIPs = await Log.aggregate([
        { $match: { category: "SECURITY" } },
        { $group: { _id: "$sourceIP", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    // Active Incidents
    const activeIncidents = await Incident.countDocuments({ status: { $ne: 'CLOSED' } });
    // High/Critical Incidents
    const highCriticalIncidents = await Incident.countDocuments({ severity: { $in: ['HIGH', 'CRITICAL'] }, status: { $ne: 'CLOSED' } });

    // Top Target Endpoints (24h)
    const topEndpoints = await Log.aggregate([
        { $match: { timestamp: { $gte: yesterday } } },
        { $group: { _id: "$endpoint", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    // Traffic Status Distribution (24h)
    const statusDist = await Log.aggregate([
        { $match: { timestamp: { $gte: yesterday } } },
        { $group: { _id: "$statusCode", count: { $sum: 1 } } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            summary: stats[0] || { totalLogs: 0, securityLogs: 0 },
            severityDistribution: severityStats,
            attackVectors: attackVectorStats,
            timeline: timelineStats,
            topIPs: topIPs,
            topEndpoints: topEndpoints,
            statusDist: statusDist,
            incidentSummary: {
                active: activeIncidents,
                critical: highCriticalIncidents
            }
        }, "Log stats fetched successfully")
    )
})

export { createLog, getLogs, getLogStats }
