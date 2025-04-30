import Menu from "../models/menu.model.js";

export const getTodaysMenu = async(req,res)=>{
    try{
        const todaysday= new Date().toLocaleString('en-US',{weekday:'long'});
        const todaysMenu=await Menu.find({day:todaysday});

        res.status(200).json(todaysMenu);
    }
    catch(e)
    {
        console.log(e);
        res.status(500).json({message:"Failed to fetch TodaysMenu"});
    }
}

export const getMenuChart = async(req,res)=>{
    try{
        const menu=await Menu.find();
        res.status(200).json(menu);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({message:"Unable to fetch menu"});
    }
}
export const UpdateMenu = async(req,res)=>{
    
    try{
        const {id} = req.params;
        const {mealType,items,image,day}= req.body;
        if (!mealType || !items || !day) {
            return res.status(400).json({ message: 'Invalid request body' });
          }
        const updated=await Menu.findByIdAndUpdate(
            id,
            {
                mealType,
                items,
                image,
                day
            },
            {new:true}
        )
        if (!updated) {
            return res.status(404).json({ message: 'Menu not found' });
          }
          
          res.status(200).json({ message: 'Menu updated successfully', data: updated });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({message:'Failed to update menu'});
    }
};

export const AddMenu= async(req,res)=>{
    try{
        // const {mealType,items,image,day}= req.body;
        const menus= Array.isArray(req.body) ? req.body : [req.body];

        for(const {day,mealType} of menus)
        {
            const existing = await Menu.findOne({ day, mealType });  // findOne returns obj and find return arr.. so while doing find... checking empty is checking length>0
            if (existing) {
                return res.status(400).json({ message: "Menu already exists for this day and meal type" });
            }
            
        }        
        const saved = await Menu.insertMany(menus);
        res.status(201).json({message:"Menus added successfully", data:saved})

    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({message:"Failed to add Menu"});
    }
};