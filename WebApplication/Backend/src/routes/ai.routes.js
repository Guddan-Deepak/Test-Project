import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { handleIncidentChat, clearChatHistory } from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/incident-chat', verifyJWT, handleIncidentChat);
router.delete('/history', verifyJWT, clearChatHistory);

export default router;
