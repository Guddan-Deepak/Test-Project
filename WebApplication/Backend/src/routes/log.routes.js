import { Router } from "express";
import { createLog, getLogs } from "../controllers/log.controller.js";

const router = Router();

router.route("/").post(createLog).get(getLogs);

export default router;
