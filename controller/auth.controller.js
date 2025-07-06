import User from "../models/User.model.js";
import Mess from "../models/Mess.model.js";
import jwt from "jsonwebtoken";

import MealCount from "../models/MenuCount.js"; // adjust path if needed

// Generate unique Mess ID
const generateMessId = () => {
  const prefix = 'MESS';
  const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
  return `${prefix}${randomNum}`;
};

// Create a new Mess ID (for managers)
export const createMessId = async (req, res) => {
  try {
    const { messName } = req.body;
    const userId = req.user.id;
    
    console.log('Creating Mess ID for user:', userId, 'with name:', messName);
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found:', user.email, 'role:', user.role);
    
    // Only mess managers and super admins can create Mess IDs
    if (user.role !== 'mess_manager' && user.role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Only Mess Managers can create Mess IDs. Please create an account as a Mess Manager.',
        requiresRole: 'mess_manager'
      });
    }
    
    // Check if user already has a Mess ID
    const existingMess = await Mess.findOne({ managerId: userId });
    if (existingMess) {
      console.log('User already has mess ID:', existingMess.messId);
      return res.status(400).json({ 
        message: 'You already have a Mess ID', 
        messId: existingMess.messId 
      });
    }
    
    let messId;
    let isUnique = false;
    
    // Generate unique Mess ID
    while (!isUnique) {
      messId = generateMessId();
      const existingMessWithId = await Mess.findOne({ messId });
      if (!existingMessWithId) {
        isUnique = true;
      }
    }
    
    // Create new mess
    const newMess = new Mess({
      messId,
      messName,
      managerId: userId,
      managerEmail: user.email,
      subscriptionStatus: 'inactive', // Will be activated after payment
      paymentStatus: 'pending'
    });
    
    await newMess.save();
    
    // Update user with messId
    await User.findByIdAndUpdate(userId, { messId });
    
    res.status(201).json({
      message: 'Mess ID created successfully',
      messId,
      messName,
      note: 'Please complete payment to activate your Mess ID'
    });
  } catch (error) {
    console.error('Error creating Mess ID:', error);
    res.status(500).json({ message: 'Error creating Mess ID', error: error.message });
  }
};

// Join a mess (for students)
export const joinMess = async (req, res) => {
  try {
    const { messId } = req.body;
    const userId = req.user.id;
    
    // Check if user is a student
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can join messes' });
    }
    
    // Check if mess exists and is active
    const mess = await Mess.findOne({ messId });
    if (!mess) {
      return res.status(404).json({ message: 'Mess ID not found' });
    }
    
    if (mess.subscriptionStatus !== 'active') {
      return res.status(400).json({ 
        message: 'This mess is not currently active. Please contact your mess manager.' 
      });
    }
    
    // Check if mess has reached student limit
    if (mess.studentCount >= mess.maxStudents) {
      return res.status(400).json({ 
        message: 'This mess has reached its student limit' 
      });
    }
    
    // Check if user is already in a mess
    if (user.messId) {
      return res.status(400).json({
        message: 'You are already part of a mess. Please leave your current mess first.' 
      });
    }
    
    // Add user to mess
    await User.findByIdAndUpdate(userId, { 
      messId,
      subscriptionStatus: 'active' 
    });
    
    // Increment student count
    await Mess.findByIdAndUpdate(mess._id, { 
      $inc: { studentCount: 1 } 
    });
    
    res.status(200).json({
      message: 'Successfully joined mess',
      messId,
      messName: mess.messName
    });
  } catch (error) {
    console.error('Error joining mess:', error);
    res.status(500).json({ message: 'Error joining mess', error: error.message });
  }
};

// Get mess details
export const getMessDetails = async (req, res) => {
  try {
    const { messId } = req.params;
    
    console.log('Searching for mess with ID:', messId);
    
    // Debug: Check if any mess exists at all
    const totalMesses = await Mess.countDocuments();
    console.log('Total messes in database:', totalMesses);
    
    if (totalMesses === 0) {
      console.log('No messes found in database');
      return res.status(404).json({ 
        message: 'No messes exist in the database. Please create a Mess ID first.',
        debug: 'database_empty'
      });
    }
    
    // Try to find the specific mess
    const mess = await Mess.findOne({ messId }).populate('managerId', 'name email');
    
    if (!mess) {
      // Debug: Show all existing mess IDs
      const allMessIds = await Mess.find({}, 'messId messName').lean();
      console.log('Mess not found. Available mess IDs:', allMessIds);
      
      return res.status(404).json({ 
        message: 'Mess not found',
        searchedFor: messId,
        availableMessIds: allMessIds.map(m => m.messId),
        debug: 'mess_not_found'
      });
    }
    
    console.log('Mess found:', mess.messId, mess.messName);
    
    // Get student count
    const studentCount = await User.countDocuments({ messId, role: 'student' });
    
    res.status(200).json({
      messId: mess.messId,
      messName: mess.messName,
      manager: mess.managerId,
      subscriptionStatus: mess.subscriptionStatus,
      paymentStatus: mess.paymentStatus,
      subscriptionStartDate: mess.subscriptionStartDate,
      subscriptionEndDate: mess.subscriptionEndDate,
      studentCount,
      maxStudents: mess.maxStudents
    });
  } catch (error) {
    console.error('Error fetching mess details:', error);
    res.status(500).json({ message: 'Error fetching mess details', error: error.message });
  }
};

