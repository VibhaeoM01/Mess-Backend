import express from 'express';
import {isSuperAdmin, verifyToken } from '../middlewares/auth.js';
import {getAllUsers, getUser,updateUser,deleteUser} from "../controller/user.controller.js";
const router= express.Router();

router.get('/',verifyToken,isSuperAdmin,getAllUsers);

router.get('/:id',verifyToken,getUser); 
router.put('/:id',verifyToken,updateUser);
router.delete('/:id',verifyToken,deleteUser);
// router.put('/menu',verifyToken,)
export default router;