import express from "express";
import { isMessManager, verifyToken } from "../middlewares/auth"
// import { verify } from "jsonwebtoken";
import {getMenuChart, getTodaysMenu,UpdateMenu,AddMenu} from "../controller/menu.controller";
const router=express.Router();

router.get('/all',verifyToken,getMenuChart)
router.get('/',verifyToken,isStudent,getTodaysMenu);
router.post('/add',verifyToken,isMessManager,AddMenu);
router.put('/update',verifyToken,isMessManager,UpdateMenu);
