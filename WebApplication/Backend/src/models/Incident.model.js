import mongoose, { Schema } from "mongoose";

const incidentSchema = new Schema(
    {
        incidentId: {
            type: String,
            required: true,
            unique: true
        },
        type: {
            type: String,
            required: true, // e.g., "SQL Injection", "XSS", "Brute Force"
        },
        sourceIp: {
            type: String,
            required: true
        },
        severity: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            required: true
        },
        status: {
            type: String,
            enum: ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "FALSE_POSITIVE"],
            default: "OPEN"
        },
        occurrenceCount: {
            type: Number,
            default: 1
        },
        firstSeenAt: {
            type: Date,
            required: true
        },
        lastSeenAt: {
            type: Date,
            required: true
        },
        relatedLogs: [{
            type: Schema.Types.ObjectId,
            ref: "Log"
        }],
        analystNotes: {
            type: String,
            default: null
        },
        assignedTo: {
            type: String, // User ID of the analyst
            default: null
        },
        triggerRule: {
            type: String,
            default: null // e.g., "SQLI-001"
        }
    },
    {
        timestamps: true
    }
);

// Indexes for faster dashboard queries
incidentSchema.index({ status: 1, severity: -1 });
incidentSchema.index({ sourceIp: 1 });
incidentSchema.index({ createdAt: -1 });

const Incident = mongoose.model("Incident", incidentSchema);
export default Incident;
