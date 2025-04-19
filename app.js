import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import menuRoutes from './routes/menu.route.js';
import feedbackRoutes from './routes/feedback.route.js';
dotenv.config();
const app=express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(()=>console.log('Connected to MongoDB'))
.catch((err)=>console.error('failed to connect'))

app.use("/api/auth", authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/menus",menuRoutes)
app.use("/api/feedbacks",feedbackRoutes)

app.listen(5000,()=>{
    console.log('Server is running');
})