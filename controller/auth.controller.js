import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

import MealCount from "../models/MenuCount.js"; // adjust path if needed

export const deleteCurrentAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id); // its suggested to use req.user.id , which has info to currently logged in user.. to avoid deleting  other user by mistake
    res.status(200).json({ message: "Account deleted Succesfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete account", error: err.message });
  }
};
export const UpdatedAccount = async (req, res) => {
  try {
    const { email, name } = req.body;
    const updatesUser = await User.findByIdAndUpdate(
      req.user.id,
      { email, name },
      { new: true }
    );
    res.status(200).json({ message: "Account Details Updated" });
  } catch (err) {
    res.status(500).json({message:"Failed to Update the user"});
    console.log(err);
  }
};
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User Already Exist" });
    const user = new User({ name, email, password, role: role || "student" });

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "24h",
    });

    const data = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Increment meal counts only if the user is a student
    if (user.role === "student") {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const meals = ["breakfast", "lunch", "snacks", "dinner"];
      for (const day of days) {
        for (const mealType of meals) {
          await MealCount.findOneAndUpdate(
            { day, mealType },
            { $inc: { count: 1 } },
            { upsert: true }
          );
        }
      }
    }

    res
      .status(201)
      .json({ message: "User registered Successfully", token, user: data });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

export const login = async (req, res) => {
  // take data from body -> check if user don't exist (findOne by email) -> compare the password -> sign the token
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid Credentials" });

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid Credentials" });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).json({ message: "Error Logging in", error: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); //req.user.id is from verifytoken middleware, where it decodes and verify JWT token from header and fetchs the user from DB using decoded ID and attach the user objecty to req.user
    res.json(user);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
};

//for logout , clearcookie(token)
export const logout = async (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};
