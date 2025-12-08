import { GoogleGenerativeAI } from "@google/generative-ai";
import { RagChunk } from "../models/RagChunk.model.js";
import Incident from "../models/Incident.model.js";

// Helper: Get Clients Lazily
let clients = [];

const getClients = () => {
    if (clients.length === 0) {
        const keys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [];
        if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
        const uniqueKeys = [...new Set(keys.filter(k => k))];

        if (uniqueKeys.length === 0) {
            console.warn("No GEMINI_API_KEYS provided. RAG features will fail.");
            throw new Error("Missing GEMINI_API_KEYS");
        }
        clients = uniqueKeys.map(key => new GoogleGenerativeAI(key));
    }
    return clients;
};

// Helper: Execute with Rotation
const executeWithRetry = async (operationName, operationFn) => {
    const activeClients = getClients();
    let lastError = null;
    for (let i = 0; i < activeClients.length; i++) {
        try {
            return await operationFn(activeClients[i]);
        } catch (error) {
            console.warn(`[RAG] Key ${i + 1} failed for ${operationName}:`, error.message);
            lastError = error;
        }
    }
    throw lastError || new Error(`All API keys failed for ${operationName}`);
};

const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const ragService = {
    // 1. Embed Text
    embedText: async (text) => {
        try {
            return await executeWithRetry("EmbedText", async (client) => {
                const model = client.getGenerativeModel({ model: "text-embedding-004" });
                const result = await model.embedContent(text);
                return result.embedding.values;
            });
        } catch (error) {
            console.error("Embedding Error (All Keys Failed):", error);
            throw new Error("Failed to generate embedding");
        }
    },

    // 2. Helper: Vector Search (Raw MongoDB Aggregation)
    vectorSearch: async (queryEmbedding, limit = 5) => {
        const pipeline = [
            {
                $vectorSearch: {
                    index: "vector_index", // ye likhenge to mongodb apne normal btree search se hatke vector index ke hisab se vector search karega ,ab wo vector embedding hai kaha wo neech path me diya hai
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: limit
                }
            },
            {
                $project: {
                    _id: 1,
                    content: 1,
                    sourceType: 1,
                    sourceName: 1,
                    ruleId: 1,
                    mitreId: 1,
                    embedding: 1, // Needed for re-ranking
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ];
        return await RagChunk.aggregate(pipeline);
    },

    // 3. Helper: Cosine Similarity
    cosineSimilarity
};

// Seed function to add some dummy data if empty
export const seedKnowledgeBase = async () => {
    const count = await RagChunk.countDocuments();
    if (count === 0) {
        console.log("Seeding Knowledge Base...");
        const docs = [
            {
                content: "Phishing Playbook: 1. Isolate the affected host. 2. Reset user credentials immediately. 3. Block the sender domain on the email gateway. 4. Scan the host for malware artifacts.",
                metadata: { type: "Playbook", title: "Phishing Response" }
            },
            {
                content: "SQL Injection (SQLi) Handling: Patterns include 'OR 1=1' or 'UNION SELECT'. If detected: 1. Block the source IP. 2. Check WAF logs for bypass attempts. 3. Patch the vulnerable endpoint. 4. Sanitize all inputs using parameterized queries.",
                metadata: { type: "SOP", title: "SQL Injection" }
            },
            {
                content: "Ransomware Containment: IMMEDIATE ACTION REQUIRED. 1. Disconnect infected device from network (pull ethernet/disable wifi). 2. Do NOT power off (ram contents needed). 3. Alert the CISO. 4. Check backups for integrity.",
                metadata: { type: "Playbook", title: "Ransomware" }
            }
        ];

        for (const doc of docs) {
            const embedding = await ragService.embedText(doc.content);
            await RagChunk.create({ ...doc, embedding });
        }
        console.log("Seeding Complete.");
    }
};
