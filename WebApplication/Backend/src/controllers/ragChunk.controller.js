import asyncHandler from "../utils/asyncHandler.js";
import { RagChunk } from "../models/RagChunk.model.js";
import { ragService } from "../services/rag.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const createRagChunk = asyncHandler(async (req, res) => {
    const { sourceType, sourceName, content } = req.body;

    if (!sourceType || !sourceName || !content) {
        throw new ApiError(400, "SourceType, SourceName, and Content are required.");
    }

    // 1. Auto-Generate Tags using Gemini
    let tags = [];
    try {
        const tagPrompt = `
        Analyze the following security content and generate a list of 3-5 relevant tags (e.g., "SQL Injection", "Windows", "Investigate").
        Return ONLY a JSON array of strings. No markdown, no json block markers.
        Content: "${content.substring(0, 500)}..."
        `;
        const result = await model.generateContent(tagPrompt);
        const text = result.response.text().replace(/```json|```/g, '').trim();
        tags = JSON.parse(text);
    } catch (error) {
        console.error("Tag generation failed, using default:", error);
        tags = ["General"];
    }

    // 2. Generate Embedding
    const embedding = await ragService.embedText(content);

    // 3. Create Chunk
    const newChunk = await RagChunk.create({
        content,
        sourceType,
        sourceName,
        tags,
        embedding
    });

    return res.status(201).json(new ApiResponse(201, newChunk, "Knowledge Chunk created successfully"));
});

const getRagChunks = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const chunks = await RagChunk.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalDocs = await RagChunk.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);
    const hasMore = page < totalPages;

    return res.status(200).json(new ApiResponse(200, {
        chunks,
        pagination: {
            currentPage: page,
            totalPages,
            totalDocs,
            hasMore
        }
    }, "Chunks retrieved"));
});

const deleteRagChunk = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await RagChunk.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, null, "Chunk deleted"));
});

export { createRagChunk, getRagChunks, deleteRagChunk };
