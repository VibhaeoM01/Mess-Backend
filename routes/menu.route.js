        import express from "express";
import { isMessManager,isStudent,isSuperAdmin,verifyToken } from "../middlewares/auth.js" 

import {getMenuChart, getTodaysMenu,UpdateMenu,AddMenu, deleteAllMenus} from "../controller/menu.controller.js";
const router=express.Router();

router.get('/all',verifyToken,getMenuChart)
router.get('/',getTodaysMenu);
router.post('/add',verifyToken,isSuperAdmin,isMessManager,AddMenu);
router.delete('/all', verifyToken, isSuperAdmin,isMessManager, deleteAllMenus);
router.put('/update/:id',verifyToken,isMessManager,UpdateMenu);
export default router;