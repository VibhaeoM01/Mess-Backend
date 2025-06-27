import express from 'express';
import {register,login,getCurrentUser,logout, deleteCurrentAccount, UpdatedAccount} from '../controller/auth.controller.js'
import { verifyToken } from '../middlewares/auth.js'; 
const router=express.Router();

// Auth routes:
// - /register and /login do NOT require verifyToken, since users are not yet authenticated
// - /logout also does NOT require verifyToken, as it just clears the token on client side
// - /me route USES verifyToken to ensure only authenticated users can access their own info

router.post('/register',register);
router.post('/login',login);
router.post('/logout',logout)
router.delete('/delete',verifyToken,deleteCurrentAccount);
router.put('/update',verifyToken,UpdatedAccount);
router.get('/me',verifyToken ,getCurrentUser);

export default router;