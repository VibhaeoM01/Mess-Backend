import express from "express";
import {
  isMessManager,
  isSuperAdmin,
  verifyToken,
} from "../middlewares/auth.js";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getAllStudentEmails,
  deleteParticularStudentAccount,
} from "../controller/user.controller.js";
const router = express.Router();

// getAllusers needs only.. User.find(), where User is model name in DB
router.get("/", verifyToken, isMessManager, getAllUsers);
router.get("/students/emails", verifyToken, isMessManager, getAllStudentEmails);
router.get("/:id", verifyToken, getUser);
router.delete(
  "/deletePartAcc/:id",verifyToken,
  isMessManager,
  deleteParticularStudentAccount
);
router.put("/:id", verifyToken, isMessManager, updateUser);
router.delete("/:id", verifyToken, deleteUser);
// router.put('/menu',verifyToken,)
export default router;
