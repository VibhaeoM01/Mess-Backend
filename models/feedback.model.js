import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  mealType: {
    type: String,
    required: true,
  },
  willEat: {
    type: Boolean,
    default: true,
  },
  comment: {
    type: String,
    required: false,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
    required: true,
  },
  sentiment: {
    type: String,
    enum: ["positive", "neutral", "negative"],
    default: "neutral"
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
