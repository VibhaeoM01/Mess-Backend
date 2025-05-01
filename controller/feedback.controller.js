// import User from "../models/User.model";
import Feedback from "../models/Feedback.model.js"
import Menu from "../models/menu.model.js";
import {getMealDateTime} from "../utils/timeUtils.js"
export const submitFeedback= async(req,res)=>{
    try{
        const menuId = req.params.id; 
        const {willEat,comment}=req.body;
        const studentId= req.user.id;
        const today = new Date().toLocaleString('en-US', { weekday: 'long' });
        
        const menu = await Menu.findById(menuId);
        if(!menu) return res.status(404).json({message:"Meny not found for today"});

        const now = new Date();
        const mealType=menu.mealType;
        const cuttofftime=getMealDateTime(mealType,-4);
        const commentOpentime=getMealDateTime(mealType,2);

        let feedback=await Feedback.findOne({studentId,menuId:menu._id});
        if(!feedback) feedback= new Feedback({studentId,menuId:menu._id});

        if(willEat !== undefined)
        {
            if(now>cuttofftime) return res.status(403).json({message:"Time closed"});
            feedback.willEat=willEat;
        }

        if(commentOpentime !== undefined)
        {
            if(now<cuttofftime) return res.status(403).json({message:"Commenting not open yet"});
            feedback.commentOpentime=commentOpentime;
        }
        await feedback.save();
        res.status(200).json({message:"Feedback saved successfully",feedback});

    }catch(err)
    {
        console.log(err);
        res.status(500).json({ message: "Something went wrong" });
    }
}
export const getComments = async (req, res) => {
    try {
        const menuId = req.params.id;  
 
        const comments = await Feedback.find({ menuId, comment: { $ne: null } }, "comment studentId")
            .populate("studentId", "name email");  

        if (!comments || comments.length === 0) {
            return res.status(404).json({ message: "No comments found for this menu" });
        }

        res.status(200).json({ message: "Comments retrieved successfully", data: comments });
    } catch (err) {
        console.error("Error in getComments:", err.message);
        res.status(500).json({ message: "Failed to retrieve comments", error: err.message });
    }
};

export const getWillEatCounts = async (req, res) => {
    try {
        const menuId = req.params.id; // Extract menuId from the URL
 
        const countWillEat = await Feedback.countDocuments({ menuId, willEat: true });
        const countWillNotEat = await Feedback.countDocuments({ menuId, willEat: false });

        res.status(200).json({
            message: "Counts retrieved successfully",
            data: {
                willEat: countWillEat,
                willNotEat: countWillNotEat,
            },
        });
    } catch (err) {
        console.error("Error in getWillEatCounts:", err.message);
        res.status(500).json({ message: "Failed to retrieve counts", error: err.message });
    }
};