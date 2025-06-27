// import express from 'express';
import User from "../models/User.model.js";
import bcrypt from "bcryptjs";

export const deleteParticularStudentAccount = async (req, res) => {
  try {
    const id = req.params.id;
    const name = await User.findById(id).select("name");
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Account deleted Succesfully" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Failed to delete account", error: err.message });
  }
};
export const getAllStudentEmails = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("email name");
    res.status(200).json(students);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch student emails", error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update user", error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const AllUsers = await User.find().select("-password");
    res.status(200).json({ AllUsers });
  } catch (err) {
    res.status(500).json({ message: "Error Fetching Users" });
  }
};

export const getUser = async (req, res) => {
  try {
    const AUser = await User.findById(req.params.id).select("-password"); // here req.user.id is not used to findbyID because it will give current LoggedIn user ID not one which we want to fetch...
    if (!AUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ AUser });
  } catch (err) {
    res.status(500).json({ message: "Error fetching a User" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (req.user.role != "super_admin") {
      return res.status(403).json({ message: "Not Authorized to delete" });
    }
    await user.remove();
    res.json({ message: "User deleted Successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting User" });
  }
};
