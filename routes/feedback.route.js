import express from "express";
import { submitFeedback } from "../controller/feedback.controller.js";
import { verifyToken, isStudent } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyToken, isStudent, submitFeedback);

export default router;
