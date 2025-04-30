import express from "express";
import { isMessManager,isStudent,isSuperAdmin,verifyToken } from "../middlewares/auth.js" 

import {getMenuChart, getTodaysMenu,UpdateMenu,AddMenu} from "../controller/menu.controller.js";
const router=express.Router();

router.get('/all',verifyToken,getMenuChart)
router.get('/',verifyToken,isStudent,getTodaysMenu);
router.post('/add',verifyToken,isSuperAdmin,AddMenu);
router.put('/update/:id',verifyToken,isMessManager,UpdateMenu);
export default router;