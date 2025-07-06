import mongoose from 'mongoose';

const messSchema = new mongoose.Schema({
    messId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    messName: { 
        type: String, 
        required: true 
    },
    managerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    managerEmail: { 
        type: String, 
        required: true 
    },
    subscriptionStatus: { 
        type: String, 
        enum: ['active', 'inactive', 'expired'], 
        default: 'inactive' 
    },
    subscriptionStartDate: { 
        type: Date, 
        default: null 
    },
    subscriptionEndDate: { 
        type: Date, 
        default: null 
    },
    paymentStatus: { 
        type: String, 
        enum: ['paid', 'pending', 'failed'], 
        default: 'pending' 
    },
    studentCount: { 
        type: Number, 
        default: 0 
    },
    maxStudents: { 
        type: Number, 
        default: 100 // Default limit
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Mess = mongoose.model('Mess', messSchema);

export default Mess;
