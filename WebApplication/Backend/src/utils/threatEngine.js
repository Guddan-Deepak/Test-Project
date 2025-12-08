import Log from "../models/Log.model.js";
import Incident from "../models/Incident.model.js";
import { v4 as uuidv4 } from "uuid";
import { getIO } from "../socket.js";


const TIME_WINDOW_MINUTES = 5;

// Dynamic Severity Calculation Helper based on User Rules
const calculateSeverity = (attackVector, eventType, count) => {
    // 1. RCE: Always CRITICAL
    if (attackVector === "RCE") return "CRITICAL";

    // 2. Port Scan: Always HIGH
    if (attackVector === "PORTSCAN") return "HIGH";

    // 3. SQL Injection & XSS
    if (attackVector === "SQLI" || attackVector === "XSS") {
        // High if < 5, Critical if >= 5
        return count >= 5 ? "CRITICAL" : "HIGH";
    }

    // 4. Token Abuse
    if (attackVector === "TOKEN_ABUSE") {
        if (eventType === "Expired Token") return "IGNORE"; // Should be caught before, but safety
        // Tampered or Invalid: High if < 5, Critical if > 5 (User said "more than 5", assuming >= 5 for critical transition)
        return count >= 5 ? "CRITICAL" : "HIGH";
    }

    // 5. Brute Force
    if (attackVector === "BRUTE_FORCE") {
        if (count > 20) return "CRITICAL";
        if (count >= 10) return "HIGH"; // 10 to 20
        if (count >= 5) return "MEDIUM"; // 5 to 10
        return "LOW"; // Less than 5
    }

    return "LOW"; // Default fallback
};


export const analyzeLog = (logData) => {
    // Rule: Failed Login Detection (Time-based correlation elsewhere handles the "Brute Force" naming, 
    // but here we flag the individual event)
    if ((logData.endpoint.includes("/login") || logData.endpoint.includes("/signin")) && logData.statusCode === 401) {
        logData.category = "SECURITY";
        logData.eventType = "FAILED_LOGIN";
        logData.severity = "LOW"; // Start low, threat engine upgrades it
        logData.classification = "SUSPICIOUS";
        logData.attackVector = "BRUTE_FORCE";
        logData.details.message = "Failed login attempt detected";
        logData.details.ruleId = "AUTH-001";
        if (!logData.details.tags.includes("BRUTE_FORCE")) {
            logData.details.tags.push("BRUTE_FORCE");
        }
    }
};


export const processLog = async (logDoc) => {
    try {
        const { sourceIP, attackVector, eventType, details } = logDoc; // Added eventType destructuring

        // RULE: Ignore Expired Token Incidents
        if (eventType === "Expired Token") {
            return;
        }

        const now = new Date();
        const windowStart = new Date(now.getTime() - TIME_WINDOW_MINUTES * 60 * 1000);

        // 1. Count recent logs for this specific Attack Vector AND Event Type
        const recentLogsCount = await Log.countDocuments({
            sourceIP: sourceIP,
            category: "SECURITY",
            attackVector: attackVector,
            eventType: eventType, // Grouping by specific event type (e.g., Tampered vs Invalid)
            timestamp: { $gte: windowStart }
        });

        // 2. Calculate Severity based on the detailed matrix
        const calculatedSeverity = calculateSeverity(attackVector, eventType, recentLogsCount);

        // 3. Find EXISTING incident specific to this Event Type (Separate incidents for separate problems)
        let incident = await Incident.findOne({
            sourceIp: sourceIP,
            type: `${eventType} Attack`, // Ensures "Tampered Token Attack" is distinct from "Invalid Token Attack"
            status: { $in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] }
        });

        if (incident) {
            // UPDATE existing incident
            incident.occurrenceCount = recentLogsCount;
            incident.lastSeenAt = now;

            // Upgrade severity if calculated is higher than current
            const severityLevels = { "LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4 };
            if (severityLevels[calculatedSeverity] > severityLevels[incident.severity]) {
                incident.severity = calculatedSeverity;
            }

            if (!incident.relatedLogs.includes(logDoc._id)) {
                incident.relatedLogs.push(logDoc._id);
            }

            await incident.save();
            console.log(`[ThreatEngine] Updated Incident: ${incident.incidentId} | Severity: ${incident.severity} | Count: ${incident.occurrenceCount}`);
            try {
                getIO().emit("INCIDENT_UPDATED", incident);
            } catch (e) { console.error("Socket emit failed", e); }
        } else {
            // CREATE new incident
            // Threshold logic:
            // For BruteForce, count > 0 is LOW (valid incident).
            // For SQl/XSS/Token, count > 0 is HIGH (valid incident).
            // So we generally create an incident if we reach this point (except ignored types).

            const newIncidentId = `INC-${uuidv4().substring(0, 8).toUpperCase()}`;

            const relatedLogs = await Log.find({
                sourceIP: sourceIP,
                category: "SECURITY",
                attackVector: attackVector,
                eventType: eventType,
                timestamp: { $gte: windowStart }
            }).select("_id");

            incident = await Incident.create({
                incidentId: newIncidentId,
                type: `${eventType} Attack`, // e.g., "SQLI_DETECTED Attack", "Tampered Token Attack"
                sourceIp: sourceIP,
                severity: calculatedSeverity,
                status: "OPEN",
                occurrenceCount: recentLogsCount,
                firstSeenAt: windowStart,
                lastSeenAt: now,
                relatedLogs: relatedLogs.map(l => l._id),
                triggerRule: details.ruleId || `${attackVector}_RULE`
            });
            console.log(`[ThreatEngine] Created New Incident: ${incident.incidentId} | Severity: ${calculatedSeverity}`);
            try {
                getIO().emit("NEW_INCIDENT", incident);
            } catch (e) { console.error("Socket emit failed", e); }
        }

    } catch (error) {
        console.error("[ThreatEngine] Error processing log:", error);
    }
};
