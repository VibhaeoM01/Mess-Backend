// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
import mongoose  from 'mongoose';
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    role:{type:String, enum:['super_admin','mess_manager','student'],default:'student'}, 
    createdAt:{type:Date,default:Date.now}
});

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password=await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.comparePassword = async function(userpw){
    return await bcrypt.compare(userpw,this.password);
};

const User= mongoose.model('User',userSchema);

export default User;