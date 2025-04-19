import express from 'express';
import User from '../models/User.model';


export const getAllUsers=async (req,res)=>{
    try{
        const AllUsers= await User.find().select('-password');
        res.status(200).json({AllUsers});
    }
    catch(err)
    {
        res.status(500).json({message:'Error Fetching Users'});
    }
}
export const getUser = async (req,res)=>{
    try{
        const AUser= await User.findById(req.params.id).select('-password');
        if(!AUser) return res.status(404).json({message:"User not found"});
        res.status(200).json({ AUser });
    }
    catch(err)
    {
        res.status(500).json({message:'Error fetching a User'});
    }
}

export const updateUser = async(req,res)=>{
    try{
        const {name,email,role}=req.body;
    const user =await User.findById(req.params.id);

    if(!user) return res.status(404).json({message: "User not found"})
    
    if(req.user.id !=user.id && req.user.role!='super_admin')
    {
        return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    if(name) user.name=name;
    if(email) user.email=email;
    if(role) user.role=role;
    await user.save();
    res.json({message:'User updated Successful'});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({message:'Error updating User'});
    }
}
export const deleteUser = async(req,res)=>{
    try{
        const user=await User.findById(req.params.id);
        if(!user) return res.status(404).json({message:"User not found"});
        if(req.user.role!="super_admin")
        {
            return res.status(403).json({message:'Not Authorized to delete'});
        }
        await user.remove();
        res.json({message:"User deleted Successfully"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({message:"Error deleting User"});
    }
}

