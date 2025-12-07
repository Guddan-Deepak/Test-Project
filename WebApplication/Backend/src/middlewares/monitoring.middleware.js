import asyncHandler from "../utils/asyncHandler.js";
import Log from "../models/Log.model.js";
import { v4 as uuidv4 } from "uuid";

import { processLog, analyzeLog } from "../utils/threatEngine.js";
import { getIO } from "../socket.js";
import geoip from 'geoip-lite';


const BLOCK_MODE = true;

export const monitorRequest = asyncHandler(async (req, res, next) => {
    const start = Date.now();
    const requestId = uuidv4();

    // // SKIP logging for the 'fetch logs' endpoint itself to prevent infinite loop/noise
    if (req.originalUrl.includes('/logs') && req.method === 'GET') {
        return next();
    }

    if (!req.originalUrl.includes('/login') && !req.originalUrl.includes('/register/admin') && !req.originalUrl.includes('/register/analyst') && !req.originalUrl.includes('/auth/verify')) {
        return next();
    }
    // --- Phase 1: Capture Request ---
    const contentLengthIn = req.get("content-length");
    const bytesIn = contentLengthIn ? parseInt(contentLengthIn, 10) : 0;

    // Resolve IP to Geo Location

    const ip = req.ip || req.connection.remoteAddress;
    let geo = geoip.lookup(ip);

    // --- MOCK GEO FOR LOCALHOST 
    if (!geo && (ip === "::1" || ip === "127.0.0.1" || ip.includes("192.168"))) {
        // Generate random coordinates for visualization
        // Lat: -90 to 90, Lon: -180 to 180
        // Bias towards populated areas for realism roughly
        geo = {
            country: "LOC",
            city: "Localhost",
            ll: [
                (Math.random() * 140) - 70, // Lat
                (Math.random() * 360) - 180 // Lon
            ]
        };
    }

    const logData = {
        logId: requestId,
        timestamp: new Date(),
        sourceIP: ip,
        sourceType: "APP",
        userId: null,
        targetSystem: "Mini-SOC-Backend",
        endpoint: req.originalUrl,
        httpMethod: req.method,
        statusCode: 0,
        category: "REQUEST",
        eventType: "HTTP_REQUEST",
        severity: "LOW",
        classification: "INFO",
        attackVector: "NONE",
        geo: {
            country: geo?.country || null,
            city: geo?.city || null,
            lat: geo?.ll?.[0] || null,
            lon: geo?.ll?.[1] || null
        },
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


    const bodyString = JSON.stringify(req.body || {}).toLowerCase();
    const queryParams = JSON.stringify(req.query || {}).toLowerCase();
    const urlString = req.originalUrl.toLowerCase();

    // Combine all inputs for scanning
    const payload = bodyString + queryParams + urlString;

    const signatures = {
        SQLI: [
            "' or '1'='1",
            "union select",
            "drop table",
            "select * from",
            "--",
            ";--",
            "insert into",
            "update set",
            "delete from",
            "admin'--",
            "1 or 1=1",
            '" or "" = "'
        ],
        XSS: [
            "<script>",
            "javascript:",
            "onload=",
            "onerror=",
            "alert(",
            "document.cookie",
            "eval(",
            "window.location",
            "<img",
            "<svg",
            "<iframe"
        ],
        RCE: [
            "; ls",
            "&& ls",
            "; cat /etc/passwd",
            "| whoami",
            "system(",
            "; rm -rf",
            "| cat",
            "$(",
            "`whoami`",
            "; ping",
            ";"
        ]
    };

    let detectedThreat = null;

    // Check SQLi
    for (const pattern of signatures.SQLI) {
        if (payload.includes(pattern)) {
            detectedThreat = { type: "SQLI", pattern };
            break;
        }
    }

    // Check XSS (if no SQLi found yet)
    if (!detectedThreat) {
        for (const pattern of signatures.XSS) {
            if (payload.includes(pattern)) {
                detectedThreat = { type: "XSS", pattern };
                break;
            }
        }
    }

    // Check RCE
    if (!detectedThreat) {
        for (const pattern of signatures.RCE) {
            if (payload.includes(pattern)) {
                detectedThreat = { type: "RCE", pattern };
                break;
            }
        }
    }


    if (!detectedThreat && req.body && Array.isArray(req.body.ports) && req.body.ports.length > 3) {
        detectedThreat = {
            type: "PORTSCAN",
            pattern: "Multiple Ports Detected"
        };
    }


    const authHeader = req.headers["authorization"] || "";
    if (!detectedThreat) {
        if (authHeader.includes("abc.def.ghi")) {
            detectedThreat = {
                type: "TOKEN_ABUSE",
                pattern: "Tampered Token Detected"
            };
        } else if (authHeader.includes("junk.invalid") || (authHeader.startsWith("Bearer ") && authHeader.split(".").length !== 3)) {
            detectedThreat = {
                type: "TOKEN_ABUSE",
                pattern: "Invalid Token Structure"
            };
        }
    }

    if (detectedThreat) {

        logData.category = "SECURITY";
        if (detectedThreat.type === "TOKEN_ABUSE") {

            if (detectedThreat.pattern === "Tampered Token Detected") {
                logData.eventType = "Tampered Token";
            } else {
                logData.eventType = "Invalid Token";
            }
            logData.severity = "MEDIUM";
        } else if (detectedThreat.type === "PORTSCAN") {
            logData.eventType = "PORT_SCAN";
            logData.severity = "HIGH";
            logData.details.ports = req.body.ports;
        } else {
            logData.eventType = `${detectedThreat.type}_DETECTED`;
            logData.severity = detectedThreat.type === "RCE" ? "CRITICAL" : "HIGH";
        }


        logData.classification = "CONFIRMED_ATTACK";
        logData.attackVector = detectedThreat.type;
        logData.details.ruleId = `${detectedThreat.type}-001`;
        logData.details.patternMatched = detectedThreat.pattern;
        logData.details.suspiciousFragment = detectedThreat.pattern;
        logData.details.tags.push(detectedThreat.type);
    }


    res.on("finish", async () => {
        const duration = Date.now() - start;


        logData.userId = req.user?.id || null;

        logData.statusCode = res.statusCode;
        logData.details.message = `Request took ${duration}ms`;

        // CHECK IF AUTH CONTROLLER SIGNALED AN ISSUE (e.g. Expired Token)
        if (res.locals.authAlert) {
            const alert = res.locals.authAlert;
            logData.category = "SECURITY";

            // Dynamic Event Type Mapping based on Controller's signal
            if (alert.pattern && alert.pattern.includes('Expired')) {
                logData.eventType = "Expired Token";
            } else if (alert.pattern && alert.pattern.includes('Signature')) {
                logData.eventType = "Tampered Token";
            } else {
                logData.eventType = "Invalid Token";
            }

            logData.severity = "MEDIUM";
            logData.classification = "CONFIRMED_ATTACK";
            logData.attackVector = "TOKEN_ABUSE";
            logData.details.message = alert.pattern;
            logData.details.patternMatched = alert.pattern;
            logData.details.suspiciousFragment = "Expired/Invalid Token";
            logData.details.tags.push("TOKEN_ABUSE");
        }

        const contentLengthOut = res.get("Content-Length");
        if (contentLengthOut) {
            logData.details.bytesOut = parseInt(contentLengthOut, 10);
        }


        analyzeLog(logData);

        try {

            const savedLog = await Log.create(logData);


            try {
                getIO().emit("NEW_LOG", savedLog);
            } catch (socketError) {
                console.error("Socket emit failed:", socketError.message);
            }


            if (logData.category === "SECURITY") {
                processLog(savedLog);
            }

            // Emit ALL logs to Socket.IO for Live Feed (including Requests)
            const io = req.app.get("io");
            if (io) {
                // Determine if we should emit. Yes, emit everything for full visibility.
                io.emit("new-log", savedLog);
            }
        } catch (error) {
            console.error("Failed to save monitoring log:", error);
        }
    });

    // Block or Next ---
    if (BLOCK_MODE && detectedThreat) {

        // Custom Status Codes for different threats
        let blockStatus = 403;
        if (detectedThreat.pattern === "Tampered Token Detected") {
            blockStatus = 401; // User requested 401 for Tampered
        }

        // RETURN Block Response
        return res.status(blockStatus).json({
            success: false,
            message: "Malicious Request Detected",
            reason: `${detectedThreat.pattern} attempt blocked`,
            requestId: requestId
        });

    } else {
        next();
    }
});
