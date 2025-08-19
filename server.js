import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectMongoDB from './backend/lib/connectMongoDB.js';

// Import routes
import timeSessionRoutes from './backend/routes/timeSessionRoutes.js';
import todoRoutes from './backend/routes/todoRoutes.js';
import analyticsRoutes from './backend/routes/analyticsRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (if you plan to use a frontend)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: "Personal Time Tracker API",
        version: "1.0.0",
        endpoints: {
            timeSessions: "/api/time-sessions",
            todos: "/api/todos",
            analytics: "/api/analytics"
        }
    });
});

app.use('/api/time-sessions', timeSessionRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
    console.log(`Time Tracker API available at http://localhost:${PORT}`);
    connectMongoDB();
});