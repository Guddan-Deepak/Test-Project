import mongoose, { Schema } from "mongoose";

const logSchema = new Schema(
    {
        logId: {
            type: String,
            required: true,
            unique: true
        },
        timestamp: {
            type: Date,
            required: true
        },
        sourceIP: {
            type: String,
            required: true
        },
        sourceType: {
            type: String,
            enum: ["APP", "SIMULATOR", "WAF", "OTHER"],
            required: true
        },
        userId: {
            type: String,
            default: null
        },
        targetSystem: {
            type: String,
            required: true
        },
        endpoint: {
            type: String,
            default: null
        },
        httpMethod: {
            type: String,
            enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", null],
            default: null
        },
        statusCode: {
            type: Number,
            default: 0
        },
        category: {
            type: String,
            enum: ["REQUEST", "AUTH", "NETWORK", "FILE", "SECURITY"],
            required: true
        },
        eventType: {
            type: String,
            required: true
        },
        severity: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            required: true
        },
        classification: {
            type: String,
            enum: ["INFO", "SUSPICIOUS", "CONFIRMED_ATTACK"],
            required: true
        },
        attackVector: {
            type: String,
            enum: ["NONE", "SQLI", "XSS", "BRUTEFORCE", "PORTSCAN", "DDOS", "TOKEN_ABUSE", "MALWARE", "OTHER"],
            required: true
        },
        details: {
            message: { type: String, default: null },
            suspiciousFragment: { type: String, default: null },
            username: { type: String, default: null },
            ports: { type: [Number], default: [] },
            bytesIn: { type: Number, default: 0 },
            bytesOut: { type: Number, default: 0 },
            fileName: { type: String, default: null },
            command: { type: String, default: null },
            ruleId: { type: String, default: null },
            patternMatched: { type: String, default: null },
            tags: { type: [String], default: [] }
        }
    },
    {
        timestamps: true
    }
)

logSchema.index({ timestamp: -1 });
logSchema.index({ sourceIP: 1, timestamp: -1 });
logSchema.index({ category: 1, eventType: 1, timestamp: -1 });
logSchema.index({ attackVector: 1, severity: 1, timestamp: -1 });

export const Log = mongoose.model("Log", logSchema)
