import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

import MealCount from "../models/MenuCount.js"; // adjust path if needed
// export const register = async (req, res) => {
//   // console.log('JWT_SECRET during signing:', process.env.JWT_SECRET);
//   // console.log('JWT_SECRET length during signing:', process.env.JWT_SECRET?.length);

//   // take data from body -> check if user exist (findOne by email) -> make variable and store all data -> save in db -> sign the token
//   try {
//     const { name, email, password, role } = req.body;
//     const existingUser = await User.findOne({ email });
//     if (existingUser)
//       return res.status(400).json({ message: "User Already Exist" });
//     const user = new User({ name, email, password, role: role || "student" });

//     await user.save();
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       algorithm: "HS256",
//       expiresIn: "24h",
//     });
//     // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

//     const data = {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     };

//     await MealCount.updateMany({}, { $inc: { count: 1 } });
//     res
//       .status(201)
//       .json({ message: "User registered Successfully", token, user: data });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error registering user", error: err.message });
//   }
// };

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
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];
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
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};