// Get user's mess information
export const getUserMess = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user.messId) {
      return res.status(404).json({ message: 'User is not part of any mess' });
    }
    
    const mess = await Mess.findOne({ messId: user.messId }).populate('managerId', 'name email');
    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }
    
    res.status(200).json({
      messId: mess.messId,
      messName: mess.messName,
      manager: mess.managerId,
      subscriptionStatus: mess.subscriptionStatus,
      userRole: user.role,
      isManager: user._id.equals(mess.managerId)
    });
  } catch (error) {
    console.error('Error fetching user mess:', error);
    res.status(500).json({ message: 'Error fetching user mess', error: error.message });
  }
};

// Get all mess details (Admin/Debug function)
export const getAllMessDetails = async (req, res) => {
  try {
    console.log('Fetching all mess details...');
    
    // Get all messes with manager details and student counts
  const allMesses = await Mess.find()
  .select('messId messName managerId subscriptionStatus paymentStatus createdAt')
  .populate('managerId', 'name email role')
  .sort({ createdAt: -1 });

    
    // Get student count for each mess
    const messesWithStudentCount = await Promise.all(
      allMesses.map(async (mess) => {
        const studentCount = await User.countDocuments({ 
          messId: mess.messId, 
          role: 'student' 
        });
        
        return {
          _id: mess.id,
          messId: mess.messId,
          messName: mess.messName,
          manager: {
            id: mess.managerId.id,
            name: mess.managerId.name,
            email: mess.managerId.email,
            role: mess.managerId.role
          },
          subscriptionStatus: mess.subscriptionStatus,
          paymentStatus: mess.paymentStatus,
          studentCount,
          createdAt: mess.createdAt,
          // Calculate days since creation
          daysSinceCreation: Math.floor((Date.now() - mess.createdAt) / (1000 * 60 * 60 * 24))
        };
      })
    );
    
    // Calculate summary statistics
    const summary = {
      totalMesses: allMesses.length,
      activeMesses: allMesses.filter(m => m.subscriptionStatus === 'active').length,
      inactiveMesses: allMesses.filter(m => m.subscriptionStatus === 'inactive').length,
      totalStudents: messesWithStudentCount.reduce((sum, mess) => sum + mess.studentCount, 0),
      paidMesses: allMesses.filter(m => m.paymentStatus === 'paid').length,
      pendingPayments: allMesses.filter(m => m.paymentStatus === 'pending').length
    };
    
    console.log('Found', allMesses.length, 'messes with', summary.totalStudents, 'total students');
    
    res.status(200).json({
      success: true,
      summary,
      count: messesWithStudentCount.length,
      messes: messesWithStudentCount
    });
    
  } catch (error) {
    console.error('Error fetching all mess details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching mess details', 
      error: error.message 
    });
  }
};

export const deleteCurrentAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id); // its suggested to use req.user.id , which has info to currently logged in user.. to avoid deleting  other user by mistake
    res.status(200).json({ message: "Account deleted Succesfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete account", error: err.message });
  }
};
export const UpdatedAccount = async (req, res) => {
  try {
    const { email, name } = req.body;
    const updatesUser = await User.findByIdAndUpdate(
      req.user.id,
      { email, name },
      { new: true }
    );
    res.status(200).json({ message: "Account Details Updated" });
  } catch (err) {
    res.status(500).json({message:"Failed to Update the user"});
    console.log(err);
  }
};
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User Already Exist" });
    const user = new User({ name, email, password, role: role || "student" });

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "24h",
    });

    const data = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Increment meal counts only if the user is a student
    if (user.role === "student") {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const meals = ["breakfast", "lunch", "snacks", "dinner"];
      for (const day of days) {
        for (const mealType of meals) {
          await MealCount.findOneAndUpdate(
            { day, mealType },
            { $inc: { count: 1 } },
            { upsert: true }
          );
        }
      }
    }

    res
      .status(201)
      .json({ message: "User registered Successfully", token, user: data });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

export const login = async (req, res) => {
  // take data from body -> check if user don't exist (findOne by email) -> compare the password -> sign the token
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid Credentials" });

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid Credentials" });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).json({ message: "Error Logging in", error: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); //req.user.id is from verifytoken middleware, where it decodes and verify JWT token from header and fetchs the user from DB using decoded ID and attach the user objecty to req.user
    res.json(user);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
};

//for logout , clearcookie(token)
export const logout = async (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};


