import mongoose from "mongoose";

const contactform=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:false},
    phone:{type:String,required:true},
    createdAt:{type:Date,default:Date.now}
})
export default mongoose.model("Contact",contactform)