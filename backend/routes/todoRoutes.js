// backend/routes/todoRoutes.js
import express from 'express';
import Todo from '../models/Todo.js';

const router = express.Router();

// GET /api/todos - Get all todos with filtering and sorting
router.get('/', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            priority, 
            category,
            completed,
            overdue,
            upcoming,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        let query = {};
        
        // Add filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;
        if (completed !== undefined) query.completed = completed === 'true';
        
        // Special filters
        if (overdue === 'true') {
            query.dueDate = { $lt: new Date() };
            query.completed = false;
        }
        
        if (upcoming === 'true') {
            const now = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(now.getDate() + 7);
            query.dueDate = { $gte: now, $lte: nextWeek };
            query.completed = false;
        }

        // Text search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const todos = await Todo.find(query)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Todo.countDocuments(query);

        res.json({
            success: true,
            data: todos,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalTodos: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/todos - Create a new todo
router.post('/', async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            priority,
            dueDate,
            estimatedTime,
            subtasks,
            tags,
            reminder
        } = req.body;

        if (!title || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title and category are required'
            });
        }

        const todo = new Todo({
            title,
            description,
            category,
            priority,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            estimatedTime,
            subtasks,
            tags,
            reminder: reminder ? new Date(reminder) : undefined
        });

        await todo.save();

        res.status(201).json({
            success: true,
            data: todo,
            message: 'Todo created successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/todos/:id - Get a specific todo
router.get('/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        res.json({
            success: true,
            data: todo
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/todos/:id - Update a todo
router.put('/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        res.json({
            success: true,
            data: todo,
            message: 'Todo updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/todos/:id - Delete a todo
router.delete('/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);
        
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        res.json({
            success: true,
            message: 'Todo deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/todos/:id/complete - Toggle todo completion
router.patch('/:id/complete', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        if (todo.completed) {
            todo.completed = false;
            todo.completedAt = null;
            todo.status = 'todo';
        } else {
            await todo.markCompleted();
        }

        await todo.save();

        res.json({
            success: true,
            data: todo,
            message: `Todo ${todo.completed ? 'completed' : 'reopened'} successfully`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/todos/:id/subtasks - Add a subtask
router.post('/:id/subtasks', async (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Subtask title is required'
            });
        }

        const todo = await Todo.findById(req.params.id);
        
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        todo.subtasks.push({ title });
        await todo.save();

        res.json({
            success: true,
            data: todo,
            message: 'Subtask added successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/todos/:id/subtasks/:subtaskId - Toggle subtask completion
router.patch('/:id/subtasks/:subtaskId', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        const subtask = todo.subtasks.id(req.params.subtaskId);
        
        if (!subtask) {
            return res.status(404).json({
                success: false,
                message: 'Subtask not found'
            });
        }

        subtask.completed = !subtask.completed;
        subtask.completedAt = subtask.completed ? new Date() : null;

        await todo.save();

        res.json({
            success: true,
            data: todo,
            message: `Subtask ${subtask.completed ? 'completed' : 'reopened'} successfully`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/todos/stats/dashboard - Get dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalTodos,
            completedTodos,
            overdueTodos,
            todaysTodos,
            upcomingTodos
        ] = await Promise.all([
            Todo.countDocuments(),
            Todo.countDocuments({ completed: true }),
            Todo.countDocuments({ 
                dueDate: { $lt: new Date() }, 
                completed: false 
            }),
            Todo.countDocuments({ 
                dueDate: { 
                    $gte: today, 
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
                } 
            }),
            Todo.getUpcoming(7).then(todos => todos.length)
        ]);

        const completionRate = totalTodos > 0 ? 
            Math.round((completedTodos / totalTodos) * 100) : 0;

        // Get category distribution
        const categoryStats = await Todo.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get priority distribution
        const priorityStats = await Todo.aggregate([
            { $match: { completed: false } },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                totalTodos,
                completedTodos,
                overdueTodos,
                todaysTodos,
                upcomingTodos,
                completionRate,
                categoryStats,
                priorityStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/todos/categories/list - Get all unique categories
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Todo.distinct('category');
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;