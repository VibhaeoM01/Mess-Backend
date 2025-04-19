import express from "express";
import { isMessManager,isStudent,verifyToken } from "../middlewares/auth.js" 

import {getMenuChart, getTodaysMenu,UpdateMenu,AddMenu} from "../controller/menu.controller.js";
const router=express.Router();

router.get('/all',verifyToken,getMenuChart)
router.get('/',verifyToken,isStudent,getTodaysMenu);
router.post('/add',verifyToken,isMessManager,AddMenu);
router.put('/update',verifyToken,isMessManager,UpdateMenu);
export default router;