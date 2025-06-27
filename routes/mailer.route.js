import express from "express";
import { isMessManager, isSuperAdmin, verifyToken } from "../middlewares/auth.js";
import { sendAnnouncement } from "../controller/Mail.controller.js";
const router=express.Router();
router.post("/send",verifyToken,isMessManager,sendAnnouncement)
export default router;