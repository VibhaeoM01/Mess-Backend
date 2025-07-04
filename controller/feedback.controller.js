// import User from "../models/User.model";
import Feedback from "../models/feedback.model.js";
import Menu from "../models/menu.model.js";
import { getMealDateTime } from "../utils/timeUtils.js";
import MealCount from "../models/MenuCount.js";
import User from "../models/User.model.js";
import Sentiment from "sentiment";
const sentiment = new Sentiment();


export const getSentimentTrends = async (req, res) => {
  try {
    // Group by date and sentiment
    const trends = await Feedback.aggregate([
      {
        $match: { sentiment: { $in: ["positive", "neutral", "negative"] } }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            sentiment: "$sentiment"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          sentiments: {
            $push: { sentiment: "$_id.sentiment", count: "$count" }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ data: trends });
  } catch (err) {
    res.status(500).json({ message: "Failed to get sentiment trends", error: err.message });
  }
};


export const submitcomment = async (req, res) => {
  try {
    const menuId = req.params.id;
    const { comment } = req.body;
    const sentimentOptions = {
      extras: {
        bad: -5,
        terrible: -10,
        awful: -8,
        horrible: -7,
        disgusting: -6,
        bland: -3,
        cold: -2,
        stale: -4,
        undercooked: -5,
        overcooked: -4,
        unhygienic: -7,
        dirty: -6,
        rude: -3,
        slow: -2,
        late: -2,
        good: 3,
        tasty: 4,
        delicious: 5,
        amazing: 6,
        excellent: 7,
        fresh: 3,
        hot: 2,
        clean: 2,
        friendly: 2,
        quick: 2,
        prompt: 2,
        satisfied: 3,
        unsatisfied: -3,
        disappointed: -4,
        happy: 3,
        unhappy: -3,
        // Add more as needed for your context
      },
    };

    const result = sentiment.analyze(comment,sentimentOptions);
    let sentimentLabel = "neutral";
    if (result.score > 0) sentimentLabel = "positive";
    else if (result.score < 0) sentimentLabel = "negative";

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

    // let feedback = await Feedback.findOne({ studentId, menuId: menu._id });
    // if (!feedback) {
      let feedback = new Feedback({
        studentId,
        menuId: menu._id,
        comment,
        mealType,
        sentiment: sentimentLabel,
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
    const cutoffTime = getMealDateTime(mealType, -2); // Cutoff time for willEat (-2 hours)

    if (now > cutoffTime) {
      return res
        .status(403)
        .json({ message: "Time closed for updating meal preference" });
    }

    // Find existing feedback to check previous choice
    let feedback = await Feedback.findOne({ studentId, menuId });
    const previousWillEat = feedback ? feedback.willEat : null;

    // *** NEW FEATURE: Check if this is a new day - if feedback exists but was created on a different day ***
    const today = new Date().toDateString();
    const isNewDay = feedback ? new Date(feedback.createdAt).toDateString() !== today : true;

    if (!feedback) {
      feedback = new Feedback({ studentId, menuId, mealType });
    } 
    // *** NEW FEATURE: Reset to default (true) for new day ***
    else if (isNewDay) { 
      feedback.willEat = true;
      feedback.createdAt = new Date();
      await feedback.save();
       
      await MealCount.findOneAndUpdate(
        { day: menu.day, mealType: menu.mealType },
        { $inc: { count: previousWillEat === false ? 1 : 0 } }, // +1 if was previously No, now reset to Yes
        { upsert: true }
      );
    }

    // *** NEW FEATURE: Only proceed with choice update if not a new day reset ***
    if (!isNewDay || feedback.willEat !== willEat) {
      const oldChoice = feedback.willEat;
      feedback.willEat = willEat;
      await feedback.save();

      // Update MealCount if the choice has changed
      if (oldChoice !== willEat) {
        await MealCount.findOneAndUpdate(
          { day: menu.day, mealType: menu.mealType },
          { $inc: { count: willEat ? 1 : -1 } }, // +1 if Yes, -1 if No
          { upsert: true }
        );
      }
    }

    res
      .status(200)
      .json({ message: "WillEat preference saved successfully", feedback });
  } catch (err) {
    console.error("Error in submitWillEat:", err.message);
    res.status(500).json({
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
      return res.status(404).json({ message: "No comments found" });
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
    const meals = ["breakfast", "lunch", "snacks", "dinner"];

    // Get total number of students
    const totalStudents = await User.countDocuments({ role: "student" });

    // Find today's menus for all meals
    const menus = await Menu.find({ day: today, mealType: { $in: meals } });

    const result = {};

    for (const meal of meals) {
      const menu = menus.find((m) => m.mealType === meal);
      if (menu) {
        const willNotEat = await Feedback.countDocuments({
          menuId: menu._id,
          willEat: false,
        });
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
    res
      .status(500)
      .json({
        message: "Failed to retrieve today's meal counts",
        error: err.message,
      });
  }
};

// OLD VERSION - COMMENTED OUT
// export const getWillEatStatus = async (req, res) => {
//   try {
//     const menuId = req.params.id;
//     const studentId = req.user.id;
//     const feedback = await Feedback.findOne({ studentId, menuId });
//     if (!feedback) {
//       return res.status(200).json({ willEat: null });
//     }
//     res.status(200).json({ willEat: feedback.willEat });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to get willEat status" });
//   }
// };

// NEW VERSION WITH DAILY RESET - Get willEat status for a student for a menu
export const getWillEatStatus = async (req, res) => {
  try {
    const menuId = req.params.id;
    const studentId = req.user.id;
    const feedback = await Feedback.findOne({ studentId, menuId });
    
    if (!feedback) {
      return res.status(200).json({ willEat: true }); // *** NEW FEATURE: Default to true for new entries ***
    }

    // *** NEW FEATURE: Check if this is a new day - if feedback exists but was created on a different day ***
    const today = new Date().toDateString();
    const isNewDay = new Date(feedback.createdAt).toDateString() !== today;

    if (isNewDay) {
      // *** NEW FEATURE: Reset to default (true) for new day ***
      feedback.willEat = true;
      feedback.createdAt = new Date();
      await feedback.save();
      
      // Update MealCount for the reset if previous choice was false
      if (feedback.willEat !== true) {
        const menu = await Menu.findById(menuId);
        if (menu) {
          await MealCount.findOneAndUpdate(
            { day: menu.day, mealType: menu.mealType },
            { $inc: { count: 1 } }, // +1 since we're resetting to Yes
            { upsert: true }
          );
        }
      }
    }

    res.status(200).json({ willEat: feedback.willEat });
  } catch (err) {
    res.status(500).json({ message: "Failed to get willEat status" });
  }
};
