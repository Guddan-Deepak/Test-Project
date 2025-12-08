import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { ragService } from "../services/rag.service.js";
import { maskSensitiveData } from "../utils/dataMasking.js";
import Incident from "../models/Incident.model.js";
import Redis from "ioredis";
import { GoogleGenerativeAI } from "@google/generative-ai";

let redisClient;
try {
    if (process.env.REDIS_URI) {
        console.log("Connecting to Redis Cloud...");
        redisClient = new Redis(process.env.REDIS_URI);
        redisClient.on("error", (err) => console.error("Redis Cloud Error:", err));
        redisClient.on("connect", () => console.log("Redis Cloud Connected Successfully"));
    } else {
        console.log("REDIS_URI missing. Chat history disabled.");
    }
} catch (e) {
    console.warn("Redis setup failed:", e);
}

let geminiClients = [];
const getGeminiClients = () => {
    if (geminiClients.length === 0) {
        const keys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [];
        if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
        const uniqueKeys = [...new Set(keys.filter(k => k && k.trim().length > 0))];

        if (uniqueKeys.length === 0) {
            console.warn("No GEMINI_API_KEYS provided. AI features will fail.");
            throw new Error("Missing GEMINI_API_KEYS");
        }
        console.log(`Initialized ${uniqueKeys.length} Gemini API Keys for rotation.`);
        geminiClients = uniqueKeys.map(key => new GoogleGenerativeAI(key));
    }
    return geminiClients;
};

const executeWithKeyRotation = async (operationFn) => {
    const clients = getGeminiClients();
    let lastError = null;

    for (let i = 0; i < clients.length; i++) {
        try {
            const client = clients[i];
            const model = client.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
            return await operationFn(model);
        } catch (error) {
            console.warn(`[AI] Key ${i + 1} failed: ${error.message}`);
            lastError = error;
        }
    }
    throw lastError || new Error("All API keys exhausted.");
};

const handleIncidentChat = asyncHandler(async (req, res) => {
    const { incidentId, message } = req.body;
    const userId = req.user._id.toString();

    if (!message) {
        throw new ApiError(400, "Message is required");
    }

    let incidentContext = null;
    let logsPreview = "";

    if (incidentId) {
        const incident = await Incident.findOne({ incidentId }).populate("relatedLogs");
        if (incident) {
            incidentContext = incident;
            if (incident.relatedLogs && incident.relatedLogs.length > 0) {
                logsPreview = incident.relatedLogs.slice(0, 5).map(log =>
                    `[${log.timestamp.toISOString()}] ${log.eventType} ${log.sourceIP} ${log.details || ''}`
                ).join("\n");
            }
        }
    }

    let ragDocsText = "";
    let useGeneralKnowledgeOnly = false;
    let ragQuery = message;

    if (incidentContext) {
        ragQuery += ` ${incidentContext.type} ${incidentContext.triggerRule || ""}`;
    }

    try {
        const queryEmbedding = await ragService.embedText(ragQuery);
        const candidates = await ragService.vectorSearch(queryEmbedding, 20);

        const scoredChunks = candidates.map(chunk => ({
            ...chunk,
            similarity: ragService.cosineSimilarity(queryEmbedding, chunk.embedding)
        }));

        scoredChunks.sort((a, b) => b.similarity - a.similarity);
        const relevantChunks = scoredChunks.filter(c => c.similarity >= 0.55).slice(0, 5);
        console.log(`[RAG] Found ${relevantChunks.length} relevant chunks`);

        if (relevantChunks.length > 0) {
            ragDocsText = relevantChunks.map((doc, i) =>
                `DOC ${i + 1} (source: ${doc.sourceType} - ${doc.sourceName}): ${doc.content}`
            ).join("\n\n");
        } else {
            console.log("[RAG] No relevant chunks found.");
            useGeneralKnowledgeOnly = true;
        }

    } catch (error) {
        console.error("RAG Retrieval Failed:", error);
        useGeneralKnowledgeOnly = true;
    }

    const historyKey = `chat_history:${userId}`;
    let history = [];
    if (redisClient) {
        const historyJson = await redisClient.lrange(historyKey, 0, 19);
        history = historyJson.map(h => JSON.parse(h)).reverse();
    }

    const systemPrompt = `
You are a SOC Analyst Assistant for a Mini SOC platform.

Your job is to help analysts understand, investigate, and respond to security incidents using:
1. Provided Incident data
2. Related security logs
3. Internal SOC documentation
4. General cybersecurity knowledge

You are a NON-AGENTIC assistant:
- DO NOT take actions
- DO NOT close incidents
- DO NOT block IPs
- DO NOT modify system data
Only EXPLAIN, GUIDE, and SUGGEST.

Rules:
1. Prioritize Internal Docs over general knowledge.
2. If uncertain, suggest verification.
3. Be clear and practical.
4. Respond in professional SOC analyst language.
5. All sensitive data is redacted.
`;

    const incidentBlock = incidentContext ? `
=== INCIDENT CONTEXT ===
ID: ${incidentContext.incidentId}
Type: ${incidentContext.type}
Severity: ${incidentContext.severity}
Source IP: ${maskSensitiveData(incidentContext.sourceIp)}
Trigger Rule: ${incidentContext.triggerRule || "N/A"}
First Seen: ${incidentContext.firstSeenAt}
Last Seen: ${incidentContext.lastSeenAt}
Occurrence Count: ${incidentContext.occurrenceCount}

=== SAMPLE RELATED LOGS ===
${maskSensitiveData(logsPreview) || "No related logs."}
` : "Global Mode (No incident focus).";

    const ragBlock = `
=== INTERNAL SOC DOCUMENTATION ===
${ragDocsText || "No relevant docs found."}
`;

    const historyText = history.map(h => `${h.role === 'user' ? 'Analyst' : 'Assistant'}: ${h.content}`).join("\n");

    let fullPrompt = `
${systemPrompt}

${incidentBlock}

${ragBlock}

=== CONVERSATION HISTORY ===
${historyText}

=== ANALYST QUESTION ===
${message}

Instructions:
1. Explain what is happening.
2. Suggest investigation steps.
3. Highlight uncertainties.
4. For general questions, answer normally.
5. For response actions, provide safe suggestions only.
`;

    fullPrompt = maskSensitiveData(fullPrompt);

    try {
        await executeWithKeyRotation(async (model) => {
            const result = await model.generateContentStream(fullPrompt);

            if (!res.headersSent) {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.setHeader('Transfer-Encoding', 'chunked');
            }

            let fullReply = "";

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                    fullReply += chunkText;
                    res.write(chunkText);
                }
            }

            if (redisClient && fullReply.trim()) {
                await redisClient.lpush(historyKey, JSON.stringify({ role: 'user', content: message }));
                await redisClient.lpush(historyKey, JSON.stringify({ role: 'assistant', content: fullReply }));
                await redisClient.ltrim(historyKey, 0, 19);
                await redisClient.expire(historyKey, 86400);
            }
            res.end();
            return;
        });

    } catch (error) {
        console.error("Streaming Error:", error);
        if (!res.headersSent) {
            throw new ApiError(500, "AI Stream Failed");
        } else {
            res.end("\n[System Error: Stream interrupted]");
        }
    }
});

const clearChatHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const historyKey = `chat_history:${userId}`;

    if (redisClient) {
        await redisClient.del(historyKey);
    }

    return res.status(200).json(new ApiResponse(200, null, "Chat history cleared"));
});

export { handleIncidentChat, clearChatHistory };
