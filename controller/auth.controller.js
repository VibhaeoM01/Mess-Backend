import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
export const register=async(req,res)=>{
    // take data from body -> check if user exist (findOne by email) -> make variable and store all data -> save in db -> sign the token 
    try{
        const {name,email,password,role}=req.body;
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({message:'User Already Exist'})
        const user=new User({name,email,password,role:role|| 'student'});

        await user.save();

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'24h'});
        const data = { id: user._id, name: user.name, email: user.email, role: user.role };
        res.status(201).json({ message: 'User registered Successfully', token, user: data });
    }
    catch(err)
    {
        res.status(500).json({message:'Error registering user',error:err.message});
    }
};

export const login= async(req,res)=>{
    // take data from body -> check if user don't exist (findOne by email) -> compare the password -> sign the token 
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(!user) return res.status(401).json({message:'Invalid Credentials'});

        const isMatch = await  user.comparePassword(password);
        if(!isMatch) res.status(401).json({message:'Invalid Credentials'});

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'24h'});

        res.json({message:'Login Successful',token,user:{id:user._id,name:user.name,email:user.email,role:user.role}});

    }catch(err)
    {
        res.status(500).json({message:'Error Logging in',error:error.message});
    }
}

export const getCurrentUser = async (req,res) =>{
    try{
        const user= await User.findbyId(req.user.id).select('-password');
        res.json(user);
    }
    catch(err)
    {
        res.status(500).json({message: 'Error fetching user', error: error.message});
    }
}