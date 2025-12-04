// import { asyncHandler } from "../utils/asyncHandler.js";
// import { Log } from "../models/Log.model.js";
// import { v4 as uuidv4 } from 'uuid';

// export const monitorRequest = asyncHandler(async (req, res, next) => {
//     const start = Date.now();
//     const requestId = uuidv4();

//     // Phase 1: Capture Request Details
//     const logData = {
//         logId: requestId,
//         timestamp: new Date(),
//         sourceIP: req.ip || req.connection.remoteAddress,
//         sourceType: "APP",
//         userId: null, // Can be updated if auth middleware runs before
//         targetSystem: "Mini-SOC-Backend",
//         endpoint: req.originalUrl,
//         httpMethod: req.method,
//         category: "REQUEST",
//         eventType: "HTTP_REQUEST",
//         severity: "LOW",
//         classification: "INFO",
//         attackVector: "NONE",
//         details: {
//             message: null,
//             suspiciousFragment: null,
//             username: req.body?.username || null,
//             ports: [],
//             bytesIn: req.get('content-length') ? parseInt(req.get('content-length')) : 0,
//             bytesOut: 0,
//             tags: ["REQUEST_LOG"]
//         }
//     };

//     // Phase 2: SQLi Detection
//     // Simple pattern matching as per scenario
//     const bodyString = JSON.stringify(req.body || {}).toLowerCase();
//     const sqliPatterns = [
//         "' or '1'='1",
//         "union select",
//         "drop table"
//     ];

//     let isAttack = false;
//     let matchedPattern = null;

//     for (const pattern of sqliPatterns) {
//         if (bodyString.includes(pattern)) {
//             isAttack = true;
//             matchedPattern = pattern;
//             break;
//         }
//     }

//     if (isAttack) {
//         logData.category = "SECURITY";
//         logData.eventType = "SQLI_DETECTED";
//         logData.severity = "HIGH";
//         logData.classification = "CONFIRMED_ATTACK";
//         logData.attackVector = "SQLI";
//         logData.details.ruleId = "SQLI-001";
//         logData.details.patternMatched = "SQLI_OR_1_EQ_1"; // Simplified for the scenario
//         logData.details.suspiciousFragment = matchedPattern;
//         logData.details.tags.push("SQLI");
//     }

//     // Phase 3: Capture Response
//     res.on('finish', async () => {
//         const duration = Date.now() - start;
//         logData.statusCode = res.statusCode;
//         logData.details.message = `Request took ${duration}ms`;

//         // Try to estimate bytesOut (not always accurate without intercepting stream)
//         const contentLength = res.get('Content-Length');
//         if (contentLength) {
//             logData.details.bytesOut = parseInt(contentLength);
//         }

//         // Phase 4: Save Log
//         try {
//             // We use create instead of save to just insert it
//             await Log.create(logData);
//         } catch (error) {
//             console.error("Failed to save monitoring log:", error);
//         }
//     });

//     next();
// });

import { asyncHandler } from "../utils/asyncHandler.js";
import { Log } from "../models/Log.model.js";
import { v4 as uuidv4 } from "uuid";

export const monitorRequest = asyncHandler(async (req, res, next) => {
    const start = Date.now();
    const requestId = uuidv4();

    const contentLengthIn = req.get("content-length");
    const bytesIn = contentLengthIn ? parseInt(contentLengthIn, 10) : 0;

    const logData = {
        logId: requestId,
        timestamp: new Date(),
        sourceIP: req.ip || req.connection.remoteAddress,
        sourceType: "APP",
        userId: null, // will be filled in finish if req.user exists
        targetSystem: "Mini-SOC-Backend",
        endpoint: req.originalUrl,
        httpMethod: req.method,
        statusCode: 0, // will set in finish
        category: "REQUEST",
        eventType: "HTTP_REQUEST",
        severity: "LOW",
        classification: "INFO",
        attackVector: "NONE",
        details: {
            message: null,
            suspiciousFragment: null,
            username: req.body?.username || null,
            ports: [],
            bytesIn,
            bytesOut: 0,
            fileName: null,
            command: null,
            ruleId: null,
            patternMatched: null,
            tags: ["REQUEST_LOG"]
        }
    };

    // --- SQLi detection ---
    const bodyString = JSON.stringify(req.body || {}).toLowerCase();
    const sqliPatterns = ["' or '1'='1", "union select", "drop table"];

    let isAttack = false;
    let matchedPattern = null;

    for (const pattern of sqliPatterns) {
        if (bodyString.includes(pattern)) {
            isAttack = true;
            matchedPattern = pattern;
            break;
        }
    }

    if (isAttack) {
        logData.category = "SECURITY";
        logData.eventType = "SQLI_DETECTED";
        logData.severity = "HIGH";
        logData.classification = "CONFIRMED_ATTACK";
        logData.attackVector = "SQLI";
        logData.details.ruleId = "SQLI-001";
        logData.details.patternMatched = "SQLI_OR_1_EQ_1";
        logData.details.suspiciousFragment = matchedPattern;
        logData.details.tags.push("SQLI");
    }

    res.on("finish", async () => {
        const duration = Date.now() - start;

        // If JWT auth ran, we can pick the final userId here
        logData.userId = req.user?.id || null; // or (req.user && req.user.id) || null;

        logData.statusCode = res.statusCode;
        logData.details.message = `Request took ${duration}ms`;

        const contentLengthOut = res.get("Content-Length");
        if (contentLengthOut) {
            logData.details.bytesOut = parseInt(contentLengthOut, 10);
        }

        try {
            await Log.create(logData);
        } catch (error) {
            console.error("Failed to save monitoring log:", error);
        }
    });

    next();
});

