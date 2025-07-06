import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  logout, 
  deleteCurrentAccount, 
  UpdatedAccount,
  createMessId,
  joinMess,
  getMessDetails,
  getUserMess,
  getAllMessDetails
} from '../controller/auth.controller.js'
import { verifyToken } from '../middlewares/auth.js'; 

const router = express.Router();

// Auth routes:
// - /register and /login do NOT require verifyToken, since users are not yet authenticated
// - /logout also does NOT require verifyToken, as it just clears the token on client side
// - /me route USES verifyToken to ensure only authenticated users can access their own info

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout)
router.delete('/delete', verifyToken, deleteCurrentAccount);
router.put('/update', verifyToken, UpdatedAccount);
router.get('/me', verifyToken, getCurrentUser);

// Mess management routes
router.post('/create-mess-id', verifyToken, createMessId);
router.post('/join-mess', verifyToken, joinMess);
router.get('/mess-details/:messId', getMessDetails);
router.get('/user-mess', verifyToken, getUserMess);
router.get('/all-mess-details', verifyToken, getAllMessDetails); // Get all messes with details

// Debug route - can be removed in production (use /all-mess-details instead)
// router.get('/debug/all-mess-ids', async (req, res) => {
//   try {
//     const Mess = (await import('../models/Mess.model.js')).default;
//     const allMesses = await Mess.find({}, 'messId messName managerId').populate('managerId', 'email');
//     res.json({
//       message: 'Use /all-mess-details for more comprehensive data',
//       count: allMesses.length,
//       messes: allMesses
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

export default router;