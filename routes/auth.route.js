import express from 'express';
import {register,login,getCurrentUser,logout} from '../controller/auth.controller.js'
import { verifyToken } from '../middlewares/auth.js'; 
const router=express.Router();

router.post('/register',register);
router.post('/login',login);
router.post('/logout',logout)
router.get('/me',verifyToken ,getCurrentUser);
export default router;