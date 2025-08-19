// backend/models/TimeSession.js
import mongoose from 'mongoose';

const timeSessionSchema = new mongoose.Schema({
    sessionType: {
        type: String,
        required: true,
        enum: ['focus', 'break', 'stopwatch'],
        default: 'focus'
    },
    category: {
        type: String,
        required: true,
        default: 'General'
    },
    description: {
        type: String,
        trim: true
    },
    duration: {
        type: Number, // Duration in seconds
        required: true,
        min: 0
    },
    plannedDuration: {
        type: Number, // For focus timer - planned duration in seconds
        min: 0
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    productivity: {
        type: Number,
        min: 1,
        max: 10 // Self-rated productivity scale
    },
    tags: [{
        type: String,
        trim: true
    }],
    linkedTodo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Todo'
    }
}, {
    timestamps: true
});

// Index for better query performance
timeSessionSchema.index({ startTime: -1 });
timeSessionSchema.index({ category: 1 });
timeSessionSchema.index({ sessionType: 1 });

// Virtual for formatted duration
timeSessionSchema.virtual('formattedDuration').get(function() {
    const hours = Math.floor(this.duration / 3600);
    const minutes = Math.floor((this.duration % 3600) / 60);
    const seconds = this.duration % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
});

// Static method to get sessions by date range
timeSessionSchema.statics.getSessionsByDateRange = function(startDate, endDate) {
    return this.find({
        startTime: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    }).populate('linkedTodo').sort({ startTime: -1 });
};

// Static method to get productivity statistics
timeSessionSchema.statics.getProductivityStats = function(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.aggregate([
        {
            $match: {
                startTime: { $gte: startDate },
                productivity: { $exists: true }
            }
        },
        {
            $group: {
                _id: null,
                avgProductivity: { $avg: '$productivity' },
                totalSessions: { $sum: 1 },
                totalDuration: { $sum: '$duration' }
            }
        }
    ]);
};

const TimeSession = mongoose.model('TimeSession', timeSessionSchema);
export default TimeSession;