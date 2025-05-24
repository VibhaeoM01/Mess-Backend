import MealCount from "../models/MenuCount.js";
import User from "../models/User.model.js"; // <-- Update this line

export const mealcount = async (req, res) => {
  try {
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    const counts = await MealCount.find({ day: today });
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch today's meal counts" });
  }
};

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];

export const initializeMealCounts = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" }); // <-- Update this line
    console.log("Total students counted:", totalStudents); // Debug line
    for (const day of days) {
      for (const mealType of meals) {
        await MealCount.findOneAndUpdate(
          { day, mealType },
          { count: totalStudents },
          { upsert: true }
        );
      }
    }
    res.json({ message: "MealCounts initialized" });
  } catch (err) {
    res.status(500).json({ message: "Initialization failed" });
  }
};