import Menu from '../models/Menu.model';

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
        const menu=await menu.find();
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
        const id = req.params;
        const {mealType,items,image,day}= req.body;

        const updated=await Menu.findByIdAndUpdate(
            id,
            {
                mealType,
                items,
                image,
                day
            },
        )
        if (!updated) {
            return res.status(404).json({ message: 'Menu not found' });
          }
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({message:'Failed to update menu'});
    }
};

export const AddMenu= async(req,res)=>{
    try{
        const {mealType,items,image,day}= req.body;
        const existing  = await Menu.find({day});
        if(existing) return res.status(400).json({message:"Menu exist already"});

        const newEntry= new Menu({
            mealType,items,image,day
        });
        const savedMenu=await newEntry.save();
        res.status(201).json(savedMenu)

    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({message:"Failed to add Menu"});
    }
};