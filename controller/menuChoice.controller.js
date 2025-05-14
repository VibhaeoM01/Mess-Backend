import Menu from '../models/menu.model.js';
import MenuChoice from '../models/menuChoice.model.js';

// Get today's menu
export const getTodayMenu = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const menus = await Menu.find({ date: today });
        
        // Get student's choices for these menus
        const choices = await MenuChoice.find({
            studentId: req.user.id,
            menuId: { $in: menus.map(menu => menu._id) }
        });

        // Combine menu data with student's choices
        const menuWithChoices = menus.map(menu => {
            const choice = choices.find(c => c.menuId.toString() === menu._id.toString());
            return {
                ...menu.toObject(),
                studentChoice: choice ? choice.willEat : null,
                isLocked: isMenuLocked(menu)
            };
        });

        res.status(200).json(menuWithChoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Submit food choice
export const submitChoice = async (req, res) => {
    try {
        const { menuId, willEat } = req.body;
        
        // Check if menu exists
        const menu = await Menu.findById(menuId);
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        // Check if menu is locked
        if (isMenuLocked(menu)) {
            return res.status(400).json({ message: 'Menu is locked. Cannot change choice.' });
        }

        // Create or update choice
        const choice = await MenuChoice.findOneAndUpdate(
            { menuId, studentId: req.user.id },
            { willEat },
            { upsert: true, new: true }
        );

        res.status(200).json(choice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get student's choice for a specific menu
export const getStudentChoice = async (req, res) => {
    try {
        const choice = await MenuChoice.findOne({
            menuId: req.params.menuId,
            studentId: req.user.id
        });

        if (!choice) {
            return res.status(404).json({ message: 'Choice not found' });
        }

        res.status(200).json(choice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to check if menu is locked
const isMenuLocked = (menu) => {
    const now = new Date();
    const menuDate = new Date(menu.date);
    const cutoffTime = new Date(menu.cutoff);
    
    // Set the cutoff time for the menu date
    cutoffTime.setFullYear(menuDate.getFullYear());
    cutoffTime.setMonth(menuDate.getMonth());
    cutoffTime.setDate(menuDate.getDate());

    return now >= cutoffTime;
}; 