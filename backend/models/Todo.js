// backend/models/Todo.js
import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    }
});

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true,
        default: 'General'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'completed', 'cancelled'],
        default: 'todo'
    },
    dueDate: {
        type: Date
    },
    estimatedTime: {
        type: Number, // Estimated time in minutes
        min: 0
    },
    actualTime: {
        type: Number, // Actual time spent in minutes
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    subtasks: [subtaskSchema],
    tags: [{
        type: String,
        trim: true
    }],
    reminder: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for better query performance
todoSchema.index({ status: 1 });
todoSchema.index({ priority: 1 });
todoSchema.index({ dueDate: 1 });
todoSchema.index({ category: 1 });

// Virtual for completion percentage
todoSchema.virtual('completionPercentage').get(function() {
    if (this.subtasks.length === 0) {
        return this.completed ? 100 : 0;
    }
    const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Virtual for overdue status
todoSchema.virtual('isOverdue').get(function() {
    if (!this.dueDate || this.completed) return false;
    return new Date() > this.dueDate;
});

// Pre-save middleware to update completed status based on subtasks
todoSchema.pre('save', function(next) {
    if (this.subtasks.length > 0) {
        const allSubtasksCompleted = this.subtasks.every(subtask => subtask.completed);
        if (allSubtasksCompleted && !this.completed) {
            this.completed = true;
            this.completedAt = new Date();
            this.status = 'completed';
        } else if (!allSubtasksCompleted && this.completed) {
            this.completed = false;
            this.completedAt = null;
            this.status = 'in-progress';
        }
    }
    next();
});

// Static method to get todos by status
todoSchema.statics.getByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to get overdue todos
todoSchema.statics.getOverdue = function() {
    return this.find({
        dueDate: { $lt: new Date() },
        completed: false
    }).sort({ dueDate: 1 });
};

// Static method to get upcoming todos (due in next 7 days)
todoSchema.statics.getUpcoming = function(days = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return this.find({
        dueDate: { $gte: now, $lte: futureDate },
        completed: false
    }).sort({ dueDate: 1 });
};

// Method to mark todo as completed
todoSchema.methods.markCompleted = function() {
    this.completed = true;
    this.completedAt = new Date();
    this.status = 'completed';
    return this.save();
};

// Method to add time spent
todoSchema.methods.addTimeSpent = function(minutes) {
    this.actualTime += minutes;
    return this.save();
};

const Todo = mongoose.model('Todo', todoSchema);
export default Todo;