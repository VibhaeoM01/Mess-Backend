import express from "express";
import contactform from "../models/contact.model.js";
export const SubmitForm = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const contact = new contactform({ name, email, phone });
    await contact.save();
    res.status(201).json({ message: "Submitted" });
  } catch (err) { 
    res.status(500).json({ message: "Server Error" });
  }
};
