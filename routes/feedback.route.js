import express from "express";
import { submitcomment, getComments, submitWillEat, getTodayAllMealCounts } from "../controller/feedback.controller.js";
import { verifyToken, isStudent, isMessManager, isSuperAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/:id", verifyToken, isStudent, submitcomment);
router.post("/eat/:id", verifyToken, isStudent, submitWillEat);
router.get('/feedback',verifyToken, isMessManager, getComments);
// router.get('/feedback',verifyToken, isMessManager, getWillEatCounts);
router.get('/count',verifyToken,isMessManager,getTodayAllMealCounts)

export default router;
