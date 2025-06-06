// import User from "../models/User.model";
import Feedback from "../models/feedback.model.js";
import Menu from "../models/menu.model.js";
import { getMealDateTime } from "../utils/timeUtils.js";
import MealCount from "../models/MenuCount.js"; 
import User from "../models/User.model.js";  

export const submitcomment = async (req, res) => {
  try {
    const menuId = req.params.id;
    const { comment } = req.body;
    const studentId = req.user.id;
    const today = new Date().toLocaleString("en-US", { weekday: "long" });

    const menu = await Menu.findById(menuId);
    if (!menu)
      return res.status(404).json({ message: "Menu not found for today" });

    const now = new Date();
    const mealType = menu.mealType;
    const commentOpentime = getMealDateTime(mealType, 2);

    const duplicateFeedback = await Feedback.findOne({
      studentId,
      menuId,
      comment,
    });
    if (duplicateFeedback) {
      return res
        .status(400)
        .json({ message: "Duplicate comment. Feedback already exists." });
    }

    let feedback = await Feedback.findOne({ studentId, menuId: menu._id });
    if (!feedback)
      feedback = new Feedback({
        studentId,
        menuId: menu._id,
        comment,
        mealType,
      });

    if (now < commentOpentime)
      return res.status(403).json({ message: "Commenting not open yet" });
    feedback.commentOpentime = commentOpentime;

    await feedback.save();
    res.status(200).json({ message: "Feedback saved successfully", feedback });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// export const submitWillEat = async (req, res) => {
//   try {
//     const menuId = req.params.id;
//     const { willEat } = req.body;
//     const studentId = req.user.id;

//     const menu = await Menu.findById(menuId);
//     if (!menu)
//       return res.status(404).json({ message: "Menu not found for today" });

//     const now = new Date();
//     const mealType = menu.mealType;
//     const cutoffTime = getMealDateTime(mealType, -4); // Cutoff time for willEat (-4 hours)

//     if (now > cutoffTime) {
//       return res
//         .status(403)
//         .json({ message: "Time closed for updating meal preference" });
//     }

//     let feedback = await Feedback.findOne({ studentId, menuId });
//     if (!feedback) feedback = new Feedback({ studentId, menuId, mealType });

//     feedback.willEat = willEat;
//     await feedback.save();

//     res
//       .status(200)
//       .json({ message: "WillEat preference saved successfully", feedback });
//   } catch (err) {
//     console.error("Error in submitWillEat:", err.message);
//     res
//       .status(500)
//       .json({
//         message: "Failed to save willEat preference",
//         error: err.message,
//       });
//   }
// };
 
export const submitWillEat = async (req, res) => {
  try {
    const menuId = req.params.id;
    const { willEat } = req.body;
    const studentId = req.user.id;

    const menu = await Menu.findById(menuId);
    if (!menu)
      return res.status(404).json({ message: "Menu not found for today" });

    const now = new Date();
    const mealType = menu.mealType;
    const cutoffTime = getMealDateTime(mealType, -4); // Cutoff time for willEat (-4 hours)

    if (now > cutoffTime) {
      return res
        .status(403)
        .json({ message: "Time closed for updating meal preference" });
    }

    // Find existing feedback to check previous choice
    let feedback = await Feedback.findOne({ studentId, menuId });
    const previousWillEat = feedback ? feedback.willEat : null;

    if (!feedback) feedback = new Feedback({ studentId, menuId, mealType });

    feedback.willEat = willEat;
    await feedback.save();

    // Only update MealCount if the choice has changed
    if (previousWillEat !== willEat) {
      await MealCount.findOneAndUpdate(
        { day: menu.day, mealType: menu.mealType },
        { $inc: { count: willEat ? 1 : previousWillEat === false ? 1 : -1 } }, // +1 if switched to Yes, -1 if switched to No
        { upsert: true }
      );
    }

    res
      .status(200)
      .json({ message: "WillEat preference saved successfully", feedback });
  } catch (err) {
    console.error("Error in submitWillEat:", err.message);
    res
      .status(500)
      .json({
        message: "Failed to save willEat preference",
        error: err.message,
      });
  }
};
export const getComments = async (req, res) => {
  try {
    const comments = await Feedback.find(
      { comment: { $ne: null } }, // Only feedbacks with a comment
      "comment studentId"
    ).populate("studentId", "name email"); // Populate student name and email

    if (!comments || comments.length === 0) {
      return res
        .status(404)
        .json({ message: "No comments found" });
    }

    res
      .status(200)
      .json({ message: "Comments retrieved successfully", data: comments });
  } catch (err) {
    console.error("Error in getComments:", err.message);
    res
      .status(500)
      .json({ message: "Failed to retrieve comments", error: err.message });
  }
};

// export const getWillEatCounts = async (req, res) => {
//   try {
//     const menuId = req.params.id; // Extract menuId from the URL

//     const countWillEat = await Feedback.countDocuments({
//       menuId,
//       willEat: true,
//     });
//     const countWillNotEat = await Feedback.countDocuments({
//       menuId,
//       willEat: false,
//     });

//     res.status(200).json({
//       message: "Counts retrieved successfully",
//       data: {
//         willEat: countWillEat,
//         willNotEat: countWillNotEat,
//       },
//     });
//   } catch (err) {
//     console.error("Error in getWillEatCounts:", err.message);
//     res
//       .status(500)
//       .json({ message: "Failed to retrieve counts", error: err.message });
//   }
// };


// export const getTodayAllMealCounts = async (req, res) => {
//   try {
//     const today = new Date().toLocaleString("en-US", { weekday: "long" });
//     const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];

//     // Find today's menus for all meals
//     const menus = await Menu.find({ day: today, mealType: { $in: meals } });

//     const result = {};

//     for (const meal of meals) {
//       const menu = menus.find(m => m.mealType === meal);
//       if (menu) {
//         const willEat = await Feedback.countDocuments({ menuId: menu._id, willEat: true });
//         const willNotEat = await Feedback.countDocuments({ menuId: menu._id, willEat: false });
//         result[meal] = { willEat, willNotEat };
//       } else {
//         result[meal] = { willEat: 0, willNotEat: 0 };
//       }
//     }

//     res.status(200).json({
//       message: "Today's meal counts retrieved successfully",
//       data: result,
//     });
//   } catch (err) {
//     console.error("Error in getTodayAllMealCounts:", err.message);
//     res.status(500).json({ message: "Failed to retrieve today's meal counts", error: err.message });
//   }
// };


export const getTodayAllMealCounts = async (req, res) => {
  try {
    const today = new Date().toLocaleString("en-US", { weekday: "long" });
    const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];

    // Get total number of students
    const totalStudents = await User.countDocuments({ role: "student" });

    // Find today's menus for all meals
    const menus = await Menu.find({ day: today, mealType: { $in: meals } });

    const result = {};

    for (const meal of meals) {
      const menu = menus.find(m => m.mealType === meal);
      if (menu) {
        const willNotEat = await Feedback.countDocuments({ menuId: menu._id, willEat: false });
        const willEat = totalStudents - willNotEat;
        result[meal] = { willEat, willNotEat };
      } else {
        result[meal] = { willEat: totalStudents, willNotEat: 0 };
      }
    }

    res.status(200).json({
      message: "Today's meal counts retrieved successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error in getTodayAllMealCounts:", err.message);
    res.status(500).json({ message: "Failed to retrieve today's meal counts", error: err.message });
  }
};