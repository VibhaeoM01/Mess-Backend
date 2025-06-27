import nodemailer from "nodemailer";
import User from "../models/User.model.js";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

export const sendAnnouncement=async(req,res)=>{
    try{
        const {subject,message}=req.body;
        const students=await User.find({role:"student"}).select("email");
        const emails=students.map((s)=>s.email);
        if(!emails.length)
        {
            return res.status(404).json({message:"No Students email found"});
        }
         await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: emails, // array of emails
      subject: subject || "Mess Announcement",
      text: message,
    });

    res.status(200).json({ message: "Announcement sent to all students!" });
  } catch (err) {
    console.error("Announcement error:", err.message);
    res.status(500).json({ message: "Failed to send announcement", error: err.message });
  }
};