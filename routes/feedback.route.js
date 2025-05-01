import express from "express";
import { submitFeedback, getComments, getWillEatCounts } from "../controller/feedback.controller.js";
import { verifyToken, isStudent, isMessManager } from "../middlewares/auth.js";

const router = express.Router();

router.post("/:id", verifyToken, isStudent, submitFeedback);
router.get('/feedback',verifyToken, isMessManager, getComments);
router.get('/feedback',verifyToken, isMessManager, getWillEatCounts);
export default router;
