import express from 'express';
import { isSuperAdmin, verifyToken } from '../middlewares/auth';

const router= express.Router();

router.get('/',verifyToken,isSuperAdmin,getUsers);
router.get('/:id',verifyToken,getUser);
router.put('/:id',verifyToken,updateUser);
router.delete('/:id',verifyToken,deleteUser);
router.put('menu',verifyToken,)