import { Router } from "express";
import { createRagChunk, getRagChunks, deleteRagChunk } from "../../controllers/ragChunk.controller.js";

const router = Router();

router.route("/")
    .get(getRagChunks)
    .post(createRagChunk);

router.route("/:id")
    .delete(deleteRagChunk);

export default router;
