import mongoose, { Schema } from "mongoose";

const incidentAssignmentRequestSchema = new Schema({
    incident: {
        type: Schema.Types.ObjectId,
        ref: "Incident",
        required: true
    },
    requestedBy: {
        type: Schema.Types.ObjectId,
        ref: "Analyst",
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    actedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
        default: null
    },
    actedAt: {
        type: Date,
        default: null
    }
});

const IncidentAssignmentRequest = mongoose.model("IncidentAssignmentRequest", incidentAssignmentRequestSchema);
export default IncidentAssignmentRequest;
