import express from "express";
import { submitcomment, getComments, getWillEatCounts, submitWillEat } from "../controller/feedback.controller.js";
import { verifyToken, isStudent, isMessManager } from "../middlewares/auth.js";

const router = express.Router();

router.post("/:id", verifyToken, isStudent, submitcomment);
router.post("/eat/:id", verifyToken, isStudent, submitWillEat);
router.get('/feedback',verifyToken, isMessManager, getComments);
router.get('/feedback',verifyToken, isMessManager, getWillEatCounts);
export default router;
