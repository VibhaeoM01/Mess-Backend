import express from "express";
import { isMessManager, isSuperAdmin, verifyToken } from "../middlewares/auth.js";
import { initializeMealCounts, mealcount } from "../controller/menucount.controller.js";

const router=express.Router();

router.get('/today',verifyToken,isSuperAdmin,isMessManager,mealcount);
router.post("/init", verifyToken,isSuperAdmin,isMessManager,initializeMealCounts);

export default router;
