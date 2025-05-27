import express from "express"
import { SubmitForm } from "../controller/contact.controller.js";

const router=express.Router();

router.post("/",SubmitForm);

export default router;