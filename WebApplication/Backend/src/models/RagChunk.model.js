import mongoose from 'mongoose';

const ragChunkSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    // New fields as per requirements
    sourceType: {
        type: String,
        required: true,
        enum: ["PLAYBOOK", "RULE_DOC", "MITRE", "SOP", "TEMPLATE"],
        default: "SOP"
    },
    sourceName: {
        type: String,
        required: true
    },
    ruleId: {
        type: String,
        default: null
    },
    mitreId: {
        type: String,
        default: null
    },
    tags: {
        type: [String],
        default: []
    },
    embedding: {
        type: [Number],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Indexes for filtering
ragChunkSchema.index({ ruleId: 1 });
ragChunkSchema.index({ sourceType: 1 });
ragChunkSchema.index({ tags: 1 });

export const RagChunk = mongoose.model('RagChunk', ragChunkSchema);
