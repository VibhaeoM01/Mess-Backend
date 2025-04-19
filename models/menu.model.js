import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
        required: true
    },
    items: [String],
    image: {
        type: String,
        required: false
    },
    day: {
        type: String,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        required: true
    }
},
{ timestamps: true }
);

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;