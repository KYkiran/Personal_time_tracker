// backend/routes/analyticsRoutes.js
import express from 'express';
import TimeSession from '../models/TimeSession.js';
import Todo from '../models/Todo.js';

const router = express.Router();

// GET /api/analytics/dashboard - Get comprehensive dashboard analytics
router.get('/dashboard', async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        
        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();
        
        switch (period) {
            case '1d':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        const [
            timeStats,
            productivityStats,
            categoryBreakdown,
            sessionTypeBreakdown,
            todoStats,
            dailyBreakdown
        ] = await Promise.all([
            getTimeStats(startDate, endDate),
            getProductivityStats(startDate, endDate),
            getCategoryBreakdown(startDate, endDate),
            getSessionTypeBreakdown(startDate, endDate),
            getTodoAnalytics(startDate, endDate),
            getDailyBreakdown(startDate, endDate)
        ]);

        res.json({
            success: true,
            data: {
                period,
                dateRange: { startDate, endDate },
                timeStats,
                productivityStats,
                categoryBreakdown,
                sessionTypeBreakdown,
                todoStats,
                dailyBreakdown
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/analytics/time-tracking - Detailed time tracking analytics
router.get('/time-tracking', async (req, res) => {
    try {
        const { 
            startDate, 
            endDate, 
            groupBy = 'day',
            category,
            sessionType 
        } = req.query;

        let matchQuery = {};
        
        if (startDate && endDate) {
            matchQuery.startTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (category) matchQuery.category = category;
        if (sessionType) matchQuery.sessionType = sessionType;

        // Group by specified period
        let groupId;
        switch (groupBy) {
            case 'hour':
                groupId = {
                    year: { $year: '$startTime' },
                    month: { $month: '$startTime' },
                    day: { $dayOfMonth: '$startTime' },
                    hour: { $hour: '$startTime' }
                };
                break;
            case 'day':
                groupId = {
                    year: { $year: '$startTime' },
                    month: { $month: '$startTime' },
                    day: { $dayOfMonth: '$startTime' }
                };
                break;
            case 'week':
                groupId = {
                    year: { $year: '$startTime' },
                    week: { $week: '$startTime' }
                };
                break;
            case 'month':
                groupId = {
                    year: { $year: '$startTime' },
                    month: { $month: '$startTime' }
                };
                break;
            default:
                groupId = {
                    year: { $year: '$startTime' },
                    month: { $month: '$startTime' },
                    day: { $dayOfMonth: '$startTime' }
                };
        }

        const analytics = await TimeSession.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: groupId,
                    totalSessions: { $sum: 1 },
                    totalDuration: { $sum: '$duration' },
                    avgDuration: { $avg: '$duration' },
                    avgProductivity: { $avg: '$productivity' },
                    focusSessions: {
                        $sum: { $cond: [{ $eq: ['$sessionType', 'focus'] }, 1, 0] }
                    },
                    focusTime: {
                        $sum: { $cond: [{ $eq: ['$sessionType', 'focus'] }, '$duration', 0] }
                    },
                    breakTime: {
                        $sum: { $cond: [{ $eq: ['$sessionType', 'break'] }, '$duration', 0] }
                    }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.json({
            success: true,
            data: analytics,
            metadata: {
                groupBy,
                totalRecords: analytics.length,
                filters: { category, sessionType }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/analytics/productivity - Productivity analysis
router.get('/productivity', async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));

        const productivityTrends = await TimeSession.aggregate([
            {
                $match: {
                    startTime: { $gte: startDate, $lte: endDate },
                    productivity: { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$startTime' },
                        month: { $month: '$startTime' },
                        day: { $dayOfMonth: '$startTime' }
                    },
                    avgProductivity: { $avg: '$productivity' },
                    totalSessions: { $sum: 1 },
                    focusTime: {
                        $sum: { $cond: [{ $eq: ['$sessionType', 'focus'] }, '$duration', 0] }
                    }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Category-wise productivity
        const categoryProductivity = await TimeSession.aggregate([
            {
                $match: {
                    startTime: { $gte: startDate, $lte: endDate },
                    productivity: { $exists: true }
                }
            },
            {
                $group: {
                    _id: '$category',
                    avgProductivity: { $avg: '$productivity' },
                    totalSessions: { $sum: 1 },
                    totalDuration: { $sum: '$duration' }
                }
            },
            { $sort: { avgProductivity: -1 } }
        ]);

        // Hour-wise productivity patterns
        const hourlyProductivity = await TimeSession.aggregate([
            {
                $match: {
                    startTime: { $gte: startDate, $lte: endDate },
                    productivity: { $exists: true }
                }
            },
            {
                $group: {
                    _id: { $hour: '$startTime' },
                    avgProductivity: { $avg: '$productivity' },
                    sessionCount: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                trends: productivityTrends,
                categoryBreakdown: categoryProductivity,
                hourlyPatterns: hourlyProductivity
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/analytics/habits - Habit tracking and patterns
router.get('/habits', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(days));

        // Weekly patterns
        const weeklyPatterns = await TimeSession.aggregate([
            {
                $match: {
                    startTime: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: '$startTime' },
                    totalDuration: { $sum: '$duration' },
                    sessionCount: { $sum: 1 },
                    avgSessionLength: { $avg: '$duration' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Consistency score (days with at least one focus session)
        const dailyFocusSessions = await TimeSession.aggregate([
            {
                $match: {
                    startTime: { $gte: startDate, $lte: endDate },
                    sessionType: 'focus'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$startTime' },
                        month: { $month: '$startTime' },
                        day: { $dayOfMonth: '$startTime' }
                    },
                    hasFocusSession: { $max: 1 }
                }
            }
        ]);

        const consistencyScore = Math.round(
            (dailyFocusSessions.length / parseInt(days)) * 100
        );

        // Peak performance hours
        const peakHours = await TimeSession.aggregate([
            {
                $match: {
                    startTime: { $gte: startDate, $lte: endDate },
                    sessionType: 'focus',
                    productivity: { $exists: true }
                }
            },
            {
                $group: {
                    _id: { $hour: '$startTime' },
                    avgProductivity: { $avg: '$productivity' },
                    totalDuration: { $sum: '$duration' },
                    sessionCount: { $sum: 1 }
                }
            },
            { $sort: { avgProductivity: -1 } },
            { $limit: 3 }
        ]);

        res.json({
            success: true,
            data: {
                weeklyPatterns,
                consistencyScore,
                peakHours,
                totalDaysAnalyzed: parseInt(days),
                activeDays: dailyFocusSessions.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/analytics/goals - Goal achievement analytics
router.get('/goals', async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));

        // Time goals vs actual
        const timeGoalsAnalysis = await TimeSession.aggregate([
            {
                $match: {
                    startTime: { $gte: startDate, $lte: endDate },
                    plannedDuration: { $exists: true },
                    sessionType: 'focus'
                }
            },
            {
                $group: {
                    _id: null,
                    totalPlannedTime: { $sum: '$plannedDuration' },
                    totalActualTime: { $sum: '$duration' },
                    completedSessions: {
                        $sum: { $cond: ['$completed', 1, 0] }
                    },
                    totalSessions: { $sum: 1 }
                }
            }
        ]);

        // Todo completion analysis
        const todoAnalysis = await Todo.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalTodos: { $sum: 1 },
                    completedTodos: {
                        $sum: { $cond: ['$completed', 1, 0] }
                    },
                    totalEstimatedTime: { $sum: '$estimatedTime' },
                    totalActualTime: { $sum: '$actualTime' }
                }
            }
        ]);

        const goalData = {
            timeGoals: timeGoalsAnalysis[0] || {
                totalPlannedTime: 0,
                totalActualTime: 0,
                completedSessions: 0,
                totalSessions: 0
            },
            todoGoals: todoAnalysis[0] || {
                totalTodos: 0,
                completedTodos: 0,
                totalEstimatedTime: 0,
                totalActualTime: 0
            }
        };

        // Calculate achievement rates
        if (goalData.timeGoals.totalPlannedTime > 0) {
            goalData.timeGoals.achievementRate = Math.round(
                (goalData.timeGoals.totalActualTime / goalData.timeGoals.totalPlannedTime) * 100
            );
        }

        if (goalData.todoGoals.totalTodos > 0) {
            goalData.todoGoals.completionRate = Math.round(
                (goalData.todoGoals.completedTodos / goalData.todoGoals.totalTodos) * 100
            );
        }

        res.json({
            success: true,
            data: goalData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Helper functions
async function getTimeStats(startDate, endDate) {
    const stats = await TimeSession.aggregate([
        {
            $match: {
                startTime: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                totalTime: { $sum: '$duration' },
                avgSessionLength: { $avg: '$duration' },
                focusTime: {
                    $sum: { $cond: [{ $eq: ['$sessionType', 'focus'] }, '$duration', 0] }
                },
                breakTime: {
                    $sum: { $cond: [{ $eq: ['$sessionType', 'break'] }, '$duration', 0] }
                }
            }
        }
    ]);

    return stats[0] || {
        totalSessions: 0,
        totalTime: 0,
        avgSessionLength: 0,
        focusTime: 0,
        breakTime: 0
    };
}

async function getProductivityStats(startDate, endDate) {
    const stats = await TimeSession.aggregate([
        {
            $match: {
                startTime: { $gte: startDate, $lte: endDate },
                productivity: { $exists: true }
            }
        },
        {
            $group: {
                _id: null,
                avgProductivity: { $avg: '$productivity' },
                sessionsWithRating: { $sum: 1 }
            }
        }
    ]);

    return stats[0] || { avgProductivity: 0, sessionsWithRating: 0 };
}

async function getCategoryBreakdown(startDate, endDate) {
    return await TimeSession.aggregate([
        {
            $match: {
                startTime: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$category',
                totalTime: { $sum: '$duration' },
                sessionCount: { $sum: 1 }
            }
        },
        { $sort: { totalTime: -1 } }
    ]);
}

async function getSessionTypeBreakdown(startDate, endDate) {
    return await TimeSession.aggregate([
        {
            $match: {
                startTime: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$sessionType',
                totalTime: { $sum: '$duration' },
                sessionCount: { $sum: 1 }
            }
        }
    ]);
}

async function getTodoAnalytics(startDate, endDate) {
    const [todoStats] = await Todo.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                totalTodos: { $sum: 1 },
                completedTodos: { $sum: { $cond: ['$completed', 1, 0] } },
                avgActualTime: { $avg: '$actualTime' },
                totalActualTime: { $sum: '$actualTime' }
            }
        }
    ]);

    return todoStats || {
        totalTodos: 0,
        completedTodos: 0,
        avgActualTime: 0,
        totalActualTime: 0
    };
}

async function getDailyBreakdown(startDate, endDate) {
    return await TimeSession.aggregate([
        {
            $match: {
                startTime: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$startTime' },
                    month: { $month: '$startTime' },
                    day: { $dayOfMonth: '$startTime' }
                },
                totalTime: { $sum: '$duration' },
                sessionCount: { $sum: 1 },
                focusTime: {
                    $sum: { $cond: [{ $eq: ['$sessionType', 'focus'] }, '$duration', 0] }
                }
            }
        },
        { $sort: { '_id': 1 } }
    ]);
}

export default router;