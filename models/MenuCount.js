import mongoose from "mongoose";

const mealCountSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
    required: true
  },
  count: {
    type: Number,
    required: true
  }
});

const MealCount = mongoose.model('MealCount', mealCountSchema);
export default MealCount;


