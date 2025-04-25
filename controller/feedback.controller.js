// import User from "../models/User.model";
import Feedback from "../models/Feedback.model.js"
import Menu from "../models/menu.model.js";
import {getMealDateTime} from "../utils/timeUtils.js"
export const submitFeedback= async(req,res)=>{
    try{
        const {mealType,willEat,comment}=req.body;
        const studentId= req.user.id;
        const today = new Date().toLocaleString('en-US', { weekday: 'long' });
        
        const menu=await Menu.findOne({day:today,mealType});
        if(!menu) return res.status(404).json({message:"Meny not found for today"});

        const now = new Date();
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