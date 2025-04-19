import express from 'express';
import { isMessManager, isStudent, isSuperAdmin, verifyToken } from '../middlewares/auth';
import {getUsers, getUser,updateUser,deleteUser} from "../controller/user.controller";
const router= express.Router();

router.get('/',verifyToken,isSuperAdmin,getUsers);

router.get('/:id',verifyToken,getUser); 
router.put('/:id',verifyToken,updateUser);
router.delete('/:id',verifyToken,deleteUser);
// router.put('/menu',verifyToken,)