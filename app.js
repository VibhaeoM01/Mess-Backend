import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import menuRoutes from './routes/menu.route.js';
import feedbackRoutes from './routes/feedback.route.js';
import mealCountRoutes from "./routes/mealCount.route.js";
dotenv.config();
const app = express();
 
app.use(cors({
    origin: 'http://localhost:5174',  
    credentials: true, 
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('failed to connect'));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/meal-count", mealCountRoutes);

app.listen(5000, () => {
    console.log('Server is running');
});