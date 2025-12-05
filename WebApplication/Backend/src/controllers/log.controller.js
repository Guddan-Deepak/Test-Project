import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Log } from "../models/Log.model.js";
import { v4 as uuidv4 } from "uuid";

// const createLog = asyncHandler(async (req, res) => {
//     const logData = req.body;

//     if (!logData) {
//         throw new ApiError(400, "Log data is required");
//     }

//     const log = await Log.create(logData);

//     return res.status(201).json(
//         new ApiResponse(201, log, "Log created successfully")
//     )
// })

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
        category: logData.category || "REQUEST",
        eventType: logData.eventType || "MANUAL_LOG",
        severity: logData.severity || "LOW",
        classification: logData.classification || "INFO",
        attackVector: logData.attackVector || "NONE"
    };

    const log = await Log.create(enrichedLogData);

    return res.status(201).json(
        new ApiResponse(201, log, "Log created successfully")
    )
})

const getLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, severity, classification } = req.query;
    const query = {};

    if (severity) {
        query.severity = severity;
    }
    if (classification) {
        query.classification = classification;
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { timestamp: -1 }
    };

    // Since we are not using mongoose-aggregate-paginate-v2 yet, we'll do simple find with limit/skip
    // Or we can just use simple find for now.
    // Let's implement simple pagination manually.

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

export { createLog, getLogs }
