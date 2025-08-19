// backend/routes/timeSessionRoutes.js
import express from 'express';
import TimeSession from '../models/TimeSession.js';
import Todo from '../models/Todo.js';

const router = express.Router();

// GET /api/time-sessions - Get all time sessions with filtering
router.get('/', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            category, 
            sessionType, 
            startDate, 
            endDate,
            sortBy = 'startTime',
            sortOrder = 'desc'
        } = req.query;

        const query = {};
        
        // Add filters
        if (category) query.category = category;
        if (sessionType) query.sessionType = sessionType;
        if (startDate || endDate) {
            query.startTime = {};
            if (startDate) query.startTime.$gte = new Date(startDate);
            if (endDate) query.startTime.$lte = new Date(endDate);
        }

        const sessions = await TimeSession.find(query)
            .populate('linkedTodo', 'title description')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await TimeSession.countDocuments(query);

        res.json({
            success: true,
            data: sessions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalSessions: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/time-sessions - Create a new time session
router.post('/', async (req, res) => {
    try {
        const {
            sessionType,
            category,
            description,
            duration,
            plannedDuration,
            startTime,
            endTime,
            completed,
            productivity,
            tags,
            linkedTodo
        } = req.body;

        // Validate required fields
        if (!sessionType || !category || !duration || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: sessionType, category, duration, startTime, endTime'
            });
        }

        const session = new TimeSession({
            sessionType,
            category,
            description,
            duration,
            plannedDuration,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            completed,
            productivity,
            tags,
            linkedTodo
        });

        await session.save();
        await session.populate('linkedTodo', 'title description');

        // If linked to a todo, update the todo's actual time
        if (linkedTodo) {
            const todo = await Todo.findById(linkedTodo);
            if (todo) {
                await todo.addTimeSpent(Math.round(duration / 60)); // Convert seconds to minutes
            }
        }

        res.status(201).json({
            success: true,
            data: session,
            message: 'Time session created successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/time-sessions/:id - Get a specific time session
router.get('/:id', async (req, res) => {
    try {
        const session = await TimeSession.findById(req.params.id)
            .populate('linkedTodo');
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Time session not found'
            });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/time-sessions/:id - Update a time session
router.put('/:id', async (req, res) => {
    try {
        const session = await TimeSession.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('linkedTodo', 'title description');

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Time session not found'
            });
        }

        res.json({
            success: true,
            data: session,
            message: 'Time session updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/time-sessions/:id - Delete a time session
router.delete('/:id', async (req, res) => {
    try {
        const session = await TimeSession.findByIdAndDelete(req.params.id);
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Time session not found'
            });
        }

        res.json({
            success: true,
            message: 'Time session deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/time-sessions/categories/list - Get all unique categories
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await TimeSession.distinct('category');
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/time-sessions/today/summary - Get today's time tracking summary
router.get('/today/summary', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const sessions = await TimeSession.find({
            startTime: { $gte: today, $lt: tomorrow }
        });

        const summary = {
            totalSessions: sessions.length,
            totalTime: sessions.reduce((sum, session) => sum + session.duration, 0),
            focusTime: sessions
                .filter(s => s.sessionType === 'focus')
                .reduce((sum, session) => sum + session.duration, 0),
            breakTime: sessions
                .filter(s => s.sessionType === 'break')
                .reduce((sum, session) => sum + session.duration, 0),
            averageProductivity: sessions
                .filter(s => s.productivity)
                .reduce((sum, session, _, arr) => sum + session.productivity / arr.length, 0) || 0,
            categoriesBreakdown: {}
        };

        // Calculate category breakdown
        sessions.forEach(session => {
            if (!summary.categoriesBreakdown[session.category]) {
                summary.categoriesBreakdown[session.category] = 0;
            }
            summary.categoriesBreakdown[session.category] += session.duration;
        });

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;