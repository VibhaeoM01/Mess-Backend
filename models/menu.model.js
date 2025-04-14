import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
    mealType:{type:String,enum:['breakfast','lunch','snacks','dinner'],required:true},
    items:[String],
    image:{type:String,required:false},
    date:{type:String,required:true},
    cutoff:{type:String,required:true}
});

const Menu=mongoose.model('Menu',menuSchema);

export default Menu;